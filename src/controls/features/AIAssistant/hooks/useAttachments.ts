import { useCallback, useState } from "react";
import type { FileUIPart } from "../types";

/**
 * Custom hook for managing file attachments in the AI Assistant
 */
export function useAttachments() {
  const [attachments, setAttachments] = useState<FileUIPart[]>([]);

  // Add files to attachments
  const addFiles = useCallback((newFiles: FileUIPart[]) => {
    setAttachments((prev) => [...prev, ...newFiles]);
  }, []);

  // Remove a specific attachment by index
  const removeFile = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all attachments
  const clearAttachments = useCallback(() => {
    setAttachments([]);
  }, []);

  return {
    attachments,
    addFiles,
    removeFile,
    clearAttachments,
  };
}
