import type { NextFunction, Request, Response } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";
import { ADMIN_JWT_SECRET } from "../config";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeaders = req.headers.authorization;

    const token = authHeaders?.split(" ")[1];

    if (!token) {
      res.status(400).json({
        message: "Token is missing",
      });
      return;
    }

    const user = verify(token, ADMIN_JWT_SECRET) as JwtPayload;

    if (user.role !== "ADMIN") {
      res.status(403).json({
        message: "Unauthorized Admin",
      });
      return;
    }

    req.adminId = user.id;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Unauthorized Admin",
    });
  }
};

export default adminMiddleware;
