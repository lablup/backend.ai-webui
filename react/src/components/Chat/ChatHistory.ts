/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useWebUINavigate } from '../../hooks';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  DEFAULT_CHAT_PARAMETERS,
  type ChatData,
  type ChatProviderData,
  type ChatMessage,
} from './ChatModel';
import { copyCustomEndpointApiKey } from './customEndpointKeyStore';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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

const generateChatDataId = createIdGenerator();

const DEFAULT_CHAT_LABEL = 'Chat';

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
  'use memo';
  const { logger } = useBAILogger();
  const [history, setHistory] = useState<ChatHistoryData[]>([]);
  const [chat, setChat] = useState<ChatHistoryData | undefined>(undefined);
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  // Set together with setChat and cleared on unmount; read by
  // saveChatMessage, whose `chat` can belong to a chat the user has left.
  const activeChatIdRef = useRef<string | undefined>(undefined);
  useEffect(
    () => () => {
      activeChatIdRef.current = undefined;
    },
    [],
  );

  const removeHistory = useCallback((id: string) => {
    chatHistoryCache.delete(id);
    setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);

    return chatHistoryCache.size();
  }, []);

  const updateHistory = useCallback(
    (data: ChatHistoryData, { select = true }: { select?: boolean } = {}) => {
      const mergedData: ChatHistoryData = _.merge({}, data, {
        updatedAt: new Date().toISOString(),
      });

      chatHistoryCache.set(data.id, mergedData);
      if (select) {
        activeChatIdRef.current = mergedData.id;
        setChat({ ...mergedData });
      }
      setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
    },
    [],
  );

  const addChatData = useCallback(
    ({ provider, id }: ChatData) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const chatData = createChatData({ provider });
      copyCustomEndpointApiKey(id, chatData.id);

      // find origin chat position to insert next to the origin chat
      const index = chat.chats.findIndex((chat) => chat.id === id);

      if (index === -1) {
        logger.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      chat.chats.splice(index + 1, 0, chatData);

      if (!getChatById(id)) {
        updateHistory({ ...chat });
        webuiNavigate(buildProjectPath(`chat/${chat.id}`), { replace: true });
        return;
      }

      updateHistory({ ...chat });
    },
    [chat, webuiNavigate, buildProjectPath, updateHistory, logger],
  );

  const removeChatData = useCallback(
    (id: string) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      // eslint-disable-next-line react-hooks/immutability -- intentional in-place mutation of cached chat data
      chat.chats = chat.chats.filter((chat) => chat.id !== id);

      updateHistory({ ...chat });
    },
    [chat, updateHistory, logger],
  );

  const updateChatData = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        logger.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      // eslint-disable-next-line react-hooks/immutability -- intentional in-place mutation of cached chat data
      chat.chats[index] = _.merge({}, chat.chats[index], data);

      const currentChat = getChatById(chat.id);
      if (currentChat) {
        // If the chat is already in the cache, update it
        currentChat.chats[index] = chat.chats[index];
        updateHistory(currentChat);
      } else {
        updateHistory({ ...chat });
        webuiNavigate(buildProjectPath(`chat/${chat.id}`), { replace: true });
      }
    },
    [chat, updateHistory, webuiNavigate, buildProjectPath, logger],
  );

  const saveChatMessage = (id: string, message: ChatMessage) => {
    if (!chat) {
      logger.error('Chat history is not initialized.');
      return;
    }

    // The reply's onFinish runs with the callback of the render that sent
    // the request, so `chat` can be stale; the cache holds the latest copy.
    const cachedChat = getChatById(chat.id);
    const isActiveChat = activeChatIdRef.current === chat.id;
    // Deleted, or left before its first save: do not bring it back.
    if (!cachedChat && !isActiveChat) return;
    const baseChat = cachedChat ?? chat;

    const index = baseChat.chats.findIndex((item) => item.id === id);
    if (index === -1) {
      logger.error(`Chat with id ${id} not found in cache.`);
      return;
    }

    const chatData = baseChat.chats[index];
    const lastMessage = chatData.messages.at(-1);

    // Overwrite the last message if it is the same message. Streamed
    // replies carry an empty id, so only a real id counts as the same.
    const messages =
      message.id && lastMessage?.id === message.id
        ? [
            ...chatData.messages.slice(0, -1),
            _.merge({}, lastMessage, {
              parts: message.parts,
            }),
          ]
        : [...chatData.messages, message];

    const chats = [...baseChat.chats];
    chats[index] = { ...chatData, messages };

    // Name a chat that still has the default label after its first user
    // message, once the first pane gets a reply; a user-set title stays.
    let label = baseChat.label;
    if (
      index === 0 &&
      message.role === 'assistant' &&
      baseChat.label === DEFAULT_CHAT_LABEL
    ) {
      const textContent = messages
        .find((item) => item.role === 'user')
        ?.parts?.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('')
        .trim();

      if (textContent) {
        label = textContent;
      }
    }

    // A reply that finished after the user left its chat is stored without
    // pulling the page back to that chat.
    updateHistory({ ...baseChat, chats, label }, { select: isActiveChat });
    if (isActiveChat && !cachedChat) {
      webuiNavigate(buildProjectPath(`chat/${chat.id}`), { replace: true });
    }
  };

  const clearChatMessage = useCallback(
    (id: string) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        logger.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chatData = chat.chats.find((item) => item.id === id);
      if (!chatData) {
        logger.error(`Chat with id ${id} not found in chat history.`);
        return;
      }

      // eslint-disable-next-line react-hooks/immutability -- intentional in-place mutation of cached chat data
      chat.chats[index].messages = [];

      updateHistory({ ...chat });
    },
    [chat, updateHistory, logger],
  );

  useEffect(() => {
    // Create a new chat history if it doesn't exist
    const cachedChat = getChatById(id);
    const chat = cachedChat ? cachedChat : createChat({ provider });

    activeChatIdRef.current = chat.id;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy id-change re-init kept as-is
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
    label: DEFAULT_CHAT_LABEL,
    chats: chats ?? [createChatData({ provider })],
    updatedAt: dateTime.toISOString(),
  };

  return newChats;
}

function sortHistoryByUpdatedAt(a: ChatHistoryData, b: ChatHistoryData) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
