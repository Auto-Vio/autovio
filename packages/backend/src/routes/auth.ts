import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { UserModel, toUser } from "../db/models/User.js";
import {
  authenticate,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../middleware/auth.js";
import type { AuthResponse, RefreshTokenResponse } from "@autovio/shared";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

function generateId(): string {
  return crypto.randomUUID();
}

router.post("/register", async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existing = await UserModel.findOne({ email }).lean();
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = Date.now();

    const userDoc = await UserModel.create({
      _id: generateId(),
      email,
      passwordHash,
      name,
      createdAt: now,
      updatedAt: now,
    });

    const user = toUser(userDoc);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const response: AuthResponse = {
      user,
      accessToken,
      refreshToken,
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const userDoc = await UserModel.findOne({ email }).lean();
    if (!userDoc) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isValid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = toUser(userDoc);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const response: AuthResponse = {
      user,
      accessToken,
      refreshToken,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      res.status(401).json({ error: "Invalid or expired refresh token" });
      return;
    }

    const userDoc = await UserModel.findById(payload.sub).lean();
    if (!userDoc) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    const user = toUser(userDoc);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const response: RefreshTokenResponse = {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const userDoc = await UserModel.findById(userId).lean();
    if (!userDoc) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(toUser(userDoc));
  } catch (err) {
    next(err);
  }
});

export default router;
