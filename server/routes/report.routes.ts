import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import prisma from "../db";
import { ReportSchema } from "../zod/schema";

const reportRouter = Router();

reportRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const { success, data, error } = ReportSchema.safeParse(req.body);

    if (!success) {
      res.status(401).json({
        message: "Validation Failed",
        error,
      });
      return;
    }

    const { postId, reason } = data;

    await prisma.report.create({
      data: {
        reason,
        postId,
        reporterId: userId,
      },
    });

    res.status(201).json({
      message: "Report Successfully Submitted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default reportRouter;
