import { Router } from "express";
import prisma from "../db";
import adminMiddleware from "../middlewares/admin.middleware";

const adminRouter = Router();

adminRouter.get("/", adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, approvedPosts] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.post.count({ where: { status: "APPROVED" } }),
      ]);

    const totalLikes = await prisma.post.aggregate({
      _sum: { likes: true },
    });

    const recentPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, email: true } },
      },
    });

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        approvedPosts,
        pendingPosts: totalPosts - approvedPosts,
        totalLikes: totalLikes._sum.likes || 0,
      },
      recentPosts,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

adminRouter.get("/users", adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    const regularUsers = totalUsers - adminCount;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await prisma.user.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await prisma.user.count({
      where: {
        posts: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
          },
        },
      },
    });

    res.json({
      totalUsers,
      adminCount,
      regularUsers,
      activeUsers,
      userGrowth,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

adminRouter.get("/media", adminMiddleware, async (req, res) => {
  try {
    const totalPosts = await prisma.post.count();
    const approvedPosts = await prisma.post.count({
      where: { status: "APPROVED" },
    });
    const pendingPosts = await prisma.post.count({
      where: { status: "PENDING" },
    });

    const totalLikes = await prisma.post.aggregate({
      _sum: { likes: true },
    });

    const totalComments = await prisma.comment.count();

    const postsByCategory = await prisma.post.groupBy({
      by: ["category"],
      _count: true,
    });

    const topPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { likes: "desc" },
      include: {
        user: { select: { username: true } },
      },
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const uploadsOverTime = await prisma.post.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      _count: true,
    });

    res.json({
      totalPosts,
      approvedPosts,
      pendingPosts,
      totalLikes: totalLikes._sum.likes || 0,
      totalComments,
      postsByCategory,
      topPosts,
      uploadsOverTime,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media analytics" });
  }
});

adminRouter.get("/pending-approvals", adminMiddleware, async (req, res) => {
  try {
    const pendingPosts = await prisma.post.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(pendingPosts || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.get("/users/list", adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { posts: true, comments: true, savedPosts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

adminRouter.get("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { post: { select: { title: true } } },
        },
        savedPosts: {
          include: { post: true },
        },
        _count: {
          select: { posts: true, comments: true, savedPosts: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

adminRouter.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } }),
      res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

adminRouter.get("/media/list", adminMiddleware, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        _count: {
          select: { comments: true, savedBy: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ posts });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

adminRouter.put("/posts/:id/approve", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.update({
      where: { id },
      data: { status: "APPROVED" },
      include: {
        user: { select: { username: true, email: true } },
      },
    });

    await prisma.notification.create({
      data: {
        postId: post.id,
        type: "MEDIA_APPROVED",
        userId: post.userId,
        mediaTitle : post.title,
        mediaUrl : post.image,
      },
    });

    res.json({ message: "Media approved successfully", post });
  } catch (error) {
    res.status(500).json({ error: "Failed to approve media" });
  }
});

adminRouter.put("/posts/:id/reject", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const post = await prisma.post.update({
      where: { id },
      data: { status: "REJECTED" },
      include: {
        user: { select: { username: true, email: true } },
      },
    });

    await prisma.notification.create({
      data: {
        postId: post.id,
        type: "MEDIA_REJECTED",
        userId: post.userId,
        message,
        mediaTitle : post.title,
        mediaUrl : post.image,
      },
    });

    res.json({ message: "Media rejected successfully", post });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject media" });
  }
});

adminRouter.delete("/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.post.delete({ where: { id } }),
      res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default adminRouter;
