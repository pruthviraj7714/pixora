import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import prisma from "../db";
import { PostCreateSchema } from "../zod/schema";

const postRouter = Router();

postRouter.post("/create", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const { data, success, error } = PostCreateSchema.safeParse(req.body);

    if (!success) {
      res.status(401).json({
        message: "Validation Failed",
        error,
      });
      return;
    }

    const { title, description, image, category } = data;

    await prisma.post.create({
      data: {
        title,
        description,
        image,
        category,
        userId,
      },
    });

    res.status(201).json({
      message: "Post Successfully Created",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const posts = await prisma.post.findMany({
      where: {
        status: "APPROVED",
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        savedBy: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
      },
    });
    res.status(200).json(posts || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.get("/post/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                firstname: true,
                lastname: true,
                username: true,
              },
            },
          },
        },
        user: {
          select: {
            username: true,
          },
        },
        savedBy: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        likedBy: {
          where: {
            userId,
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            likedBy: true,
          },
        },
      },
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.delete("/post/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.post.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      message: "Post Successfully Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.patch("/save/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const postId = req.params.id;

    if (!postId) {
      res.status(400).json({
        message: "Post Id is missing",
      });
      return;
    }

    await prisma.savedPost.create({
      data: {
        postId,
        userId,
      },
    });

    res.status(200).json({
      message: "Post Successfully Saved",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.patch("/unsave/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const postId = req.params.id;

    if (!postId) {
      res.status(400).json({
        message: "Post Id is missing",
      });
      return;
    }

    const savedPost = await prisma.savedPost.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!savedPost) {
      res.status(400).json({
        message: "Post is not saved!",
      });
      return;
    }

    await prisma.savedPost.delete({
      where: {
        id: savedPost.id,
      },
    });

    res.status(200).json({
      message: "Post Successfully Unsaved",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.patch("/toggle-like/:id", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userId!;

    if (!postId) {
      res.status(400).json({
        message: "Post Id is missing",
      });
      return;
    }

    const isLiked = await prisma.like.findFirst({
      where: {
        userId,
        postId,
      },
    });

    if (isLiked) {
      await prisma.like.delete({
        where: {
          id: isLiked.id,
        },
      });
      res.status(200).json({
        likeStatus: false,
      });
      return;
    }

    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    res.status(200).json({
      likeStatus: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.get("/similar-images", authMiddleware, async (req, res) => {
  try {
    const category = req.query.category as string;

    const posts = await prisma.post.findMany({
      where: {
        category,
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default postRouter;
