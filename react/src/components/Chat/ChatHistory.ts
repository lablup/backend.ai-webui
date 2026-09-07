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
import { useBAILogger, type BAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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

export type CachePersistStatus =
  'ok' | 'attachments-dropped' | 'entries-evicted' | 'failed';

export interface CachePersistResult {
  status: CachePersistStatus;
  evictedKeys: string[];
}

const INLINED_ATTACHMENT_URL_PREFIX = 'data:';

function isInlinedFilePart(value: unknown): value is { url: string } {
  return (
    _.isPlainObject(value) &&
    _.get(value, 'type') === 'file' &&
    _.isString(_.get(value, 'url')) &&
    _.startsWith(_.get(value, 'url'), INLINED_ATTACHMENT_URL_PREFIX)
  );
}

// JSON replacer keeping an attachment's identity (type/mediaType/filename) but
// dropping the inlined base64 payload, which is what blows the quota.
function withoutInlinedAttachments(_key: string, value: unknown) {
  return isInlinedFilePart(value) ? { ...value, url: '' } : value;
}

export function createLocalStorageCache<T>(
  cacheName: string,
  // Ascending by recency (oldest first) — the eviction order once the quota is
  // hit. Without it entries are evicted in Map insertion order.
  compareRecency?: (a: T, b: T) => number,
) {
  const cache = new Map<string, T>(
    JSON.parse(localStorage.getItem(cacheName) ?? '[]'),
  );
  // Sticky: once the quota has forced attachments out, retrying the full
  // payload on every later write would only fail again.
  let dropsAttachments = false;

  const write = (entries: Array<[string, T]>, stripAttachments: boolean) => {
    try {
      localStorage.setItem(
        cacheName,
        JSON.stringify(
          entries,
          stripAttachments ? withoutInlinedAttachments : undefined,
        ),
      );
      return true;
    } catch {
      // QuotaExceededError (or a browser refusing storage entirely): the
      // in-memory Map stays authoritative for the open conversation.
      return false;
    }
  };

  // Degrades the persisted copy instead of throwing: full payload -> without
  // inlined attachments -> evicting the least recently updated histories.
  const persist = (): CachePersistResult => {
    const entries = Array.from(cache.entries());

    if (!dropsAttachments && write(entries, false)) {
      return { status: 'ok', evictedKeys: [] };
    }

    if (write(entries, true)) {
      const status: CachePersistStatus = dropsAttachments
        ? 'ok'
        : 'attachments-dropped';
      dropsAttachments = true;
      return { status, evictedKeys: [] };
    }
    dropsAttachments = true;

    const evictionOrder = entries.slice();
    if (compareRecency) {
      evictionOrder.sort(([, a], [, b]) => compareRecency(a, b));
    }
    const evictedKeys: string[] = [];
    // Never evict the last entry — that is the conversation the user is in.
    while (evictionOrder.length > 1) {
      const [key] = evictionOrder.shift() as [string, T];
      cache.delete(key);
      evictedKeys.push(key);
      if (write(Array.from(cache.entries()), true)) {
        return { status: 'entries-evicted', evictedKeys };
      }
    }

    localStorage.removeItem(cacheName);
    return { status: 'failed', evictedKeys };
  };

  return {
    cache,
    set(key: string, value: T) {
      cache.set(key, value);

      return persist();
    },
    get(key: string) {
      return cache.get(key);
    },
    size() {
      return cache.size;
    },
    delete(key: string) {
      cache.delete(key);

      return persist();
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
  (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
);

function reportPersistResult(logger: BAILogger, result: CachePersistResult) {
  switch (result.status) {
    case 'attachments-dropped':
      logger.warn(
        'Chat history exceeded the browser storage quota; attachments were dropped from the stored history.',
      );
      break;
    case 'entries-evicted':
      logger.warn(
        'Chat history exceeded the browser storage quota; evicted the oldest chats:',
        result.evictedKeys,
      );
      break;
    case 'failed':
      logger.error(
        'Chat history could not be stored; it will not survive a reload.',
      );
      break;
  }
}

export function useHistory(id: string, provider: ChatProviderData) {
  const { logger } = useBAILogger();
  const [history, setHistory] = useState<ChatHistoryData[]>([]);
  const [chat, setChat] = useState<ChatHistoryData | undefined>(undefined);
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const removeHistory = useCallback(
    (id: string) => {
      reportPersistResult(logger, chatHistoryCache.delete(id));
      setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);

      return chatHistoryCache.size();
    },
    [logger],
  );

  const updateHistory = useCallback(
    (data: ChatHistoryData) => {
      const mergedData: ChatHistoryData = _.merge({}, data, {
        updatedAt: new Date().toISOString(),
      });

      reportPersistResult(logger, chatHistoryCache.set(data.id, mergedData));
      setChat({ ...mergedData });
      setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
    },
    [logger],
  );

  const addChatData = useCallback(
    ({ provider, id }: ChatData) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const chatData = createChatData({ provider });

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

  const saveChatMessage = useCallback(
    (id: string, message: ChatMessage) => {
      if (!chat) {
        logger.error('Chat history is not initialized.');
        return;
      }

      const index = chat.chats.findIndex((item) => item.id === id);
      if (index === -1) {
        logger.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const chatData = chat.chats[index];
      const lastMessage = chatData.messages.at(-1);

      // Overwrite the last message if it is the same message
      if (lastMessage?.id === id) {
        // eslint-disable-next-line react-hooks/immutability -- intentional in-place mutation of cached chat data
        chat.chats[index].messages = [
          ...chatData.messages.slice(0, -1),
          _.merge({}, lastMessage, {
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
        const firstMessage = chat.chats[0].messages[0];
        const textContent = firstMessage.parts
          ?.filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('')
          .trim();

        // Only update label if there's actual text content
        if (textContent) {
          // eslint-disable-next-line react-hooks/immutability -- intentional in-place mutation of cached chat data
          chat.label = textContent;
        }
      }

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
    label: 'Chat',
    chats: chats ?? [createChatData({ provider })],
    updatedAt: dateTime.toISOString(),
  };

  return newChats;
}

function sortHistoryByUpdatedAt(a: ChatHistoryData, b: ChatHistoryData) {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}
