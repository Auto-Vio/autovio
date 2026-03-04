import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelOption } from "@autovio/shared";
import type { ILLMProvider } from "../interfaces.js";

export class GeminiLLMProvider implements ILLMProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";
  readonly models: ModelOption[] = [
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Best price-performance, recommended" },
    { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", description: "Fastest, most affordable" },
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Most capable, complex tasks" },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Legacy (deprecating 2026)" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", description: "Legacy lite (deprecating 2026)" },
  ];

  async generate(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    modelId = "gemini-2.5-flash",
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelId,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    return result.response.text();
  }
}
