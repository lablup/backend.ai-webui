import {
  defaultChatParameters,
  type ChatConversationData,
  type ChatData,
  type ChatProviderData,
  type ChatMessage
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
  useState,
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
  const CHAT_CACHE_KEY = 'backendaiwebui.chat.message-cache';
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

const provider = chatLocalStorageProvider();
const cache = createChatLocalStorageCache(provider);

export const ChatCacheProvider: React.FC<ChatCacheProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    const updateCache = () => {
      provider.set(cache);
    };

    document.addEventListener('locationPath:changed', updateCache);

    return () => {
      document.removeEventListener('locationPath:changed', updateCache);
    };
  }, []);

  const value = {
    provider: provider,
    cache: cache,
  };

  return (
    <ChatCacheContext.Provider value={value}>
      {children}
    </ChatCacheContext.Provider>
  );
};

export function useConversations() {
  const { cache } = useChatCache();
  const [activeConversation, setActiveConversation] = useState<
    string | undefined
  >();

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
        messages: [],
      };

      cache.set(conversation.id, conversation);
      cache.set(chat.id, chat);

      push(conversation);

      setActiveConversation(conversation.id);

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

        if (activeConversation === id) {
          setActiveConversation((prevId) => {
            const index = list.findIndex((id) => id.id === prevId);
            return list[Math.max(index - 1, 0)].id;
          });
        }
      }
    },
    [remove, list, cache, activeConversation],
  );

  const reset = useCallback(() => {
    const conversations = Array.from(cache.keys())
      .filter((key) => key.startsWith('/conversation'))
      .map((key) => cache.get(key) as ChatConversationData);
    resetList([...conversations]);

    setActiveConversation(conversations[0]?.id);
  }, [resetList, cache]);

  const isEmptyCache = () => cache.size === 0;

  return {
    activeConversation,
    setActiveConversation,
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
        messages: [],
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
      }
    },
    [cache, list, replace],
  );

  const getChat = useCallback(
    (id: string) => {
      return (cache.get(id) as ChatData) || {};
    },
    [cache],
  );

  const saveMessage = useCallback(
    (id: string, message: ChatMessage) => {
      const chat = cache.get(id) as ChatData;
      if (chat) {
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
      }
    },
    [cache, updateChat],
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
    saveMessage,
    chats: list,
  };
}

export default ChatCacheProvider;
