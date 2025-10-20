import { Router } from "express";
import prisma from "../db";
import adminMiddleware from "../middlewares/admin.middleware";
import { startOfYear, endOfYear } from "date-fns";

const adminRouter = Router();

adminRouter.get("/", adminMiddleware, async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, approvedPosts, totalLikes] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.comment.count(),
        prisma.post.count({ where: { status: "APPROVED" } }),
        prisma.like.count(),
      ]);

    const recentPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, email: true } },
        _count: { select: { likedBy: true, comments: true } },
      },
    });

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        approvedPosts,
        pendingPosts: totalPosts - approvedPosts,
        totalLikes,
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

    const totalLikes = await prisma.like.count();

    const totalComments = await prisma.comment.count();

    const postsByCategory = await prisma.post.groupBy({
      by: ["category"],
      _count: true,
    });

    const topPosts = await prisma.post.findMany({
      take: 10,
      orderBy: {
        likedBy: {
          _count: "desc",
        },
      },
      include: {
        user: { select: { username: true } },
        _count: { select: { likedBy: true } },
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
      totalLikes,
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

adminRouter.get("/users/user/:id", adminMiddleware, async (req, res) => {
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

adminRouter.get("/media/list", adminMiddleware, async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: { select: { id: true, username: true, email: true } },
        _count: {
          select: { comments: true, savedBy: true, likedBy: true },
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
        mediaTitle: post.title,
        mediaUrl: post.image,
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
        mediaTitle: post.title,
        mediaUrl: post.image,
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

adminRouter.get("/monthly-overview", adminMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const start = startOfYear(now);
    const end = endOfYear(now);

    const users = await prisma.user.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const posts = await prisma.post.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const approvedPosts = await prisma.post.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: {
        status: "APPROVED",
        createdAt: { gte: start, lte: end },
      },
    });

    const likes = await prisma.like.groupBy({
      by: ["likedAt"],
      _count: { _all: true },
      where: {
        likedAt: { gte: start, lte: end },
      },
    });

    const comments = await prisma.comment.groupBy({
      by: ["createdAt"],
      _count: { _all: true },
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    const formatToMonth = (data: any[]) => {
      const result = Array(12).fill(0);
      data.forEach((d) => {
        const month = new Date(d.createdAt || d.likedAt).getMonth();
        result[month] += d._count._all;
      });
      return result;
    };

    const response = {
      users: formatToMonth(users),
      posts: formatToMonth(posts),
      approvedPosts: formatToMonth(approvedPosts),
      likes: formatToMonth(likes),
      comments: formatToMonth(comments),
    };

    return res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

adminRouter.get("/pending-reports", adminMiddleware, async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        post: {
          select: {
            image: true,
            title: true,
            description: true,
          },
        },
        reporter : {
          select : {
            username : true,
            firstname : true,
            lastname : true
          }
        }
      },
    });

    res.status(200).json(reports || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default adminRouter;
