import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import prisma from "../db";

const notificationRouter = Router();

notificationRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json(notifications || []);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

notificationRouter.get("/count", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const count = await prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });

    res.status(200).json({
      count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

notificationRouter.patch(
  "/:notificationId/read",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.userId!;
      const notificationId = req.params.notificationId;

      await prisma.notification.update({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          read: true,
        },
      });

      res.status(200).json({
        message: "All Notifications Successfully Read By User",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default notificationRouter;
