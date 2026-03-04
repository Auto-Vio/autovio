import { randomUUID } from "crypto";
import type {
  EditorTemplate,
  EditorTemplateContent,
  EditorTemplateMeta,
  EditorTemplateList,
} from "@autovio/shared";
import { projectExists } from "./projects.js";
import {
  EditorTemplateModel,
  toEditorTemplate,
  type EditorTemplateDocument,
} from "../db/index.js";

function templateToMeta(t: EditorTemplate): EditorTemplateMeta {
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    thumbnail: t.thumbnail,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    tags: t.tags,
    textOverlayCount: t.content.textOverlays?.length ?? 0,
    imageOverlayCount: t.content.imageOverlays?.length ?? 0,
    hasExportSettings: Boolean(t.content.exportSettings),
  };
}

export async function listTemplates(
  projectId: string,
  userId?: string
): Promise<EditorTemplateList> {
  if (userId && !(await projectExists(projectId, userId))) {
    return { templates: [], count: 0 };
  }
  const docs = await EditorTemplateModel.find({ projectId })
    .sort({ updatedAt: -1 })
    .lean();
  return {
    templates: docs.map((d) => templateToMeta(toEditorTemplate(d as EditorTemplateDocument))),
    count: docs.length,
  };
}

export async function getTemplate(
  projectId: string,
  templateId: string,
  userId?: string
): Promise<EditorTemplate | null> {
  if (userId && !(await projectExists(projectId, userId))) return null;
  const doc = await EditorTemplateModel.findOne({ _id: templateId, projectId }).lean();
  return doc ? toEditorTemplate(doc as EditorTemplateDocument) : null;
}

export async function templateExists(
  projectId: string,
  templateId: string,
  userId?: string
): Promise<boolean> {
  const t = await getTemplate(projectId, templateId, userId);
  return t != null;
}

export interface SaveTemplateInput {
  projectId: string;
  userId?: string;
  name: string;
  description?: string;
  tags?: string[];
  content: EditorTemplateContent;
}

export async function saveTemplate(input: SaveTemplateInput): Promise<EditorTemplate> {
  const { projectId, userId, name, description, tags, content } = input;
  if (userId && !(await projectExists(projectId, userId))) {
    throw new Error("Project not found");
  }
  const id = "tmpl_" + randomUUID().replace(/-/g, "").slice(0, 12);
  const now = Date.now();
  await EditorTemplateModel.create({
    _id: id,
    projectId,
    name: (name || "Untitled Template").trim().slice(0, 200),
    description: (description ?? "").trim().slice(0, 500),
    createdAt: now,
    updatedAt: now,
    content,
    tags: tags && tags.length > 0 ? tags : [],
  });
  const doc = await EditorTemplateModel.findById(id).lean();
  if (!doc) throw new Error("Template not found after create");
  return toEditorTemplate(doc as EditorTemplateDocument);
}

export interface UpdateTemplateInput {
  projectId: string;
  templateId: string;
  userId?: string;
  name?: string;
  description?: string;
  tags?: string[];
  content?: EditorTemplateContent;
}

export async function updateTemplate(input: UpdateTemplateInput): Promise<EditorTemplate | null> {
  const { projectId, templateId, userId, name, description, tags, content } = input;
  if (userId && !(await projectExists(projectId, userId))) return null;
  const update: Record<string, unknown> = { updatedAt: Date.now() };
  if (name !== undefined) update.name = name.trim().slice(0, 200);
  if (description !== undefined) update.description = description.trim().slice(0, 500);
  if (tags !== undefined) update.tags = tags.length > 0 ? tags : [];
  if (content !== undefined) update.content = content;
  const doc = await EditorTemplateModel.findOneAndUpdate(
    { _id: templateId, projectId },
    { $set: update },
    { new: true }
  )
    .lean();
  return doc ? toEditorTemplate(doc as EditorTemplateDocument) : null;
}

export async function deleteTemplate(
  projectId: string,
  templateId: string,
  userId?: string
): Promise<boolean> {
  if (userId && !(await projectExists(projectId, userId))) return false;
  const result = await EditorTemplateModel.deleteOne({ _id: templateId, projectId });
  return result.deletedCount > 0;
}
