import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import canvasDocs from "@docs/canvas-api.md?raw";
import inputsDocs from "@docs/inputs.md?raw";
import layersDocs from "@docs/layers.md?raw";
import workerDocs from "@docs/runtime-worker.md?raw";
import threejsDocs from "@docs/threejs-api.md?raw";
import type { Attachment } from "ai";
import { type ToolCall, type ToolSet, streamText } from "ai";
import type * as _monaco from "monaco-editor";
import { createOllama } from "ollama-ai-provider";
import type { LayerConfig } from "src/types";
import { z } from "zod";

interface ProviderKeys {
  openai?: string;
  mistral?: string;
  ollama?: string;
}

export function getCredentials(): ProviderKeys {
  const stored = JSON.parse(
    localStorage.getItem("ai-assistant-credentials") || "{}",
  );
  return {
    openai: import.meta.env.VITE_OPENAI_API_KEY || stored.openai,
    mistral: import.meta.env.VITE_MISTRAL_API_KEY || stored.mistral,
    ollama: import.meta.env.VITE_OLLAMA_SERVER || stored.ollama,
  };
}

export function hasCredentials() {
  const stored = getCredentials();
  return stored.openai || stored.mistral || stored.ollama?.startsWith("http");
}

export async function getProviderApiKey(provider: keyof ProviderKeys) {
  return getCredentials()[provider] || "";
}

async function getProviderModel(
  id: `${string}:${string}`,
  getKey: (provider: keyof ProviderKeys) => Promise<string> = getProviderApiKey,
) {
  const [provider, model] = id.split(":") as [keyof ProviderKeys, string];
  const apiKey = await getKey(provider);
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey })(model);
    case "mistral":
      return createMistral({ apiKey })(model);
    case "ollama":
      return createOllama({ baseURL: apiKey })(model);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

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

export const scriptArgsSchema = z.object({
  role: z.enum(["setup", "animation"]),
  type: z.enum(["worker", "layer"]),
  id: z.string(),
});

export const editorChangeArgsSchema = z.object({
  code: z.string(),
});

export type ToolsCall = ToolCall<
  "updateScript",
  z.infer<typeof editorChangeArgsSchema>
>;

export function handleToolCall(
  {
    toolCall,
  }: {
    toolCall: ToolsCall;
  },
  {
    editor,
  }: {
    editor: _monaco.editor.IStandaloneCodeEditor;
    onSwitchRole: () => void;
  },
) {
  console.log("Handling tool call:", toolCall);
  switch (toolCall.toolName) {
    case "updateScript":
      const { code } = toolCall.args;
      console.log("Changing script to:", code);
      editor.setValue(code);
      break;
    default:
      console.warn("Unknown tool call:", toolCall);
  }
}

export const customFetch = makeFetch({
  tools: {
    updateScript: {
      description: "Update the current script",
      parameters: editorChangeArgsSchema,
    },
  },
});

export async function fileToAttachment(file: File): Promise<Attachment> {
  return {
    name: file.name,
    url: URL.createObjectURL(file),
    contentType: file.type,
  };
}

export async function filesToAttachments(files: File[]): Promise<Attachment[]> {
  return Promise.all(files.map(fileToAttachment));
}

export function getDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function getSystemMessage(
  layerType?: LayerConfig["type"] | null,
  type?: "worker" | "layer",
  role?: "setup" | "animation",
) {
  return {
    role: "system" as const,
    id: "system",
    content:
      type === "layer"
        ? `You are helping with the editing of a ${layerType} layer ${role} script for a visual programming environment.

You are using the tools at your disposal when relevant.

Here's some documentation about the visual programming environment:

#${inputsDocs.replaceAll("\n#", "\n##")}

#${layersDocs.replaceAll("\n#", "\n##")}

#${(layerType === "canvas" ? canvasDocs : threejsDocs).replaceAll("\n#", "\n##")}`
        : `You are helping with the editing of a worker script for a visual programming environment.
Here's some documentation:

#${inputsDocs.replaceAll("\n#", "\n##")}

#${workerDocs.replaceAll("\n#", "\n##")}`,
  };
}
