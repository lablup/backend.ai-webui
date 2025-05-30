import {
  DEFAULT_CHAT_PARAMETERS,
  type ChatData,
  type ChatProviderData,
  type ChatMessage,
} from './ChatModel';
import { useDynamicList } from 'ahooks';
import _ from 'lodash';
import { customAlphabet } from 'nanoid/non-secure';
import { useEffect, useCallback, useRef, useState } from 'react';

// Utils for chat history cache
const createIdGenerator = () => {
  const generator = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    8,
  );
  return (prefix: string) => `${prefix}/${generator()}`;
};

const generateChatId = createIdGenerator();

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createLocalStorageCache<T>(cacheName: string) {
  const cache = new Map<string, T>(
    JSON.parse(localStorage.getItem(cacheName) ?? '[]'),
  );

  return {
    cache,
    set(key: string, value: T) {
      cache.set(key, value);

      localStorage.setItem(
        cacheName,
        JSON.stringify(Array.from(cache.entries())),
      );
    },
    get(key: string) {
      return cache.get(key);
    },
    size() {
      return cache.size;
    },
    delete(key: string) {
      cache.delete(key);

      localStorage.setItem(
        cacheName,
        JSON.stringify(Array.from(cache.entries())),
      );
    },
    clear: () => {
      cache.clear();
      localStorage.removeItem(cacheName);
    },
    getAll() {
      return Array.from(cache.entries()).map(([key, value]) => ({
        id: key,
        ...value,
      }));
    },
  };
}

// Chat history cache and hook to manage chat list and update chat history
export interface ChatHistoryData {
  id: string;
  label: string;
  chats: ChatData[];
  updatedAt: string;
}

const chatHistoryCache = createLocalStorageCache<ChatHistoryData>(
  'backendaiwebui.cache.chat_history',
);

export function useHistory(id: string) {
  const {
    list: chats,
    remove,
    push,
    insert,
    replace,
    resetList,
  } = useDynamicList<ChatData>();
  const [history, setHistory] = useState<ChatHistoryData[]>([]);
  const currentChat = useRef(chatHistoryCache.get(id) as ChatHistoryData);

  const resetHistory = useCallback(() => {
    setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
  }, []);

  const removeHistory = useCallback(
    (id: string) => {
      chatHistoryCache.delete(id);
      resetHistory();
    },
    [resetHistory],
  );

  const addHistory = useCallback(
    (data: ChatHistoryData) => {
      const mergedData: ChatHistoryData = _.merge({}, data, {
        updatedAt: new Date().toISOString(),
      });

      chatHistoryCache.set(data.id, mergedData);
      resetHistory();

      return mergedData;
    },
    [resetHistory],
  );

  const updateHistory = useCallback(
    (data: ChatHistoryData) => {
      const mergedData: ChatHistoryData = _.merge({}, data, {
        updatedAt: new Date().toISOString(),
      });

      currentChat.current = mergedData;
      chatHistoryCache.set(data.id, mergedData);

      resetHistory();

      return mergedData;
    },
    [resetHistory],
  );

  const addChat = useCallback(
    ({ provider, id }: ChatData) => {
      const chat = createChat({ provider });

      // find origin chat position to insert next to the origin chat
      const index = chats.findIndex((chat) => chat.id === id);
      if (index !== -1) {
        currentChat.current.chats.splice(index + 1, 0, chat);
        insert(index + 1, chat);
      } else {
        currentChat.current.chats.push(chat);
        push(chat);
      }

      chatHistoryCache.set(currentChat.current.id, currentChat.current);
    },
    [chats, push, insert],
  );

  const removeChat = useCallback(
    (id: string) => {
      const index = chats.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      remove(index);

      currentChat.current.chats = currentChat.current.chats.filter(
        (chat) => chat.id !== id,
      );
      chatHistoryCache.set(currentChat.current.id, currentChat.current);
    },
    [chats, remove],
  );

  const updateChat = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      const index = chats.findIndex((item) => item.id === id);
      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chat = currentChat.current.chats.find((item) => item.id === id);
      if (!chat) {
        console.error(`Chat with id ${id} not found in chat history.`);
        return;
      }

      const updatedChat = _.merge({}, chat, data);
      replace(index, _.merge({}, updatedChat, data));

      currentChat.current.chats[index] = updatedChat;
      chatHistoryCache.set(currentChat.current.id, currentChat.current);
    },
    [chats, replace],
  );

  const saveMessage = useCallback(
    (id: string, message: ChatMessage) => {
      const chat = currentChat.current.chats.find((item) => item.id === id);
      if (!chat) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const lastMessage = chat.messages.at(-1);
      if (lastMessage?.id === id) {
        updateChat(id, {
          messages: [
            ...chat.messages.slice(0, -1),
            _.merge({}, lastMessage, {
              content: message.content,
              parts: message.parts,
            }),
          ],
        });
      } else {
        updateChat(id, {
          messages: [...chat.messages, message],
        });
      }
    },
    [updateChat],
  );

  const clearMessage = useCallback(
    (id: string) => {
      const index = chats.findIndex((item) => item.id === id);
      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chat = currentChat.current.chats.find((item) => item.id === id);
      if (!chat) {
        console.error(`Chat with id ${id} not found in chat history.`);
        return;
      }

      const updatedChat = {
        ...chat,
        messages: [],
      };

      replace(index, updatedChat);

      currentChat.current.chats[index] = updatedChat;
      chatHistoryCache.set(currentChat.current.id, currentChat.current);
    },
    [chats, replace],
  );

  useEffect(() => {
    const chats = getChatsById(id);
    if (!chats) {
      throw new Error(`Chat history with id ${id} not found.`);
    }

    currentChat.current = chats;
    resetList(currentChat.current.chats);
    resetHistory();
  }, [id, resetList, resetHistory]);

  return {
    chat: currentChat.current,
    chats,
    addChat,
    removeChat,
    updateChat,
    saveMessage,
    clearMessage,
    history,
    addHistory,
    removeHistory,
    updateHistory,
  };
}

export function getChatsById(id: string) {
  return chatHistoryCache.get(id);
}

export function createChat({ provider }: { provider: ChatProviderData }) {
  return {
    id: generateChatId('/chat'),
    sync: true,
    usingParameters: false,
    parameters: DEFAULT_CHAT_PARAMETERS,
    provider: provider,
    messages: [],
  };
}

export function createChats({ provider }: { provider: ChatProviderData }) {
  const dateTime = new Date();
  const id = generateUUID();
  const newChats: ChatHistoryData = {
    id,
    label: 'Chat',
    chats: [createChat({ provider })],
    updatedAt: dateTime.toISOString(),
  };

  chatHistoryCache.set(newChats.id, newChats);

  return newChats;
}

function sortHistoryByUpdatedAt(a: ChatHistoryData, b: ChatHistoryData) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
