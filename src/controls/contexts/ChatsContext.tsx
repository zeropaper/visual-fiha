import {
  type UIMessage,
  type UseChatOptions,
  useChat as useChatOriginal,
} from "@ai-sdk/react";
import { customTransport } from "@controls/features/AIAssistant/utils/transport";
import type { ChatTransport } from "ai";
import { useEffect, useMemo, useState } from "react";
import { type ReactNode, createContext, useContext } from "react";

export type StorageSubscriptionFn = (value: any) => void;

export interface StorageAdapter {
  getItem: (key: string) => Promise<any>;
  setItem: (key: string, value: any) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  subscribe?: (key: string, callback: StorageSubscriptionFn) => () => void;
}

export type StorageAdapterFactory = (domain: string) => StorageAdapter;

export const localStorageAdapter: StorageAdapter = {
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key) || ""),
  setItem: (key: string, value: string) =>
    Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
  subscribe: (key: string, callback: (value: any) => void) => {
    const handler = () => {
      callback(localStorage.getItem(key));
    };
    window.addEventListener(`storage:${key}`, handler);
    return () => {
      window.removeEventListener(`storage:${key}`, handler);
    };
  },
};

// Fix the type definitions to be more flexible with UI_MESSAGE constraints
type ChatData = Omit<UseChatOptions<UIMessage>, "transport"> & {
  name?: string;
};

type ChatsContextType = {
  chats: Record<string, ChatData>;
  currentChatId: string;
  transport?: ChatTransport<UIMessage>;
  setCurrentChatId: (chatId: string) => Promise<void>;
  createChat: () => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatData: ChatData) => Promise<void>;
};

export const ChatsContext = createContext<ChatsContextType>({} as any);

export function ChatsProvider({
  children,
  storageAdapter = localStorageAdapter,
  transport = customTransport,
  id,
}: {
  children: ReactNode;
  storageAdapter?: StorageAdapter;
  transport?: ChatTransport<UIMessage>;
  id?: string;
}) {
  const [currentChatId, setCurrentChatId] = useState<string>(id || "");
  useEffect(() => {
    if (id) {
      setCurrentChatId(id);
    }
  }, [id]);

  const [chats, setChats] = useState<Record<string, ChatData>>({});
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!storageAdapter.subscribe) {
      return;
    }
    const unsubscribe = storageAdapter.subscribe("currentChatId", (chatId) => {
      if (chatId) {
        setCurrentChatId(chatId);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!storageAdapter.subscribe) {
      return;
    }
    const unsubscribe = storageAdapter.subscribe("chats", (chats) => {
      if (chats) {
        setChats(chats);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const value = useMemo<ChatsContextType>(
    () => ({
      currentChatId,
      chats,
      transport,
      async setCurrentChatId(id: string) {
        console.log("Setting current chat ID to", id);
        const chatId = await storageAdapter.getItem("currentChatId");
        if (chatId === id || !id) {
          return;
        }
        await storageAdapter.setItem("currentChatId", id);
        setCurrentChatId(id);
      },
      async createChat() {
        const currentChats = await storageAdapter.getItem("chats");
        const chats = currentChats || {};
        const chatId = `chat-${Date.now()}`;
        chats[chatId] = {
          // api: "background://",
          // initialMessages: [],
          // initialInput: "",
          // maxSteps: 5,
          // sendExtraMessageFields: false,
        };
        await storageAdapter.setItem("chats", chats);
        await storageAdapter.setItem("currentChatId", chatId);
        return chatId;
        // return Promise.resolve(currentChatId);
      },
      async deleteChat(chatId: string) {
        const currentChats = await storageAdapter.getItem("chats");
        const chats = currentChats || {};
        delete chats[chatId];
        await storageAdapter.setItem("chats", chats);
        const currentChatId = await storageAdapter.getItem("currentChatId");
        if (currentChatId === chatId) {
          await storageAdapter.removeItem("currentChatId");
        }
      },
      async updateChat(chatData: ChatData) {
        const currentChats = await storageAdapter.getItem("chats");
        const chats = currentChats || {};
        if (!currentChatId) {
          throw new Error("No current chat ID set");
        }
        if (!chats[currentChatId]) {
          throw new Error(`Chat with ID ${currentChatId} does not exist`);
        }
        console.log("Updating chat", currentChatId, chatData);
        chats[currentChatId] = {
          ...(chats[currentChatId] || {}),
          ...(chatData || {}),
        };
        await storageAdapter.setItem("chats", chats);
      },
    }),
    [currentChatId, chats, transport, storageAdapter],
  );
  return (
    <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
  );
}

export function useChats<
  UI_MESSAGE extends UIMessage = UIMessage,
>(): ChatsContextType & {
  currentChat: UseChatOptions<UI_MESSAGE>;
} {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider");
  }
  return {
    ...context,
    currentChat: useChatOriginal<UI_MESSAGE>({
      ...context.chats[context.currentChatId],
      transport: context.transport as ChatTransport<UI_MESSAGE>,
    }),
    async setCurrentChatId(chatId: string) {
      context.setCurrentChatId(chatId);
    },
  };
}

export function useChat<UI_MESSAGE extends UIMessage = UIMessage>(
  options?: UseChatOptions<UI_MESSAGE>,
) {
  const { currentChat, transport } = useChats<UI_MESSAGE>();
  return useChatOriginal<UI_MESSAGE>({
    ...options,
    ...(currentChat || {}),
    transport: transport as ChatTransport<UI_MESSAGE>,
  });
}
