import {
  DefaultChatTransport,
  type ToolSet,
  convertToModelMessages,
  stepCountIs,
  streamText,
} from "ai";
import { z } from "zod";
import { scriptBaseSchema, setScriptSchema } from "../tools/scripts";
import { getSystemMessage } from "./getSystemPrompt";
import {
  type ProviderKeys,
  getProviderApiKey,
  getProviderModel,
} from "./providers";

export function makeFetch({
  tools,
  getKey = getProviderApiKey,
}: {
  tools: ToolSet;
  getKey?: (provider: keyof ProviderKeys) => Promise<string>;
}): typeof globalThis.fetch {
  return async (...args: any[]) => {
    console.log("Custom fetch called with args:", args);
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
      maxSteps = 5,
      ...body
    } = JSON.parse(args[1].body);

    const messages = convertToModelMessages(body.messages);
    const metadata =
      body.messages.filter((m: { role: string }) => m.role === "user").at(-1)
        ?.metadata || {};
    const system = getSystemMessage(metadata).content;

    return streamText({
      ...body,
      system,
      messages,
      model: await getProviderModel(providerModel, getKey),
      tools,
      // Enable multi-step calls with a step limit
      stopWhen: stepCountIs(maxSteps),
    }).toUIMessageStreamResponse();
  };
}

export const customTransport = new DefaultChatTransport({
  fetch: makeFetch({
    // The tools are all "client-side" tools that run in the browser
    // and are not executed on the server.
    tools: {
      askForConfirmation: {
        description: "Ask the user for confirmation.",
        inputSchema: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
      },
      getScript: {
        description: "Get the script for a specific role.",
        inputSchema: scriptBaseSchema,
      },
      setScript: {
        description: "Set the script for a specific role.",
        inputSchema: setScriptSchema,
      },
      takeScreenshot: {
        description: "Take a screenshot of a layer.",
        inputSchema: z.object({
          layerId: z
            .string()
            .optional()
            .describe(
              "The ID of the layer to screenshot. If not provided, screenshots all layers.",
            ),
        }),
      },
    },
  }),
  api: "background://",
});
