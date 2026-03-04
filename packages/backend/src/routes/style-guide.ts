import { Router } from "express";
import { getLLMProvider } from "../providers/registry.js";
import { getStyleGuideExtractionPrompt } from "../prompts/style-guide.js";
import {
  getLandingPageExtractionPrompt,
  buildLandingPagePrompt,
  getFeatureExtractionPrompt,
  buildFeaturePrompt,
} from "../prompts/landing-page.js";
import { extractLandingPageData } from "../lib/landingPageExtractor.js";
import type { StyleGuide } from "@autovio/shared";
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

/**
 * POST /api/style-guide/extract-from-landing
 * Fetch URL on the backend, extract landing page data, then use AI to produce StyleGuide and/or productInfo.
 *
 * Body: { url: string, includeProductInfo?: boolean, mode?: "landing" | "feature" }
 * - mode "landing" (default): full page extraction → style guide (+ optional productInfo)
 * - mode "feature": only feature section of the page → productInfo only
 * Headers: x-llm-provider, x-model-id, x-api-key
 */
router.post(
  "/extract-from-landing",
  requireScope("ai:generate"),
  async (req, res, next) => {
    try {
      const { url, includeProductInfo, mode: bodyMode } = req.body;
      const mode = bodyMode === "feature" ? "feature" : "landing";

      if (!url || typeof url !== "string" || !url.trim()) {
        res.status(400).json({ error: "url is required" });
        return;
      }

      const providerId = (req.headers["x-llm-provider"] as string) || "gemini";
      const modelId = req.headers["x-model-id"] as string | undefined;
      const apiKey = req.headers["x-api-key"] as string;

      if (!apiKey) {
        res.status(400).json({ error: "x-api-key header is required" });
        return;
      }

      const landingPageData = await extractLandingPageData(url.trim(), { mode });
      const provider = getLLMProvider(providerId);

      let systemPrompt: string;
      let userPrompt: string;

      if (mode === "feature") {
        systemPrompt = getFeatureExtractionPrompt();
        userPrompt = buildFeaturePrompt(url.trim(), landingPageData);
      } else {
        systemPrompt = getLandingPageExtractionPrompt(
          Boolean(includeProductInfo)
        );
        userPrompt = buildLandingPagePrompt(url.trim(), landingPageData);
      }

      console.log("[style-guide/extract-from-landing] url=%s mode=%s includeProductInfo=%s", url.trim(), mode, includeProductInfo);
      console.log("[style-guide/extract-from-landing] extracted data: %s", JSON.stringify({
        ...landingPageData,
        htmlSnippet: landingPageData.htmlSnippet ? `${landingPageData.htmlSnippet.length} chars` : undefined,
      }, null, 2));
      console.log("[style-guide/extract-from-landing] provider=%s model=%s", providerId, modelId ?? "(default)");
      console.log("[style-guide/extract-from-landing] system prompt:\n%s", systemPrompt);
      console.log("[style-guide/extract-from-landing] user prompt:\n%s", userPrompt);

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
      const result = JSON.parse(cleanedText);

      console.log("[style-guide/extract-from-landing] AI response (parsed): %s", JSON.stringify(result, null, 2));

      if (mode === "feature") {
        res.json({ styleGuide: {}, productInfo: result.productInfo ?? result });
      } else {
        res.json(result);
      }
    } catch (err) {
      next(err);
    }
  }
);

export default router;
