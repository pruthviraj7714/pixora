import cloudinary from "../utils/cloudinary.config";
import { Router } from "express";
import authMiddleware from "../middlewares/user.middleware";
import multer from "multer";

const cloudinaryRouter = Router();

const upload = multer();

cloudinaryRouter.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          message: "File Not Found!",
        });
        return;
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "pixora" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

      res.status(200).json({
        result,
      });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  }
);

export default cloudinaryRouter;
