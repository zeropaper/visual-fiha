import type { ChatCompletionTool } from "openai/resources/chat/completions";

/**
 * Available AI tools for script manipulation and layer interaction
 */
export const AI_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getScript",
      description: "Get the current setup or animation script code",
      parameters: {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["setup", "animation"],
            description: "The role of the script to get",
          },
        },
        required: ["role"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "setScript",
      description: "Set the setup or animation script code",
      parameters: {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["setup", "animation"],
            description: "The role of the script to set",
          },
          code: {
            type: "string",
            description: "The new script code",
          },
        },
        required: ["role", "code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "takeLayerScreenshot",
      description: "Take a screenshot of the current layer",
      parameters: {
        type: "object",
        properties: {
          layerId: {
            type: "string",
            description: "The ID of the layer to screenshot",
          },
        },
        required: ["layerId"],
      },
    },
  },
];
