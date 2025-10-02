import { z } from "zod";

export const SignupSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  username: z
    .string()
    .min(5, { error: "Username Should be greater than 5 characters" }),
  password: z
    .string()
    .min(8, { error: "Password Should be at least of 8 characters" }),
  email: z.email({ error: "Email Should be valid" }),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const ProfileUpdateSchema = z.object({
  username: z.string().min(5, { error: "" }),
  password: z.string().min(8, { error: "" }),
});

export const PostCreateSchema = z.object({
  title: z.string().min(5, { error: "" }),
  description: z.string().min(10, { error: "" }),
  image: z.string().min(10, { error: "" }),
  category: z.string().min(5, { error: "" }),
});
