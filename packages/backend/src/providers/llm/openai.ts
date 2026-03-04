import OpenAI from "openai";
import type { ModelOption } from "@autovio/shared";
import type { ILLMProvider } from "../interfaces.js";

export class OpenAILLMProvider implements ILLMProvider {
  readonly id = "openai";
  readonly name = "OpenAI";
  readonly models: ModelOption[] = [
    { id: "gpt-4o", name: "GPT-4o", description: "Most capable, multimodal" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast, affordable, great quality" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High quality, 128K context" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Cheapest, fast, good for simple tasks" },
    { id: "o1-mini", name: "o1-mini", description: "Reasoning model, compact" },
    { id: "o1", name: "o1", description: "Advanced reasoning" },
  ];

  async generate(
    systemPrompt: string,
    userPrompt: string,
    apiKey: string,
    modelId = "gpt-4o-mini",
  ): Promise<string> {
    const client = new OpenAI({ apiKey });

    // o1 models don't support system messages
    const isReasoningModel = modelId.startsWith("o1");

    const messages: OpenAI.ChatCompletionMessageParam[] = isReasoningModel
      ? [{ role: "user", content: `${systemPrompt}\n\n${userPrompt}` }]
      : [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ];

    const response = await client.chat.completions.create({
      model: modelId,
      max_tokens: 4096,
      messages,
    });

    return response.choices[0]?.message?.content || "";
  }
}
