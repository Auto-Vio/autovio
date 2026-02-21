import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalysisResult, ModelOption } from "@viragen/shared";
import { AnalysisResultSchema } from "@viragen/shared";
import type { IVisionProvider } from "../interfaces.js";
import { getAnalyzerPrompt } from "../../prompts/analyzer.js";

export class GeminiVisionProvider implements IVisionProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";
  readonly models: ModelOption[] = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Fast and capable" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", description: "Fastest, lightweight" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Most capable, slower" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Balanced speed/quality" },
  ];

  async analyze(
    videoBuffer: Buffer,
    mimeType: string,
    mode: "style_transfer" | "content_remix",
    apiKey: string,
    modelId = "gemini-2.0-flash",
    customPrompt?: string,
  ): Promise<AnalysisResult> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelId });
    const promptText = customPrompt?.trim() || getAnalyzerPrompt(mode);

    const result = await model.generateContent([
      { text: promptText },
      {
        inlineData: {
          mimeType,
          data: videoBuffer.toString("base64"),
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Gemini response as JSON");

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return AnalysisResultSchema.parse(json);
  }
}
