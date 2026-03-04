import Anthropic from "@anthropic-ai/sdk";
import type { ModelOption } from "@autovio/shared";
import type { ILLMProvider } from "../interfaces.js";

export class ClaudeLLMProvider implements ILLMProvider {
  readonly id = "claude";
  readonly name = "Claude";
  readonly models: ModelOption[] = [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Best balance of speed and quality" },
    { id: "claude-haiku-4-20250414", name: "Claude Haiku 4", description: "Fastest, most affordable" },
    { id: "claude-opus-4-20250514", name: "Claude Opus 4", description: "Most capable, highest quality" },
  ];

  async generate(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    modelId = "claude-sonnet-4-20250514",
  ): Promise<string> {
    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: modelId,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    return response.content[0].type === "text" ? response.content[0].text : "";
  }
}
