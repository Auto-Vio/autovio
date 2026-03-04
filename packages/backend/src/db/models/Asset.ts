import mongoose, { Schema } from "mongoose";
import type { ProjectAsset } from "@autovio/shared";

export interface AssetDocument {
  _id: string;
  projectId: string;
  name: string;
  type: "image" | "video" | "audio" | "font";
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  thumbnail?: string;
}

const AssetSchema = new Schema(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["image", "video", "audio", "font"], required: true },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: { type: Number },
    height: { type: Number },
    duration: { type: Number },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    tags: [{ type: String }],
    thumbnail: { type: String },
  },
  {
    _id: false,
    versionKey: false,
  }
);

AssetSchema.index({ projectId: 1, type: 1 });
AssetSchema.index({ projectId: 1, updatedAt: -1 });

export const AssetModel = mongoose.model<AssetDocument>("Asset", AssetSchema);

export function toProjectAsset(doc: AssetDocument): ProjectAsset {
  return {
    id: doc._id,
    name: doc.name,
    type: doc.type,
    filename: doc.filename,
    mimeType: doc.mimeType,
    size: doc.size,
    width: doc.width,
    height: doc.height,
    duration: doc.duration,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    tags: doc.tags?.length ? doc.tags : undefined,
    thumbnail: doc.thumbnail,
  };
}
