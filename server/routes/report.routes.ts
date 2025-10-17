import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import prisma from "../db";
import { ReportSchema, UpdateReportStatusSchema } from "../zod/schema";
import adminMiddleware from "../middlewares/admin.middleware";

const reportRouter = Router();

reportRouter.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;
    const parsed = ReportSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(401).json({
        message: "Validation Failed",
        error : parsed.error,
      });
      return;
    }

    const { postId, reason } = parsed.data;

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

reportRouter.patch("/report/:reportId", adminMiddleware, async (req, res) => {
  try {
    const reportId = req.params.reportId;

    if (!reportId) {
      res.status(404).json({
        message : "Report Id not found!"
      });
      return;  
    }

    const parsed = UpdateReportStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "Validation Failed",
        error: parsed.error.message,
      });
      return;
    }

    const { status } = parsed.data;

    const report = await prisma.report.findFirst({
      where : {
        id : reportId
      }
    });

    if(!report) {
      res.status(400).json({
        message : "Report Not found!"
      });
      return;
    }
  
    await prisma.report.update({
      where : {
        id : reportId
      },
      data : {
        status
      }
    });

    res.status(200).json({
      message : "Report Status Updated Successfully"
    })

  } catch (error) {
    res.status(500).json({
      message : "Internal Server Error"
    })
  }
})

export default reportRouter;
