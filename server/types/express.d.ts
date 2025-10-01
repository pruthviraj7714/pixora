import express from "express";

declare global {
  namespace Express {
    export interface Request {
        userId?: string;
        adminId?: string;
    }
  }
}
