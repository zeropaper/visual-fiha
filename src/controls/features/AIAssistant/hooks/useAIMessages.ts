import { useCallback, useEffect, useState } from "react";
import { getStorageKey } from "../config/aiConfig";
import type { VFMessage } from "../types";

/**
 * Custom hook for managing AI conversation messages with localStorage persistence
 */
export function useAIMessages(layerId: string) {
  const storageKey = getStorageKey(layerId);

  // Load messages from localStorage
  const loadMessagesFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Failed to load messages from localStorage:", error);
    }
    return [];
  }, [storageKey]);

  // Save messages to localStorage
  const saveMessagesToStorage = useCallback(
    (messages: VFMessage[]) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      } catch (error) {
        console.warn("Failed to save messages to localStorage:", error);
      }
    },
    [storageKey],
  );

  // State for messages
  const [messages, setMessages] = useState<VFMessage[]>(() =>
    loadMessagesFromStorage(),
  );

  // Save messages to localStorage whenever they change
  useEffect(() => {
    saveMessagesToStorage(messages);
  }, [messages, saveMessagesToStorage]);

  // Clear conversation
  const clearConversation = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear the conversation history? This action cannot be undone.",
      )
    ) {
      setMessages([]);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Add a single message
  const addMessage = useCallback((message: VFMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  // Add multiple messages
  const addMessages = useCallback((newMessages: VFMessage[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
  }, []);

  // Update messages completely
  const updateMessages = useCallback((newMessages: VFMessage[]) => {
    setMessages(newMessages);
  }, []);

  return {
    messages,
    addMessage,
    addMessages,
    updateMessages,
    clearConversation,
  };
}
