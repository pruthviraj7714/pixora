import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import prisma from "../db";

const commentRouter = Router();

commentRouter.post("/post/:postId", authMiddleware, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.userId!;

    if (!postId) {
      res.status(400).json({
        message: "PostId is missing",
      });
      return;
    }

    const { text } = req.body;

    if (!text) {
      res.status(401).json({
        message: "Invalid Input",
      });
      return;
    }

    const post = await prisma.post.findFirst({
      where: {
        id: postId,
      },
    });

    if (!post) {
      res.status(400).json({
        message: "Post with given Id not found!",
      });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        userId,
        postId,
      },
    });

    res.status(200).json({
      message: "Comment Successfully Added",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

commentRouter.delete("/:commentId", authMiddleware, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId!;

    if (!commentId) {
      res.status(400).json({
        message: "Comment Id is missing",
      });
      return;
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
        userId,
      },
    });

    res.status(200).json({
      message: "Comment Successfully Deleted",
      commentId,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default commentRouter;
