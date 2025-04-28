import {
  defaultChatParameters,
  type ChatConversationData,
  type ChatData,
  type ChatProviderData,
} from './ChatModel';
import { useDynamicList } from 'ahooks';
import _ from 'lodash';
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

export const creatChatModelId = createIdGenerator();

type ChatCacheDataType =
  | ChatData
  | ChatConversationData
  | ChatConversationData[]
  | string
  | string[];

type ChatCacheDataTypeSet = Map<string, ChatCacheDataType>;

function chatLocalStorageProvider() {
  const CHAT_CACHE_KEY = `chat-cache-${Math.random()}`;
  return {
    get(): ChatCacheDataTypeSet {
      return JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? '[]');
    },
    set(cache: ChatCacheDataTypeSet) {
      localStorage.setItem(
        CHAT_CACHE_KEY,
        JSON.stringify(Array.from(cache.entries())),
      );
    },
  };
}

function createChatLocalStorageCache(
  provider: ReturnType<typeof chatLocalStorageProvider>,
) {
  const cache = new Map<string, ChatCacheDataType>(provider.get());

  window.addEventListener('beforeunload', () => {
    provider.set(cache);
  });

  return cache;
}

interface ChatCacheContextType {
  cache: ChatCacheDataTypeSet;
}

const ChatCacheContext = createContext<ChatCacheContextType | undefined>(
  undefined,
);

export const useChatCache = () => {
  const context = useContext(ChatCacheContext);
  if (!context) {
    throw new Error('useChatCache must be used within a ChatCacheProvider');
  }
  return context;
};

interface ChatCacheProviderProps {
  children: ReactNode;
}

export const ChatCacheProvider: React.FC<ChatCacheProviderProps> = ({
  children,
}) => {
  const cache = useRef<ChatCacheDataTypeSet>(
    new Map<string, ChatCacheDataType>(),
  );

  useEffect(() => {
    cache.current = createChatLocalStorageCache(chatLocalStorageProvider());
  }, []);

  const value = {
    cache: cache.current,
  };

  return (
    <ChatCacheContext.Provider value={value}>
      {children}
    </ChatCacheContext.Provider>
  );
};

export function useConversations() {
  const { cache } = useChatCache();
  const { list, remove, push, resetList } =
    useDynamicList<ChatConversationData>();

  const addConversation = useCallback(
    (provider: ChatProviderData) => {
      const conversationId = creatChatModelId('/conversation');
      const chatId = creatChatModelId('/chat');
      const maxLabelIndex =
        list.length > 0
          ? Math.max(
              ...list.map((c) =>
                Number.parseInt(c.label.split(' ').pop() || '0', 10),
              ),
            )
          : 0;
      const conversation = {
        id: conversationId,
        chats: [chatId],
        provider,
        label: `Chat ${maxLabelIndex + 1}`,
      };
      const chat = {
        id: chatId,
        conversationId: conversation.id,
        sync: true,
        provider,
        usingParameters: false,
        parameters: defaultChatParameters,
      };

      cache.set(conversation.id, conversation);
      cache.set(chat.id, chat);

      push(conversation);

      return conversation;
    },
    [push, list, cache],
  );

  const removeConversation = useCallback(
    (id: string) => {
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      const conversation = cache.get(id) as ChatConversationData;
      if (conversation) {
        // Clean up all chats in the conversation
        for (const chatId of conversation.chats) {
          cache.delete(chatId);
        }

        // Clean up the conversations and list
        cache.delete(id);
        remove(index);
      }
    },
    [remove, list, cache],
  );

  const reset = useCallback(() => {
    const conversations = Array.from(cache.keys())
      .filter((key) => key.startsWith('/conversation'))
      .map((key) => cache.get(key) as ChatConversationData);
    resetList([...conversations]);
  }, [resetList, cache]);

  const isEmptyCache = useCallback(() => cache.size === 0, [cache]);

  return {
    addConversation,
    removeConversation,
    reset,
    isEmptyCache,
    conversations: list,
  };
}

export function useConversation(conversationId: string) {
  const { cache } = useChatCache();
  const { list, remove, push, replace, resetList } = useDynamicList<ChatData>();

  const addChat = useCallback(
    (provider: ChatProviderData) => {
      const conversation = cache.get(conversationId) as ChatConversationData;
      const chat = {
        id: creatChatModelId('/chat'),
        conversationId: conversation.id,
        sync: true,
        provider,
        usingParameters: false,
        parameters: defaultChatParameters,
      };

      cache.set(chat.id, chat);
      cache.set(conversation.id, conversation);

      conversation.chats.push(chat.id);
      push(chat);

      return chat.id;
    },
    [push, conversationId, cache],
  );

  const removeChat = useCallback(
    (id: string) => {
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      const conversation = cache.get(conversationId) as ChatConversationData;
      if (conversation) {
        conversation.chats = conversation.chats.filter(
          (chatId) => chatId !== id,
        );
        cache.set(conversation.id, conversation);
      }

      cache.delete(id);
      remove(index);
    },
    [remove, list, conversationId, cache],
  );

  const updateChat = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      const chat = cache.get(id) as ChatData;

      if (chat) {
        const updatedChat: ChatData = _.merge({}, chat, data);
        cache.set(id, updatedChat);

        const index = list.findIndex((item) => item.id === id);
        replace(index, updatedChat);

        return updatedChat;
      }
      return undefined;
    },
    [cache, list, replace],
  );

  const getChat = useCallback(
    (id: string) => {
      return (cache.get(id) as ChatData) || {};
    },
    [cache],
  );

  useEffect(() => {
    const conversation = cache.get(conversationId) as ChatConversationData;
    if (conversation) {
      const chats = conversation.chats.map(
        (chatId) => cache.get(chatId) as ChatData,
      );
      resetList([...chats]);
    }
  }, [conversationId, resetList, cache]);

  return {
    addChat,
    removeChat,
    updateChat,
    getChat,
    chats: list,
  };
}

export default ChatCacheProvider;
