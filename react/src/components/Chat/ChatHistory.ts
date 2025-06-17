import { useWebUINavigate } from '../../hooks';
import {
  DEFAULT_CHAT_PARAMETERS,
  type ChatData,
  type ChatProviderData,
  type ChatMessage,
} from './ChatModel';
import _ from 'lodash';
import { customAlphabet } from 'nanoid/non-secure';
import { useEffect, useCallback, useState } from 'react';

// Utils for chat history cache
const createIdGenerator = () => {
  const generator = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    8,
  );
  return (prefix: string) => `${prefix}/${generator()}`;
};

const generateChatDataId = createIdGenerator();

export function generateChatId(): string {
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

export function useHistory(id: string, provider: ChatProviderData) {
  const [history, setHistory] = useState<ChatHistoryData[]>([]);
  const [chat, setChat] = useState<ChatHistoryData | undefined>(undefined);
  const webuiNavigate = useWebUINavigate();

  const removeHistory = useCallback((id: string) => {
    chatHistoryCache.delete(id);
    setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);

    return chatHistoryCache.size();
  }, []);

  const updateHistory = useCallback((data: ChatHistoryData) => {
    const mergedData: ChatHistoryData = _.merge({}, data, {
      updatedAt: new Date().toISOString(),
    });

    chatHistoryCache.set(data.id, mergedData);
    setChat({ ...mergedData });
    setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
  }, []);

  const addChatData = useCallback(
    ({ provider, id }: ChatData) => {
      if (!chat) {
        console.error('Chat history is not initialized.');
        return;
      }

      const chatData = createChatData({ provider });

      // find origin chat position to insert next to the origin chat
      const index = chat.chats.findIndex((chat) => chat.id === id);

      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      chat.chats.splice(index + 1, 0, chatData);

      if (!getChatById(id)) {
        updateHistory({ ...chat });
        webuiNavigate(`/chat/${chat.id}`, { replace: true });
        return;
      }

      updateHistory({ ...chat });
    },
    [chat, webuiNavigate, updateHistory],
  );

  const removeChatData = useCallback(
    (id: string) => {
      if (!chat) {
        console.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      chat.chats = chat.chats.filter((chat) => chat.id !== id);

      updateHistory({ ...chat });
    },
    [chat, updateHistory],
  );

  const updateChatData = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      if (!chat) {
        console.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      chat.chats[index] = _.merge({}, chat.chats[index], data);

      const currentChat = getChatById(chat.id);
      if (currentChat) {
        // If the chat is already in the cache, update it
        currentChat.chats[index] = chat.chats[index];
        updateHistory(currentChat);
      } else {
        updateHistory({ ...chat });
        webuiNavigate(`/chat/${chat.id}`, { replace: true });
      }
    },
    [chat, updateHistory, webuiNavigate],
  );

  const saveChatMessage = useCallback(
    (id: string, message: ChatMessage) => {
      if (!chat) {
        console.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chatData = chat.chats[index];
      const lastMessage = chatData.messages.at(-1);

      // Overwrite the last message if it is the same message
      if (lastMessage?.id === id) {
        chat.chats[index].messages = [
          ...chatData.messages.slice(0, -1),
          _.merge({}, lastMessage, {
            content: message.content,
            parts: message.parts,
          }),
        ];
      } else {
        chat.chats[index].messages = [...chatData.messages, message];
      }

      // Update the chat label with the first chat data message content
      if (
        index === 0 &&
        chat.chats[index].messages.length === 2 &&
        message.role === 'assistant'
      ) {
        // Change the chat label to the first user message content
        chat.label = chat.chats[0].messages[0].content ?? chat.label;
      }

      const currentChat = getChatById(chat.id);
      if (currentChat) {
        // If the chat is already in the cache, update it
        currentChat.chats[index] = chat.chats[index];
        updateHistory(currentChat);
      } else {
        updateHistory({ ...chat });
        webuiNavigate(`/chat/${chat.id}`, { replace: true });
      }
    },
    [chat, updateHistory, webuiNavigate],
  );

  const clearChatMessage = useCallback(
    (id: string) => {
      if (!chat) {
        console.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chatData = chat.chats.find((item) => item.id === id);
      if (!chatData) {
        console.error(`Chat with id ${id} not found in chat history.`);
        return;
      }

      chat.chats[index].messages = [];

      updateHistory({ ...chat });
    },
    [chat, updateHistory],
  );

  useEffect(() => {
    // Create a new chat history if it doesn't exist
    const cachedChat = getChatById(id);
    const chat = cachedChat ? cachedChat : createChat({ provider });

    setChat(chat);
    setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    chat,
    addChatData,
    removeChatData,
    updateChatData,
    saveChatMessage,
    clearChatMessage,
    history,
    removeHistory,
    updateHistory,
  };
}

export function getChatById(id: string) {
  return chatHistoryCache.get(id);
}

export function createChatData({ provider }: { provider: ChatProviderData }) {
  return {
    id: generateChatDataId('/chat'),
    sync: true,
    usingParameters: false,
    parameters: DEFAULT_CHAT_PARAMETERS,
    provider: provider,
    messages: [],
  };
}

export function createChat({
  chats,
  provider,
}: {
  chats?: ChatData[];
  provider: ChatProviderData;
}) {
  const dateTime = new Date();
  const id = generateChatId();
  const newChats: ChatHistoryData = {
    id,
    label: 'Chat',
    chats: chats ?? [createChatData({ provider })],
    updatedAt: dateTime.toISOString(),
  };

  return newChats;
}

function sortHistoryByUpdatedAt(a: ChatHistoryData, b: ChatHistoryData) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
