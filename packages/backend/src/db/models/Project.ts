import mongoose, { Schema } from "mongoose";
import type { Project, StyleGuide } from "@viragen/shared";

export interface ProjectDocument {
  _id: string;
  userId: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  systemPrompt: string;
  knowledge: string;
  analyzerPrompt?: string;
  imageSystemPrompt?: string;
  videoSystemPrompt?: string;
  styleGuide?: StyleGuide;
}

const StyleGuideSchema = new Schema(
  {
    tone: { type: String },
    color_palette: [{ type: String }],
    tempo: { type: String, enum: ["fast", "medium", "slow"] },
    camera_style: { type: String },
    brand_voice: { type: String },
    must_include: [{ type: String }],
    must_avoid: [{ type: String }],
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Number, required: true },
    updatedAt: { type: Number, required: true },
    systemPrompt: { type: String, required: true },
    knowledge: { type: String, default: "" },
    analyzerPrompt: { type: String, default: "" },
    imageSystemPrompt: { type: String, default: "" },
    videoSystemPrompt: { type: String, default: "" },
    styleGuide: { type: StyleGuideSchema, default: null },
  },
  {
    _id: false,
    versionKey: false,
  }
);

ProjectSchema.index({ userId: 1, updatedAt: -1 });
ProjectSchema.index({ updatedAt: -1 });

export const ProjectModel = mongoose.model<ProjectDocument>("Project", ProjectSchema);

export function toProject(doc: ProjectDocument): Project {
  return {
    id: doc._id,
    userId: doc.userId,
    name: doc.name,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    systemPrompt: doc.systemPrompt,
    knowledge: doc.knowledge,
    analyzerPrompt: doc.analyzerPrompt,
    imageSystemPrompt: doc.imageSystemPrompt,
    videoSystemPrompt: doc.videoSystemPrompt,
    styleGuide: doc.styleGuide || undefined,
  };
}
