import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelOption } from "@autovio/shared";
import type { IImageProvider } from "../interfaces.js";

export class GeminiImageProvider implements IImageProvider {
  readonly id = "gemini";
  readonly name = "Google Gemini";
  readonly models: ModelOption[] = [
    { id: "gemini-2.5-flash-image", name: "Gemini 2.5 Flash (Image)", description: "Fast image generation (Nano Banana)" },
    { id: "gemini-3-pro-image-preview", name: "Gemini 3 Pro (Image)", description: "Higher quality, professional (Nano Banana Pro)" },
  ];

  async generate(
    prompt: string,
    _negativePrompt: string,
    apiKey: string,
    modelId = "gemini-2.5-flash-image",
  ): Promise<string> {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelId,
      generationConfig: {
        responseModalities: ["IMAGE", "TEXT"],
      } as any,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      throw new Error("Gemini returned no content parts");
    }

    for (const part of parts) {
      if ((part as any).inlineData) {
        const { mimeType, data } = (part as any).inlineData;
        return `data:${mimeType};base64,${data}`;
      }
    }

    throw new Error("Gemini returned no image data in response");
  }
}
