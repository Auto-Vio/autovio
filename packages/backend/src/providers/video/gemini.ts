import { GoogleGenAI } from "@google/genai";
import type { ModelOption } from "@autovio/shared";
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
    resolution?: { width: number; height: number },
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

    let aspectRatio: string | undefined;
    if (resolution) {
      const { width, height } = resolution;
      if (height > width) aspectRatio = "9:16";
      else if (width > height) aspectRatio = "16:9";
      else aspectRatio = "1:1";
    }

    console.log(`[veo] Starting video generation with model=${modelId} duration=${durationSeconds}s${aspectRatio ? ` aspectRatio=${aspectRatio}` : ""}`);

    let operation = await ai.models.generateVideos({
      model: modelId,
      prompt: fullPrompt,
      image: { imageBytes, mimeType },
      config: { numberOfVideos: 1, durationSeconds, ...(aspectRatio && { aspectRatio }) },
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

    const op = operation as any;
    const resp = op.response ?? op.result;
    console.log("[veo] operation keys:", Object.keys(op));
    console.log("[veo] response/result present:", !!resp, "keys:", resp ? Object.keys(resp) : "n/a");

    const list =
      resp?.generatedVideos ??
      resp?.generated_videos ??
      (Array.isArray(resp?.videos) ? resp.videos : undefined);
    console.log("[veo] list from generatedVideos/generated_videos/videos:", Array.isArray(list) ? list.length : "not array", typeof list);

    const first = Array.isArray(list) ? list[0] : undefined;
    console.log("[veo] first element keys:", first && typeof first === "object" ? Object.keys(first) : first);

    const generated = first?.video ?? (first && typeof first === "object" && ((first as any).uri ?? (first as any).videoBytes ?? (first as any).video_bytes) ? first : undefined);
    if (!generated) {
      const safeResp = resp
        ? JSON.stringify(resp, (_, v: unknown) => (typeof v === "string" && v.length > 200 ? "[truncated]" : v), 2).slice(0, 2000)
        : "null";
      console.error("[veo] Unexpected response shape. operation.response/result:", safeResp);
      throw new Error("Veo returned no video data");
    }
    const gen = generated as any;
    console.log("[veo] generated keys:", typeof generated === "object" && generated ? Object.keys(generated) : typeof generated);

    // Prefer inline bytes; otherwise fetch from URI with API key (support camelCase and snake_case)
    const videoBytes = gen.videoBytes ?? gen.video_bytes;
    const uri = gen.uri;
    if (videoBytes) {
      const mime = gen.mimeType ?? gen.mime_type ?? "video/mp4";
      return `data:${mime};base64,${videoBytes}`;
    }

    if (uri) {
      const resp = await fetch(uri, {
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

    console.error("[veo] Video object keys:", generated && typeof generated === "object" ? Object.keys(generated) : "n/a");
    throw new Error("Veo returned video with no uri or videoBytes");
  }
}
