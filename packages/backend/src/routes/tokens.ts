import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import { APITokenModel, toAPITokenMeta } from "../db/models/APIToken.js";
import { authenticate } from "../middleware/auth.js";
import type { CreateTokenResponse, TokenScope, ALL_TOKEN_SCOPES } from "@autovio/shared";

const router = Router();

const VALID_SCOPES: TokenScope[] = [
  "projects:read",
  "projects:write",
  "works:read",
  "works:write",
  "ai:analyze",
  "ai:generate",
];

const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum([
    "projects:read",
    "projects:write",
    "works:read",
    "works:write",
    "ai:analyze",
    "ai:generate",
  ])).min(1),
  expiresInDays: z.number().positive().optional().nullable(),
});

function generateAPIToken(): string {
  const randomPart = crypto.randomBytes(32).toString("base64url");
  return `vg_${randomPart}`;
}

function generateId(): string {
  return crypto.randomUUID();
}

router.use(authenticate);

router.get("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;

    const tokens = await APITokenModel.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(tokens.map(toAPITokenMeta));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { name, scopes, expiresInDays } = createTokenSchema.parse(req.body);

    const rawToken = generateAPIToken();
    const tokenHash = await bcrypt.hash(rawToken, 12);
    const tokenPrefix = rawToken.slice(0, 11);

    const now = Date.now();
    const expiresAt = expiresInDays
      ? now + expiresInDays * 24 * 60 * 60 * 1000
      : null;

    const tokenDoc = await APITokenModel.create({
      _id: generateId(),
      userId,
      name,
      tokenHash,
      tokenPrefix,
      scopes,
      lastUsedAt: null,
      expiresAt,
      createdAt: now,
    });

    const response: CreateTokenResponse = {
      token: rawToken,
      meta: toAPITokenMeta(tokenDoc),
    };

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const tokenId = req.params.id;

    const result = await APITokenModel.deleteOne({
      _id: tokenId,
      userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
