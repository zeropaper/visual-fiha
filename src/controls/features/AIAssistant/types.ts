import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Represents a file attachment in the AI Assistant UI.
 * Used for image uploads and screenshot attachments.
 */
export interface FileUIPart {
  /** The type of UI part - always "file" for file attachments */
  type: "file";
  /** Data URL or blob URL of the file content */
  url: string;
  /** Original filename of the uploaded file */
  filename: string;
  /** MIME type of the file (e.g., "image/png", "image/jpeg") */
  mediaType: string;
}

/**
 * Message format compatible with OpenAI's chat completion API.
 * Includes user messages, assistant responses, and tool calls.
 */
export type VFMessage = ChatCompletionMessageParam;

/**
 * Result from executing a tool function.
 * Used to send tool execution results back to the AI.
 */
export interface ToolResult {
  /** Unique identifier for the tool call this result corresponds to */
  tool_call_id: string;
  /** String content of the tool execution result */
  content: string;
}
