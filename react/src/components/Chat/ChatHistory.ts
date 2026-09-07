/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App, type MessageApi } from '../../app-shim';
import { useWebUINavigate } from '../../hooks';
import { useProjectPath } from '../../hooks/useRouteScope';
import {
  DEFAULT_CHAT_PARAMETERS,
  type ChatData,
  type ChatProviderData,
  type ChatMessage,
} from './ChatModel';
import { useBAILogger, type BAILogger } from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';
import { customAlphabet } from 'nanoid/non-secure';
import { useEffect, useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

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
  'ok' | 'attachments-dropped' | 'entries-unpersisted' | 'failed';

export interface CachePersistResult {
  status: CachePersistStatus;
  /** Kept in memory for this session, but left out of the stored copy. */
  unpersistedKeys: string[];
}

const INLINED_ATTACHMENT_URL_PREFIX = 'data:';

// localStorage is ~5 MB per origin for the whole WebUI (the spec suggests that
// figure and every current browser applies it), shared with 27 other
// `setItem` call sites. Chat history takes a slice instead of the budget.
const MAX_PERSISTED_CHARS = 2_000_000;

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
  // Entries that no longer fit the stored copy. They stay in the Map — the
  // history sidebar must not lose conversations mid-session — and are only
  // absent from the next reload.
  const unpersistedKeys = new Set<string>();

  const persistableEntries = () =>
    Array.from(cache.entries()).filter(([key]) => !unpersistedKeys.has(key));

  const write = (entries: Array<[string, T]>, stripAttachments: boolean) => {
    const serialized = JSON.stringify(
      entries,
      stripAttachments ? withoutInlinedAttachments : undefined,
    );
    if (serialized.length > MAX_PERSISTED_CHARS) {
      return false;
    }
    try {
      localStorage.setItem(cacheName, serialized);
      return true;
    } catch {
      // QuotaExceededError (or a browser refusing storage entirely): the
      // in-memory Map stays authoritative for the open conversation.
      return false;
    }
  };

  // Degrades the persisted copy instead of throwing: full payload -> without
  // inlined attachments -> leaving the least recently updated histories out.
  const persist = (): CachePersistResult => {
    const entries = persistableEntries();

    if (!dropsAttachments && write(entries, false)) {
      return { status: 'ok', unpersistedKeys: [] };
    }

    if (write(entries, true)) {
      const status: CachePersistStatus = dropsAttachments
        ? 'ok'
        : 'attachments-dropped';
      dropsAttachments = true;
      return { status, unpersistedKeys: [] };
    }
    dropsAttachments = true;

    const dropOrder = entries.slice();
    if (compareRecency) {
      dropOrder.sort(([, a], [, b]) => compareRecency(a, b));
    }
    const dropped: string[] = [];
    // Never drop the last entry — that is the conversation the user is in.
    while (dropOrder.length > 1) {
      const [key] = dropOrder.shift() as [string, T];
      unpersistedKeys.add(key);
      dropped.push(key);
      if (write(persistableEntries(), true)) {
        return { status: 'entries-unpersisted', unpersistedKeys: dropped };
      }
    }

    // Nothing fits: keep the previously stored copy rather than wiping a still
    // valid one, and take back the exclusions that bought nothing.
    dropped.forEach((key) => unpersistedKeys.delete(key));
    return { status: 'failed', unpersistedKeys: [] };
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
      unpersistedKeys.delete(key);

      return persist();
    },
    clear: () => {
      cache.clear();
      unpersistedKeys.clear();
      dropsAttachments = false;
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

const PERSIST_NOTICE_I18N_KEYS: Partial<Record<CachePersistStatus, string>> = {
  'attachments-dropped': 'chatui.HistoryAttachmentsNotStored',
  'entries-unpersisted': 'chatui.HistoryOlderChatsNotStored',
  failed: 'chatui.HistoryNotStored',
};

interface PersistReportContext {
  logger: BAILogger;
  message: MessageApi;
  t: TFunction;
  // `logger` is silent in a production build, so the toast is the only signal
  // the user gets — but persist() runs on every saved message, hence one toast
  // per status transition.
  lastReportedStatus: { current: CachePersistStatus };
}

function reportPersistResult(
  result: CachePersistResult,
  { logger, message, t, lastReportedStatus }: PersistReportContext,
) {
  switch (result.status) {
    case 'attachments-dropped':
      logger.warn(
        'Chat history exceeded the browser storage quota; attachments were dropped from the stored history.',
      );
      break;
    case 'entries-unpersisted':
      logger.warn(
        'Chat history exceeded the browser storage quota; these chats are no longer stored:',
        result.unpersistedKeys,
      );
      break;
    case 'failed':
      logger.error(
        'Chat history could not be stored; the latest changes will not survive a reload.',
      );
      break;
  }

  const noticeKey = PERSIST_NOTICE_I18N_KEYS[result.status];
  if (noticeKey && lastReportedStatus.current !== result.status) {
    message.warning(t(noticeKey));
  }
  lastReportedStatus.current = result.status;
}

export function useHistory(id: string, provider: ChatProviderData) {
  const { logger } = useBAILogger();
  const { message } = App.useApp();
  const { t } = useTranslation();
  const lastReportedStatus = useRef<CachePersistStatus>('ok');
  const [history, setHistory] = useState<ChatHistoryData[]>([]);
  const [chat, setChat] = useState<ChatHistoryData | undefined>(undefined);
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();

  const removeHistory = useCallback(
    (id: string) => {
      reportPersistResult(chatHistoryCache.delete(id), {
        logger,
        message,
        t,
        lastReportedStatus,
      });
      setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);

      return chatHistoryCache.size();
    },
    [logger, message, t],
  );

  const updateHistory = useCallback(
    (data: ChatHistoryData) => {
      const mergedData: ChatHistoryData = _.merge({}, data, {
        updatedAt: new Date().toISOString(),
      });

      reportPersistResult(chatHistoryCache.set(data.id, mergedData), {
        logger,
        message,
        t,
        lastReportedStatus,
      });
      setChat({ ...mergedData });
      setHistory([...chatHistoryCache.getAll().sort(sortHistoryByUpdatedAt)]);
    },
    [logger, message, t],
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
