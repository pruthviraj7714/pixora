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
        likes: 0,
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

postRouter.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where : {
        status : "APPROVED"
      },
      include : {
        user : {
          select : {
            username : true,
          }
        }
      }
    });
    res.status(200).json(posts || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: {
        id,
      },
    });

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

postRouter.delete("/:id", authMiddleware, async (req, res) => {
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

export default postRouter;
