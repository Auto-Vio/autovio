import { Router, type Request } from "express";
import type {
  EditorTemplate,
  TemplateApplicationRequest,
  TemplateApplicationResult,
  TimelineActionSnapshot,
  TextOverlaySnapshot,
  ImageOverlaySnapshot,
} from "@autovio/shared";
import {
  getTemplate,
  listTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
} from "../storage/templates.js";
import { projectExists } from "../storage/projects.js";
import { getAsset } from "../storage/assets.js";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router({ mergeParams: true });
router.use(authenticate);

function getProjectId(req: Request): string {
  return String((req.params as { projectId?: string }).projectId ?? "");
}

function getTemplateId(req: Request): string {
  return String((req.params as { templateId?: string }).templateId ?? "");
}

/** Replace placeholders in text. Supports {{product_name}}, {{brand}}, {{date}}, {{custom:label}} */
function replacePlaceholders(
  text: string,
  values: Record<string, string> | undefined
): string {
  if (!values || Object.keys(values).length === 0) return text;
  let out = text;
  const re = /\{\{([^}]+)\}\}/g;
  out = out.replace(re, (_, key: string) => {
    const k = key.trim();
    if (values[k] !== undefined) return values[k];
    if (k.startsWith("custom:") && values[k] !== undefined) return values[k];
    return `{{${key}}}`;
  });
  return out;
}

/** Compute start/end in seconds from template overlay timing and video duration */
function resolveTiming(
  timingMode: "relative" | "absolute",
  videoDuration: number,
  startPercent?: number,
  endPercent?: number,
  startSeconds?: number,
  endSeconds?: number
): { start: number; end: number } {
  const minDuration = 0.1;
  if (timingMode === "absolute") {
    const start = Math.max(0, startSeconds ?? 0);
    const end = Math.min(videoDuration, Math.max(start + minDuration, endSeconds ?? videoDuration));
    return { start, end };
  }
  const start = (Math.max(0, Math.min(100, startPercent ?? 0)) / 100) * videoDuration;
  const end = (Math.max(0, Math.min(100, endPercent ?? 100)) / 100) * videoDuration;
  const actualEnd = Math.max(start + minDuration, Math.min(videoDuration, end));
  return { start, end: actualEnd };
}

/** Apply template to produce overlays and track actions for the frontend */
export function applyTemplateLogic(
  template: EditorTemplate,
  videoDuration: number,
  placeholderValues?: Record<string, string>
): TemplateApplicationResult {
  const textOverlays: Record<string, TextOverlaySnapshot> = {};
  const textTrackActions: TimelineActionSnapshot[] = [];
  const imageOverlays: Record<string, ImageOverlaySnapshot> = {};
  const imageTrackActions: TimelineActionSnapshot[] = [];

  const prefix = "applied_";

  for (const t of template.content.textOverlays ?? []) {
    const { start, end } = resolveTiming(
      t.timingMode,
      videoDuration,
      t.startPercent,
      t.endPercent,
      t.startSeconds,
      t.endSeconds
    );
    const text = replacePlaceholders(t.text, placeholderValues);
    const id = prefix + t.id;
    textOverlays[id] = {
      text,
      fontSize: t.fontSize,
      fontColor: t.fontColor,
      centerX: t.centerX,
      centerY: t.centerY,
    };
    textTrackActions.push({
      id,
      start,
      end,
    });
  }

  for (const img of template.content.imageOverlays ?? []) {
    const { start, end } = resolveTiming(
      img.timingMode,
      videoDuration,
      img.startPercent,
      img.endPercent,
      img.startSeconds,
      img.endSeconds
    );
    const id = prefix + img.id;
    imageOverlays[id] = {
      assetId: img.assetId,
      width: img.width,
      height: img.height,
      centerX: img.centerX,
      centerY: img.centerY,
      opacity: img.opacity,
      rotation: img.rotation,
      maintainAspectRatio: img.maintainAspectRatio,
    };
    imageTrackActions.push({
      id,
      start,
      end,
    });
  }

  return {
    textOverlays,
    textTrackActions,
    imageOverlays,
    imageTrackActions,
    exportSettings: template.content.exportSettings,
  };
}

// List templates
router.get("/", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const list = await listTemplates(projectId, userId);
    const baseUrl = `/api/projects/${projectId}/templates`;
    const templatesWithThumbUrl = list.templates.map((t) =>
      t.thumbnail ? { ...t, thumbnail: `${baseUrl}/${t.id}/thumbnail` } : t
    );
    res.json({ templates: templatesWithThumbUrl, count: list.count });
  } catch (e) {
    next(e);
  }
});

// Create template (body from frontend)
router.post("/", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const { name, description, tags, content } = req.body ?? {};
    if (!name || typeof name !== "string" || !content) {
      res.status(400).json({ error: "name and content are required" });
      return;
    }
    const template = await saveTemplate({
      projectId,
      userId,
      name,
      description,
      tags: Array.isArray(tags) ? tags : undefined,
      content,
    });
    res.status(201).json(template);
  } catch (e) {
    next(e);
  }
});

// Get single template
router.get("/:templateId", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const templateId = getTemplateId(req);
    const template = await getTemplate(projectId, templateId, userId);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(template);
  } catch (e) {
    next(e);
  }
});

// Update template
router.put("/:templateId", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const templateId = getTemplateId(req);
    const { name, description, tags, content } = req.body ?? {};
    const updated = await updateTemplate({
      projectId,
      templateId,
      userId,
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : undefined }),
      ...(content !== undefined && { content }),
    });
    if (!updated) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// Delete template
router.delete("/:templateId", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const templateId = getTemplateId(req);
    const deleted = await deleteTemplate(projectId, templateId, userId);
    if (!deleted) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

// Apply template
router.post("/:templateId/apply", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const templateId = getTemplateId(req);
    const template = await getTemplate(projectId, templateId, userId);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    const body = req.body as TemplateApplicationRequest | undefined;
    const videoDuration = Number(body?.videoDuration);
    if (!Number.isFinite(videoDuration) || videoDuration <= 0) {
      res.status(400).json({ error: "videoDuration must be a positive number" });
      return;
    }
    const placeholderValues = body?.placeholderValues as Record<string, string> | undefined;
    const result = applyTemplateLogic(template, videoDuration, placeholderValues);

    // Optionally validate that image overlay assetIds exist in project
    const missingAssets: string[] = [];
    for (const assetId of Object.values(result.imageOverlays).map((o) => o.assetId)) {
      const asset = await getAsset(projectId, assetId, userId);
      if (!asset) missingAssets.push(assetId);
    }
    const response: TemplateApplicationResult & { missingAssetIds?: string[] } = result;
    if (missingAssets.length > 0) response.missingAssetIds = missingAssets;
    res.json(response);
  } catch (e) {
    next(e);
  }
});

export default router;
