import type { NextFunction, Request, Response } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";
import { USER_JWT_SECRET } from "../config";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeaders = req.headers.authorization;

    const token = authHeaders?.split(" ")[1];

    if (!token) {
      res.status(400).json({
        message: "Token is missing",
      });
      return;
    }

    const user = verify(token, USER_JWT_SECRET) as JwtPayload;

    req.userId = user.id;
    next();
  } catch (error) {
    res.status(403).json({
      message: "Unauthorized User",
    });
  }
};

export default authMiddleware;
