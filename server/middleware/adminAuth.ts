import type { Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const [user] = await db.select({ isAdmin: users.isAdmin }).from(users).where(eq(users.id, req.session.userId));
  if (!user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}
