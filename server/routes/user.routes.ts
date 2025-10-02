import { Router } from "express";
import { ProfileUpdateSchema, SigninSchema, SignupSchema } from "../zod/schema";
import { hash, compare } from "bcrypt";
import prisma from "../db";
import { ADMIN_JWT_SECRET, FRONTEND_URL, USER_JWT_SECRET } from "../config";
import jwt from "jsonwebtoken";
import authMiddleware from "../middlewares/user.middleware";

const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
  try {
    const { success, data, error } = SignupSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation Failed",
        error: error,
      });
      return;
    }

    const { username, email, password, firstname, lastname } = data;

    const isUserAlreadyExists = await prisma.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            email,
          },
        ],
      },
    });

    if (isUserAlreadyExists) {
      res.status(409).json({
        message: "User with given Username or Email Already Exists",
      });
      return;
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.create({
      data: {
        firstname,
        lastname,
        username,
        password: hashedPassword,
        email,
      },
    });

    res.status(201).json({
      message: "USer Account Successfully Created¯",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { data, success, error } = SigninSchema.safeParse(req.body);

    if (!success) {
      res.status(400).json({
        message: "Validation Failed",
        error,
      });
      return;
    }

    const { username, password } = data;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      res.status(401).json({
        message: "User Account Not Found!",
      });
      return;
    }

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      res.status(401).json({
        message: "Incorrect Password",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      user.role === "ADMIN" ? ADMIN_JWT_SECRET : USER_JWT_SECRET
    );

    res.status(200).json({
      message: "User Successfully Logged In!",
      id: user.id,
      token,
      role : user.role,
      username : user.username
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      include: {
        posts: true,
      },
    });

    if (!user) {
      res.status(400).json({
        message: "Invalid User",
      });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.put("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    const { data, success, error } = ProfileUpdateSchema.safeParse(req.body);

    if (!success) {
      res.status(401).json({
        message: "Validation Failed",
        error,
      });
      return;
    }

    const { username, password } = data;

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        password,
      },
    });

    res.status(200).json({
      message: "User Profile Successfully Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

userRouter.delete("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId!;

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      message: "User Account Successfully Deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

export default userRouter;
