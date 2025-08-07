import {
  DefaultChatTransport,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  stepCountIs,
  streamText,
} from "ai";
import { z } from "zod";
import { scriptBaseSchema, setScriptSchema } from "../tools/scripts";
import type { VFMessage } from "../types";
import { getSystemMessage } from "./getSystemPrompt";
import { getProviderApiKey, getProviderModel } from "./providers";

async function createChat(id: string): Promise<string> {
  localStorage.setItem(`chat:${id}`, JSON.stringify([]));
  return id;
}

async function loadChat(id: string): Promise<VFMessage[]> {
  return JSON.parse(localStorage.getItem(`chat:${id}`) || "[]");
}

function saveChat({ chatId, messages }: { chatId: string; messages: any[] }) {
  localStorage.setItem(`chat:${chatId}`, JSON.stringify(messages));
}

/**
 * Custom transport for the AI assistant that uses localStorage to persist chat messages.
 * It allows for loading previous messages and appending new messages to the chat.
 * It also handles the streaming of messages and saving them back to localStorage.
 * This transport is designed to work with the AI SDK's chat functionality.
 * It uses the `DefaultChatTransport` to handle the underlying transport logic.
 * The `fetch` method is overridden to handle the chat messages and their persistence.
 * It also integrates with the AI SDK's model streaming capabilities.
 */
export const customTransport = new DefaultChatTransport({
  fetch: async (...args: any[]) => {
    const body = JSON.parse(args[1].body);
    console.log("Custom transport fetch called with args:", args[0], body);

    const { id: chatId, message } = body;

    // load the previous messages from the server:
    const previousMessages = await loadChat(chatId || "worker");

    // append the new message to the previous messages:
    const messages = [...previousMessages, message];

    const metadata = z
      .object({
        id: z.string(),
        role: z.enum(["setup", "animation"]),
        type: z.enum(["worker", "layer"]),
        layerType: z.enum(["canvas", "threejs"]).nullable(),
      })
      .parse(message.metadata);
    const system = getSystemMessage(metadata);

    const model = await getProviderModel("openai:gpt-4o", getProviderApiKey);
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        // Write start message part with custom ID
        writer.write({
          type: "start",
          messageId: generateId(), // Generate server-side ID for persistence
        });

        const result = streamText({
          model,
          system,
          stopWhen: stepCountIs(5),
          messages: convertToModelMessages(messages),
          tools: {
            askForConfirmation: {
              description: "Ask the user for confirmation.",
              inputSchema: z.object({
                message: z
                  .string()
                  .describe("The message to ask for confirmation."),
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
              inputSchema: z.object({}),
            },
          },
        });

        writer.merge(result.toUIMessageStream({ sendStart: false })); // omit start message part
      },
      originalMessages: messages,
      onFinish: ({ messages }) => {
        saveChat({ chatId, messages });
      },
    });

    return createUIMessageStreamResponse({ stream });
  },
  api: "background://",
  prepareSendMessagesRequest({ messages, id }) {
    return { body: { message: messages[messages.length - 1], id } };
  },
});
