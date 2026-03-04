import mongoose, { Schema } from "mongoose";
import type { EditorTemplate, EditorTemplateContent } from "@autovio/shared";

export interface EditorTemplateDocument {
  _id: string;
  projectId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: number;
  updatedAt: number;
  content: EditorTemplateContent;
  tags?: string[];
}

const TemplateTextOverlaySchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, default: "" },
    fontSize: { type: Number, default: 32 },
    fontColor: { type: String, default: "#ffffff" },
    centerX: { type: Number, default: 0 },
    centerY: { type: Number, default: 0 },
    timingMode: { type: String, enum: ["relative", "absolute"], required: true },
    startPercent: { type: Number },
    endPercent: { type: Number },
    startSeconds: { type: Number },
    endSeconds: { type: Number },
  },
  { _id: false }
);

const TemplateImageOverlaySchema = new Schema(
  {
    id: { type: String, required: true },
    assetId: { type: String, required: true },
    width: { type: Number, default: 128 },
    height: { type: Number, default: 128 },
    centerX: { type: Number, default: 0 },
    centerY: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
    maintainAspectRatio: { type: Boolean, default: true },
    timingMode: { type: String, enum: ["relative", "absolute"], required: true },
    startPercent: { type: Number },
    endPercent: { type: Number },
    startSeconds: { type: Number },
    endSeconds: { type: Number },
  },
  { _id: false }
);

const EditorTemplateContentSchema = new Schema(
  {
    textOverlays: { type: [TemplateTextOverlaySchema], default: [] },
    imageOverlays: { type: [TemplateImageOverlaySchema], default: [] },
    defaultTransition: {
      type: { type: String },
      duration: { type: Number },
    },
    exportSettings: {
      width: { type: Number },
      height: { type: Number },
      fps: { type: Number },
    },
  },
  { _id: false }
);

const EditorTemplateSchema = new Schema(
  {
    _id: { type: String, required: true },
    projectId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    thumbnail: { type: String },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    content: { type: EditorTemplateContentSchema, required: true },
    tags: [{ type: String }],
  },
  {
    _id: false,
    versionKey: false,
  }
);

EditorTemplateSchema.index({ projectId: 1, updatedAt: -1 });

export const EditorTemplateModel = mongoose.model<EditorTemplateDocument>(
  "EditorTemplate",
  EditorTemplateSchema
);

export function toEditorTemplate(doc: EditorTemplateDocument): EditorTemplate {
  return {
    id: doc._id,
    projectId: doc.projectId,
    name: doc.name,
    description: doc.description || undefined,
    thumbnail: doc.thumbnail,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    content: doc.content as EditorTemplateContent,
    tags: doc.tags && doc.tags.length > 0 ? doc.tags : undefined,
  };
}
