import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelOption } from "@viragen/shared";
import type { ILLMProvider } from "../interfaces.js";

export class GeminiLLMProvider implements ILLMProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";
  readonly models: ModelOption[] = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Fast and capable" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", description: "Fastest, most affordable" },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Most capable, 2M context" },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Balanced speed/quality" },
  ];

  async generate(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    modelId = "gemini-2.0-flash",
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
