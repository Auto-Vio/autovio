import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { TokenScope } from "@autovio/shared";
import { APITokenModel } from "../db/models/APIToken.js";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  scopes: TokenScope[] | "full";
  authType: "jwt" | "api_token";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "autovio-dev-secret-change-in-production";

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;

  return token;
}

function isAPIToken(token: string): boolean {
  return token.startsWith("vg_");
}

async function verifyJWT(token: string): Promise<AuthUser | null> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (payload.type !== "access") {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      scopes: "full",
      authType: "jwt",
    };
  } catch {
    return null;
  }
}

async function verifyAPIToken(token: string): Promise<AuthUser | null> {
  const prefix = token.slice(0, 11);
  
  const candidates = await APITokenModel.find({ tokenPrefix: prefix }).lean();
  
  for (const candidate of candidates) {
    const isValid = await bcrypt.compare(token, candidate.tokenHash);
    if (isValid) {
      if (candidate.expiresAt && candidate.expiresAt < Date.now()) {
        return null;
      }

      await APITokenModel.updateOne(
        { _id: candidate._id },
        { $set: { lastUsedAt: Date.now() } }
      );

      const { UserModel } = await import("../db/models/User.js");
      const user = await UserModel.findById(candidate.userId).lean();
      
      if (!user) return null;

      return {
        id: user._id,
        email: user.email,
        name: user.name,
        scopes: candidate.scopes as TokenScope[],
        authType: "api_token",
      };
    }
  }

  return null;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  let user: AuthUser | null = null;

  if (isAPIToken(token)) {
    user = await verifyAPIToken(token);
  } else {
    user = await verifyJWT(token);
  }

  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.user = user;
  next();
}

export function requireScope(...requiredScopes: TokenScope[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    if (user.scopes === "full") {
      next();
      return;
    }

    const hasAllScopes = requiredScopes.every((scope) =>
      (user.scopes as TokenScope[]).includes(scope)
    );

    if (!hasAllScopes) {
      res.status(403).json({
        error: "Insufficient permissions",
        required: requiredScopes,
        granted: user.scopes,
      });
      return;
    }

    next();
  };
}

export function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  authenticate(req, res, next);
}

export function generateAccessToken(user: { id: string; email: string; name: string }): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: "access",
  };

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function generateRefreshToken(user: { id: string; email: string; name: string }): string {
  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    type: "refresh",
  };

  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "30d";
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): JWTPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    if (payload.type !== "refresh") {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
