import mongoose, { Schema } from "mongoose";
import type { APITokenMeta, TokenScope } from "@autovio/shared";

export interface APITokenDocument {
  _id: string;
  userId: string;
  name: string;
  tokenHash: string;
  tokenPrefix: string;
  scopes: TokenScope[];
  lastUsedAt: number | null;
  expiresAt: number | null;
  createdAt: number;
}

const APITokenSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    tokenHash: { type: String, required: true },
    tokenPrefix: { type: String, required: true },
    scopes: { type: [String], required: true },
    lastUsedAt: { type: Number, default: null },
    expiresAt: { type: Number, default: null },
    createdAt: { type: Number, required: true },
  },
  {
    _id: false,
    versionKey: false,
  }
);

APITokenSchema.index({ userId: 1 });
APITokenSchema.index({ tokenPrefix: 1 });

export const APITokenModel = mongoose.model<APITokenDocument>("APIToken", APITokenSchema);

export function toAPITokenMeta(doc: APITokenDocument): APITokenMeta {
  return {
    id: doc._id,
    name: doc.name,
    tokenPrefix: doc.tokenPrefix,
    scopes: doc.scopes,
    lastUsedAt: doc.lastUsedAt,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
  };
}
