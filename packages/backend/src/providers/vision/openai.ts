import OpenAI from "openai";
import type { AnalysisResult, ModelOption } from "@autovio/shared";
import { AnalysisResultSchema } from "@autovio/shared";
import type { IVisionProvider } from "../interfaces.js";
import { getAnalyzerPrompt } from "../../prompts/analyzer.js";

export class OpenAIVisionProvider implements IVisionProvider {
  readonly id = "openai";
  readonly name = "OpenAI";
  readonly models: ModelOption[] = [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable vision model" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High quality, vision capable" },
  ];

  async analyze(
    videoBuffer: Buffer,
    _mimeType: string,
    mode: "style_transfer" | "content_remix",
    apiKey: string,
    modelId = "gpt-4o",
    customPrompt?: string,
  ): Promise<AnalysisResult> {
    const client = new OpenAI({ apiKey });

    const base64 = videoBuffer.toString("base64");
    const promptText = customPrompt?.trim() || getAnalyzerPrompt(mode);

    const response = await client.chat.completions.create({
      model: modelId,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
            { type: "text", text: promptText },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content || "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse OpenAI response as JSON");

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return AnalysisResultSchema.parse(json);
  }
}
