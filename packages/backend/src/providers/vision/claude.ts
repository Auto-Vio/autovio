import Anthropic from "@anthropic-ai/sdk";
import type { AnalysisResult, ModelOption } from "@autovio/shared";
import { AnalysisResultSchema } from "@autovio/shared";
import type { IVisionProvider } from "../interfaces.js";
import { getAnalyzerPrompt } from "../../prompts/analyzer.js";

export class ClaudeVisionProvider implements IVisionProvider {
  readonly id = "claude";
  readonly name = "Claude";
  readonly models: ModelOption[] = [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Best balance of speed and quality" },
    { id: "claude-haiku-4-20250414", name: "Claude Haiku 4", description: "Fastest, most affordable" },
    { id: "claude-opus-4-20250514", name: "Claude Opus 4", description: "Most capable" },
  ];

  async analyze(
    videoBuffer: Buffer,
    mimeType: string,
    mode: "style_transfer" | "content_remix",
    apiKey: string,
    modelId = "claude-sonnet-4-20250514",
    customPrompt?: string,
  ): Promise<AnalysisResult> {
    const client = new Anthropic({ apiKey });
    const promptText = customPrompt?.trim() || getAnalyzerPrompt(mode);

    const response = await client.messages.create({
      model: modelId,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: mimeType,
                data: videoBuffer.toString("base64"),
              },
            } as unknown as Anthropic.DocumentBlockParam,
            { type: "text", text: promptText },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Claude response as JSON");

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return AnalysisResultSchema.parse(json);
  }
}
