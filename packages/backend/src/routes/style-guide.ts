import { Router } from "express";
import { getLLMProvider } from "../providers/registry.js";
import { getStyleGuideExtractionPrompt } from "../prompts/style-guide.js";
import type { StyleGuide } from "@viragen/shared";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

/**
 * POST /api/style-guide/extract
 * Extract structured style guide from free-form text using AI
 *
 * Body: { text: string }
 * Headers: x-llm-provider, x-model-id, x-api-key
 */
router.post("/extract", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const providerId = (req.headers["x-llm-provider"] as string) || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "x-api-key header is required" });
      return;
    }

    const provider = getLLMProvider(providerId);
    const systemPrompt = getStyleGuideExtractionPrompt();
    const userPrompt = `Extract style guide from this context:\n\n${text}`;

    const responseText = await provider.generate(
      systemPrompt,
      userPrompt,
      apiKey,
      modelId
    );

    const cleanedText = responseText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const styleGuide: StyleGuide = JSON.parse(cleanedText);

    res.json({ styleGuide });
  } catch (err) {
    next(err);
  }
});

export default router;
