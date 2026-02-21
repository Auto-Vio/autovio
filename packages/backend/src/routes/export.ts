import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import { EZFFMPEG } from "../lib/ezffmpeg/index.js";
import type { ClipObj } from "../lib/ezffmpeg/index.js";
import { projectExists } from "../storage/projects.js";
import { resolveSceneVideoPath, workExists } from "../storage/works.js";
import type { ExportRequest } from "@viragen/shared";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const body = req.body as ExportRequest;
    const { projectId, workId, clips, audio, texts, options } = body;

    if (!projectId || !workId || !clips?.length) {
      res.status(400).json({ error: "projectId, workId and clips are required" });
      return;
    }

    if (!(await projectExists(projectId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (!(await workExists(projectId, workId))) {
      res.status(404).json({ error: "Work not found" });
      return;
    }

    const width = options?.width ?? 1080;
    const height = options?.height ?? 1920;
    const fps = options?.fps ?? 30;

    // Resolve video file paths for each clip
    const clipObjs: ClipObj[] = [];

    for (const clip of clips) {
      const videoPath = await resolveSceneVideoPath(projectId, workId, clip.sceneIndex);
      if (!videoPath) {
        res.status(404).json({
          error: `Scene video not found for scene index ${clip.sceneIndex}`,
        });
        return;
      }

      clipObjs.push({
        type: "video",
        url: path.resolve(videoPath),
        position: clip.position,
        end: clip.end,
        cutFrom: clip.cutFrom ?? 0,
        volume: audio?.volume ?? 1,
      });
    }

    // Add text overlays
    if (texts?.length) {
      for (const text of texts) {
        clipObjs.push({
          type: "text",
          text: text.text,
          position: text.position,
          end: text.end,
          fontSize: text.fontSize,
          fontColor: text.fontColor,
          centerX: text.centerX,
          centerY: text.centerY,
          x: text.x,
          y: text.y,
        });
      }
    }

    // Create ezffmpeg instance and export
    const outputPath = path.join(
      os.tmpdir(),
      `viragen-export-${randomUUID()}.mp4`,
    );

    const ez = new EZFFMPEG({ width, height, fps }, console.log);
    await ez.load(clipObjs);
    await ez.export({ outputPath });

    // Stream the file back
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="viragen-export.mp4"',
    );

    const stat = await fs.stat(outputPath);
    res.setHeader("Content-Length", stat.size);

    // Use res.sendFile and clean up after
    res.sendFile(path.resolve(outputPath), async (err) => {
      // Clean up temp file
      try {
        await fs.unlink(outputPath);
      } catch {
        // ignore
      }
      if (err && !res.headersSent) {
        next(err);
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
