import { Router } from "express";
import { AnalysisResultSchema, UserIntentSchema } from "@autovio/shared";
import type { ScenarioScene, StyleGuide } from "@autovio/shared";
import { ScenarioSceneSchema } from "@autovio/shared";
import { isStyleGuideEmpty } from "@autovio/shared";
import { z } from "zod";
import { getLLMProvider } from "../providers/registry.js";
import {
  getScenarioSystemPrompt,
  getScenarioUserPrompt,
  formatStyleGuideForPrompt,
} from "../prompts/scenario.js";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

const RequestSchema = z.object({
  analysis: AnalysisResultSchema.optional(),
  intent: UserIntentSchema,
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
  styleGuide: z
    .object({
      tone: z.string().optional(),
      color_palette: z.array(z.string()).optional(),
      tempo: z.enum(["fast", "medium", "slow"]).optional(),
      camera_style: z.string().optional(),
      brand_voice: z.string().optional(),
      must_include: z.array(z.string()).optional(),
      must_avoid: z.array(z.string()).optional(),
    })
    .optional(),
});

router.post("/", requireScope("ai:generate"), async (req, res, next) => {
  try {
    const providerId = req.headers["x-llm-provider"] as string || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const {
      analysis,
      intent,
      systemPrompt: customSystemPrompt,
      knowledge,
      styleGuide,
    } = RequestSchema.parse(req.body);
    const provider = getLLMProvider(providerId);

    let baseSystemPrompt = customSystemPrompt?.trim() || getScenarioSystemPrompt();
    if (styleGuide && !isStyleGuideEmpty(styleGuide as StyleGuide)) {
      baseSystemPrompt += "\n\n" + formatStyleGuideForPrompt(styleGuide as StyleGuide);
    }
    const systemPrompt = knowledge?.trim()
      ? `${baseSystemPrompt}\n\n## Project information (to understand this project)\n${knowledge.trim()}`
      : baseSystemPrompt;
    const userPrompt = getScenarioUserPrompt(analysis, intent);

    console.log(`[scenario] provider=${providerId} model=${modelId}`);
    console.log("[scenario] system prompt:\n", systemPrompt);
    console.log("[scenario] user prompt:\n", userPrompt);

    const response = await provider.generate(systemPrompt, userPrompt, apiKey, modelId);
    // Parse the JSON array from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) || response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse scenario response as JSON");
    console.log("[scenario] response:\n", response);

    const raw = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const scenes: ScenarioScene[] = z.array(ScenarioSceneSchema).parse(raw);

    res.json({ scenes });
  } catch (err) {
    next(err);
  }
});

export default router;
