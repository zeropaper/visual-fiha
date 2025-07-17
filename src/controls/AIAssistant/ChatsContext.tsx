import {
  type UseChatHelpers,
  type UseChatOptions,
  useChat as useChatOriginal,
} from "@ai-sdk/react";
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

type OriginalContext = ReturnType<typeof useChatOriginal>;
type ChatData = Omit<
  UseChatHelpers,
  "onToolCall" | "fetch" | "onResponse" | "onFinish" | "onError"
> & { name?: string };

type ChatsContext = {
  chats: Record<string, ChatData>;
  currentChatId: string;
  fetch?: typeof globalThis.fetch;
  setCurrentChatId: (chatId: string) => Promise<void>;
  createChat: () => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
  updateChat: (chatData: ChatData) => Promise<void>;
};

export const ChatsContext = createContext<ChatsContext>({} as any);

export function ChatsProvider({
  children,
  storageAdapter,
  fetch,
  id,
}: {
  children: ReactNode;
  storageAdapter: StorageAdapter;
  fetch?: typeof globalThis.fetch;
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

  const value = useMemo<ChatsContext>(
    () => ({
      currentChatId,
      chats,
      fetch,
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
      async deleteChat(chatId) {
        const currentChats = await storageAdapter.getItem("chats");
        const chats = currentChats || {};
        delete chats[chatId];
        await storageAdapter.setItem("chats", chats);
        const currentChatId = await storageAdapter.getItem("currentChatId");
        if (currentChatId === chatId) {
          await storageAdapter.removeItem("currentChatId");
        }
      },
      async updateChat(chatData) {
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
    [currentChatId, chats, fetch, storageAdapter],
  );
  return (
    <ChatsContext.Provider value={value}>{children}</ChatsContext.Provider>
  );
}

export function useChats(): ChatsContext & { currentChat: OriginalContext } {
  const context = useContext(ChatsContext);
  if (!context) {
    throw new Error("useChats must be used within a ChatsProvider");
  }
  return {
    ...context,
    currentChat: useChatOriginal({
      ...context.chats[context.currentChatId],
      api: "background://",
    }),
    async setCurrentChatId(chatId: string) {
      context.setCurrentChatId(chatId);
    },
  };
}

export function useChat(
  options?: Partial<UseChatOptions & { maxSteps: number }>,
): OriginalContext {
  const { fetch, currentChat, currentChatId, setCurrentChatId, updateChat } =
    useChats();
  const returned = useChatOriginal({
    ...options,
    ...(currentChat || {}),
    api: "background://",
    fetch: options?.fetch || fetch,
    id: currentChatId || options?.id,
  });

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   console.info("useChat '%s'", currentChatId, options);
  //   if (currentChatId) {
  //     return;
  //   }
  //   if (options?.id) {
  //     setCurrentChatId(options.id);
  //   } else {
  //     setCurrentChatId(`chat-${Date.now()}`);
  //   }
  // }, [currentChatId, options?.id]);

  // // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // useEffect(() => {
  //   if (!returned.messages?.length) {
  //     return;
  //   }
  //   updateChat(returned)
  //     .catch((e) => {
  //       console.error("Error updating chat", e);
  //     })
  //     .then(() => {
  //       console.info("Chat updated", returned.messages);
  //     });
  // }, [returned.messages]);
  return returned;
}
