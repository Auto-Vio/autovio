import { Router } from "express";
import fs from "fs";
import { upload } from "../middleware/upload.js";
import { getVisionProvider } from "../providers/registry.js";

const router = Router();

router.post("/", upload.single("video"), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No video file uploaded" });
      return;
    }

    const providerId = req.headers["x-vision-provider"] as string || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;
    const mode = (req.body?.mode || "style_transfer") as "style_transfer" | "content_remix";
    const analyzerPrompt = typeof req.body?.analyzerPrompt === "string" ? req.body.analyzerPrompt.trim() || undefined : undefined;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const provider = getVisionProvider(providerId);
    const videoBuffer = fs.readFileSync(file.path);

    const result = await provider.analyze(videoBuffer, file.mimetype, mode, apiKey, modelId, analyzerPrompt);

    // Cleanup uploaded file
    fs.unlinkSync(file.path);

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
