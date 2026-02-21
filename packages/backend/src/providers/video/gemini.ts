import { GoogleGenAI } from "@google/genai";
import type { ModelOption } from "@viragen/shared";
import type { IVideoProvider } from "../interfaces.js";

/** Veo 3 is available via Gemini API (same API key as image/LLM). */
export class GeminiVideoProvider implements IVideoProvider {
  readonly id = "gemini";
  readonly name = "Google Veo";
  readonly models: ModelOption[] = [
    { id: "veo-3.0-generate-001", name: "Veo 3.0", description: "Video generation via Gemini API (paid tier)" },
    { id: "veo-3.1-generate-preview", name: "Veo 3.1 (preview)", description: "Latest Veo via Gemini API (paid tier)" },
  ];

  async convert(
    imageUrl: string,
    prompt: string,
    duration: number,
    apiKey: string,
    modelId = "veo-3.0-generate-001",
  ): Promise<string> {
    const ai = new GoogleGenAI({ apiKey });

    // Build image: { imageBytes (base64), mimeType }
    let imageBytes: string;
    let mimeType: string;
    if (imageUrl.startsWith("data:")) {
      const matches = imageUrl.match(/^data:(.+?);base64,(.+)$/);
      if (!matches) throw new Error("Invalid base64 image data URL");
      mimeType = matches[1];
      imageBytes = matches[2];
    } else {
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
      const buffer = await imgRes.arrayBuffer();
      imageBytes = Buffer.from(buffer).toString("base64");
      mimeType = imgRes.headers.get("content-type") || "image/png";
    }

    const fullPrompt = prompt ? `Generate a video based on this image. ${prompt}` : "Generate a video based on this image.";

    // Veo typically supports 4, 6, or 8 seconds; clamp to nearest
    const durationSeconds = [4, 6, 8].reduce((prev, curr) =>
      Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev,
    );

    console.log(`[veo] Starting video generation with model=${modelId} duration=${durationSeconds}s`);

    let operation = await ai.models.generateVideos({
      model: modelId,
      prompt: fullPrompt,
      image: { imageBytes, mimeType },
      config: { numberOfVideos: 1, durationSeconds },
    });

    // Poll until done
    for (let i = 0; i < 120; i++) {
      if (operation.done) break;
      await new Promise((r) => setTimeout(r, 5000));
      console.log(`[veo] Polling... attempt ${i + 1}`);
      operation = await ai.operations.getVideosOperation({ operation });
    }

    if (!operation.done) {
      throw new Error("Veo video generation timed out after 10 minutes");
    }

    const err = (operation as any).error;
    if (err) {
      throw new Error(`Veo generation failed: ${err.message || JSON.stringify(err)}`);
    }

    const generated = operation.response?.generatedVideos?.[0]?.video;
    if (!generated) {
      throw new Error("Veo returned no video data");
    }

    // Prefer inline bytes; otherwise fetch from URI with API key
    if (generated.videoBytes) {
      const mime = generated.mimeType || "video/mp4";
      return `data:${mime};base64,${generated.videoBytes}`;
    }

    if (generated.uri) {
      const resp = await fetch(generated.uri, {
        headers: { "x-goog-api-key": apiKey, Accept: "*/*" },
        redirect: "follow",
      });
      if (!resp.ok) {
        throw new Error(`Failed to download Veo video: ${resp.status} ${resp.statusText}`);
      }
      const buf = await resp.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      return `data:video/mp4;base64,${b64}`;
    }

    throw new Error("Veo returned video with no uri or videoBytes");
  }
}
