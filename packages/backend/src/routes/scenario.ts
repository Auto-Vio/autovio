import { Router } from "express";
import { AnalysisResultSchema, UserIntentSchema } from "@viragen/shared";
import type { ScenarioScene } from "@viragen/shared";
import { ScenarioSceneSchema } from "@viragen/shared";
import { z } from "zod";
import { getLLMProvider } from "../providers/registry.js";
import { getScenarioSystemPrompt, getScenarioUserPrompt } from "../prompts/scenario.js";

const router = Router();

const RequestSchema = z.object({
  analysis: AnalysisResultSchema.optional(),
  intent: UserIntentSchema,
  systemPrompt: z.string().optional(),
  knowledge: z.string().optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const providerId = req.headers["x-llm-provider"] as string || "gemini";
    const modelId = req.headers["x-model-id"] as string | undefined;
    const apiKey = req.headers["x-api-key"] as string;

    if (!apiKey) {
      res.status(400).json({ error: "API key required (x-api-key header)" });
      return;
    }

    const { analysis, intent, systemPrompt: customSystemPrompt, knowledge } = RequestSchema.parse(req.body);
    const provider = getLLMProvider(providerId);

    const baseSystemPrompt = customSystemPrompt?.trim() || getScenarioSystemPrompt();
    const systemPrompt = knowledge?.trim()
      ? `${baseSystemPrompt}\n\n## Proje bilgisi (bu projeyi anlamak için)\n${knowledge.trim()}`
      : baseSystemPrompt;
    const userPrompt = getScenarioUserPrompt(analysis, intent);

    const response = await provider.generate(systemPrompt, userPrompt, apiKey, modelId);

    // Parse the JSON array from response
    const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) || response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Failed to parse scenario response as JSON");

    const raw = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    const scenes: ScenarioScene[] = z.array(ScenarioSceneSchema).parse(raw);

    res.json({ scenes });
  } catch (err) {
    next(err);
  }
});

export default router;
