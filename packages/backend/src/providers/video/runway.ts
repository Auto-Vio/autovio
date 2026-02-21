import type { ModelOption } from "@viragen/shared";
import type { IVideoProvider } from "../interfaces.js";

export class RunwayProvider implements IVideoProvider {
  readonly id = "runway";
  readonly name = "Runway";
  readonly models: ModelOption[] = [
    { id: "gen3a_turbo", name: "Gen-3 Alpha Turbo", description: "Fast, good quality" },
    { id: "gen3a", name: "Gen-3 Alpha", description: "Highest quality, slower" },
  ];

  async convert(
    imageUrl: string,
    prompt: string,
    duration: number,
    apiKey: string,
    modelId = "gen3a_turbo",
  ): Promise<string> {
    const durationSeconds = Math.min(10, Math.max(2, Math.round(duration)));
    const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: modelId,
        promptImage: imageUrl,
        promptText: prompt,
        duration: durationSeconds,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Runway API error: ${response.status} — ${error}`);
    }

    const data = (await response.json()) as { id: string };
    const taskId = data.id;

    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      });

      const task = (await pollRes.json()) as { status: string; output?: string[] };

      if (task.status === "SUCCEEDED" && task.output?.[0]) {
        return task.output[0];
      }
      if (task.status === "FAILED") {
        throw new Error("Runway video generation failed");
      }
    }

    throw new Error("Runway video generation timed out");
  }
}
