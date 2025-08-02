import { type ToolSet, streamText } from "ai";
import { toolsConfig } from "./AIAssistant.tools";
import {
  type ProviderKeys,
  getProviderApiKey,
  getProviderModel,
} from "./utils/providers";

export function makeFetch({
  tools,
  getKey = getProviderApiKey,
}: {
  tools: ToolSet;
  getKey?: (provider: keyof ProviderKeys) => Promise<string>;
}): typeof globalThis.fetch {
  return async (...args: any[]) => {
    if (args.length === 0) {
      throw new Error("No arguments provided");
    }
    if (typeof args[0] !== "string") {
      throw new Error("First argument must be a string");
    }
    if (args[0] !== "background://") {
      return fetch(args[0], args[1]);
    }

    const {
      id: chatId,
      providerModel = "openai:gpt-4o",
      ...body
    } = JSON.parse(args[1].body);

    return streamText({
      ...body,
      model: await getProviderModel(providerModel, getKey),
      tools,
    }).toDataStreamResponse();
  };
}

export const customFetch = makeFetch({
  tools: toolsConfig,
});
