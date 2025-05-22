// @FIXME ChatStorageProvider.tsx
import {
  DEFAULT_CHAT_PARAMETERS,
  type ChatConversationData,
  type ChatData,
  type ChatProviderData,
  type ChatMessage,
} from './ChatModel';
import { useDynamicList } from 'ahooks';
import _, { remove } from 'lodash';
import { customAlphabet } from 'nanoid/non-secure';
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
  useCallback,
  useRef,
} from 'react';

const createIdGenerator = () => {
  const generator = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
    8,
  );
  return (prefix: string) => `${prefix}/${generator()}`;
};

export const generateChatId = createIdGenerator();

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

type ChatCacheDataType =
  | ChatData
  | ChatConversationData
  | ChatConversationData[]
  | string
  | string[];

const CHAT_HISTORY_CACHE_KEY = 'backendaiwebui.chat.history';

export function createChatHistoryCache() {
  const cache = new Map<string, ChatCacheDataType>(
    JSON.parse(localStorage.getItem(CHAT_HISTORY_CACHE_KEY) ?? '[]'),
  );

  return {
    cache,
    set(key: string, value: ChatCacheDataType) {
      cache.set(key, value);
      localStorage.setItem(
        CHAT_HISTORY_CACHE_KEY,
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
        CHAT_HISTORY_CACHE_KEY,
        JSON.stringify(Array.from(cache.entries())),
      );
    },
    clear: () => {
      cache.clear();
      localStorage.removeItem(CHAT_HISTORY_CACHE_KEY);
    },
  };
}

interface ChatHistoryCacheContextType {
  cache: {
    set: (key: string, value: ChatCacheDataType) => void;
    get: (key: string) => ChatCacheDataType | undefined;
    size: () => number;
    delete: (key: string) => void;
    clear: () => void;
  };
}

const ChatHistoryCacheContext = createContext<
  ChatHistoryCacheContextType | undefined
>(undefined);

export const useChatHistory = () => {
  const context = useContext(ChatHistoryCacheContext);
  if (!context) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};

interface ChatHistoryProviderProps {
  children: ReactNode;
}

export const ChatHistoryProvider: React.FC<ChatHistoryProviderProps> = ({
  children,
}) => {
  const cacheRef = useRef<ReturnType<typeof createChatHistoryCache>>(undefined);

  if (!cacheRef.current) {
    cacheRef.current = createChatHistoryCache();
  }

  document.addEventListener('backend-ai-logout', () => {
    cacheRef.current?.clear();
  });

  return (
    <ChatHistoryCacheContext.Provider
      value={{
        cache: cacheRef.current,
      }}
    >
      {children}
    </ChatHistoryCacheContext.Provider>
  );
};

export function useConversation(
  conversationId: string,
  provider: ChatProviderData,
) {
  const {
    list: chats,
    remove,
    push,
    insert,
    replace,
    resetList,
  } = useDynamicList<ChatData>();
  const { cache } = useChatHistory();
  const conversationRef = useRef(
    cache.get(conversationId) as ChatConversationData,
  );
  const conversation = conversationRef.current;

  const updateConversation = useCallback(
    (data: ChatConversationData) => {
      const updatedConversation: ChatConversationData = _.merge({}, data, {
        updateAt: new Date().toISOString(),
      });
      cache.set(conversationId, updatedConversation);
    },
    [cache, conversationId],
  );

  const addChat = useCallback(
    ({ provider, id }: ChatData) => {
      const chat = {
        id: generateChatId('/chat'),
        conversationId: conversation.id,
        sync: true,
        usingParameters: false,
        parameters: DEFAULT_CHAT_PARAMETERS,
        provider: provider,
        messages: [],
      };

      cache.set(chat.id, chat);

      const index = conversation.chats.indexOf(id);
      if (index !== -1) {
        conversation.chats.splice(index + 1, 0, chat.id);
        insert(index + 1, chat);
      } else {
        conversation.chats.push(chat.id);
        push(chat);
      }

      updateConversation(conversation);

      return chat.id;
    },
    [push, insert, cache, conversation, updateConversation],
  );

  const removeChat = useCallback(
    (id: string) => {
      const index = chats.findIndex((item) => item.id === id);

      if (index === -1) {
        return;
      }

      conversation.chats = conversation.chats.filter((chatId) => chatId !== id);
      cache.delete(id);
      remove(index);

      updateConversation(conversation);
    },
    [remove, chats, cache, conversation, updateConversation],
  );

  const updateChat = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      const chat = cache.get(id) as ChatData;
      const index = chats.findIndex((item) => item.id === id);

      if (!chat || index === -1) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      const updatedChat = _.merge({}, chat, data);

      cache.set(id, updatedChat);
      replace(index, updatedChat);

      updateConversation(conversation);
    },
    [cache, chats, replace, conversation, updateConversation],
  );

  const updateChatMessage = useCallback(
    (id: string, message?: ChatMessage) => {
      // @FIXME: find history by id then update chat and message
      const chat = cache.get(id) as ChatData;

      if (!chat) {
        console.error(`Chat with id ${id} not found in cache.`);
        return;
      }

      if (!message) {
        updateChat(id, {
          messages: [],
        });
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
    [cache, updateChat],
  );

  useEffect(() => {
    const conversation = cache.get(conversationId) as ChatConversationData;

    if (!conversation) {
      const chatId = generateChatId('/chat');

      const conversation = {
        id: conversationId,
        chats: [chatId], // @FIXME: save chat in the chats
        provider: provider,
        updatedAt: new Date().toISOString(),
      };

      const chat = {
        id: chatId,
        conversationId: conversation.id,
        sync: true,
        provider: provider,
        usingParameters: false,
        parameters: DEFAULT_CHAT_PARAMETERS,
        messages: [],
      };

      cache.set(conversation.id, conversation);
      cache.set(chat.id, chat);

      resetList([chat]);
    } else if (conversation) {
      const chats = conversation.chats.map(
        (chatId) => cache.get(chatId) as ChatData,
      );
      resetList([...chats]);
      conversationRef.current = conversation;
    }
  }, [conversationId, resetList, cache, provider]);

  return {
    addChat,
    removeChat,
    updateChat,
    updateChatMessage,
    chats,
  };
}

export default ChatHistoryProvider;
