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

const CHAT_CACHE_KEY = 'backendaiwebui.chat.message_cache';

export function chatLocalStorageCache() {
  const cache = new Map<string, ChatCacheDataType>(
    JSON.parse(localStorage.getItem(CHAT_CACHE_KEY) ?? '[]'),
  );

  return {
    cache,
    save() {
      localStorage.setItem(
        CHAT_CACHE_KEY,
        JSON.stringify(Array.from(cache.entries())),
      );
    },
    clear: () => {
      cache.clear();
      localStorage.removeItem(CHAT_CACHE_KEY);
    },
  };
}

interface ChatCacheContextType {
  cache: {
    get: (key: string) => ChatCacheDataType | undefined;
    set: (key: string, value: ChatCacheDataType) => void;
    delete: (key: string) => void;
    size: () => number;
    keys: () => string[];
    save: () => void;
  };
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
  provider: typeof chatLocalStorageCache;
}

export const ChatCacheProvider: React.FC<ChatCacheProviderProps> = ({
  provider,
  children,
}) => {
  const cacheRef = useRef<ReturnType<typeof chatLocalStorageCache>>(undefined);

  if (!cacheRef.current) {
    cacheRef.current = provider();
  }

  const value = {
    cache: {
      set: (key: string, value: ChatCacheDataType) => {
        cacheRef.current?.cache.set(key, value);
      },
      get: (key: string) => {
        return cacheRef.current?.cache.get(key);
      },
      delete: (key: string) => {
        cacheRef.current?.cache.delete(key);
      },
      size: () => cacheRef.current?.cache.size ?? 0,
      keys: () => {
        return Array.from(cacheRef.current?.cache.keys() || []);
      },
      save: () => {
        cacheRef.current?.save();
      },
    },
  };

  document.addEventListener('backend-ai-logout', () => {
    cacheRef.current?.clear();
  });

  return (
    <ChatCacheContext.Provider value={value}>
      {children}
    </ChatCacheContext.Provider>
  );
};

function extarctLabelIndex(label: string) {
  const match = label.match(/(\d+)/);
  return match ? Number.parseInt(match[0], 10) : 0;
}

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
          ? Math.max(...list.map((c) => extarctLabelIndex(c.label)))
          : 0;
      const conversation = {
        id: conversationId,
        chats: [chatId],
        provider,
        label: `Chat ${maxLabelIndex + 1}`,
        updatedAt: new Date().toISOString(),
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
      cache.save();

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
        cache.save();

        remove(index);

        // Change label without index if there are only one conversation
        // list is not updated yet, so length is still 2
        if (list.length === 2) {
          const targetIndex = index === 0 ? 1 : 0;
          list[targetIndex].label = 'Chat';
          cache.set(list[targetIndex].id, list[targetIndex]);
          cache.save();
        }

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

  const isEmptyCache = () => cache.size() === 0;

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
  const { list, remove, push, insert, replace, resetList } =
    useDynamicList<ChatData>();
  const conversationRef = useRef(
    cache.get(conversationId) as ChatConversationData,
  );
  const conversation = conversationRef.current;

  const updateConversation = useCallback(
    (data: ChatConversationData) => {
      const updatedConversation: ChatConversationData = _.merge({}, data, {
        updateAt: new Date().toISOString(),
      });
      cache.set(conversation.id, updatedConversation);
    },
    [cache, conversation],
  );

  const addChat = useCallback(
    ({ provider, id }: ChatData) => {
      const chat = {
        id: creatChatModelId('/chat'),
        conversationId: conversation.id,
        sync: true,
        usingParameters: false,
        parameters: defaultChatParameters,
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

      cache.save();

      return chat.id;
    },
    [push, insert, cache, updateConversation, conversation],
  );

  const removeChat = useCallback(
    (id: string) => {
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) {
        return;
      }

      conversation.chats = conversation.chats.filter((chatId) => chatId !== id);
      updateConversation(conversation);

      cache.delete(id);
      cache.save();

      remove(index);
    },
    [remove, list, updateConversation, cache, conversation],
  );

  const updateChat = useCallback(
    (id: string, data: DeepPartial<ChatData>) => {
      const chat = cache.get(id) as ChatData;

      if (chat) {
        updateConversation(conversation);

        const updatedChat = _.merge({}, chat, data);
        cache.set(id, updatedChat);
        cache.save();

        const index = list.findIndex((item) => item.id === id);
        replace(index, updatedChat);
      }
    },
    [cache, list, replace, updateConversation, conversation],
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
        updateConversation(conversation);

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
    [cache, updateChat, updateConversation, conversation],
  );

  const clearMessages = useCallback(
    (id: string) => {
      const chat = cache.get(id) as ChatData;
      if (chat) {
        updateConversation(conversation);
        chat.messages = [];

        cache.set(id, chat);
        cache.save();

        const index = list.findIndex((item) => item.id === id);
        replace(index, chat);
      }
    },
    [cache, replace, list, updateConversation, conversation],
  );

  useEffect(() => {
    const conversation = cache.get(conversationId) as ChatConversationData;
    if (conversation) {
      const chats = conversation.chats.map(
        (chatId) => cache.get(chatId) as ChatData,
      );
      resetList([...chats]);
      conversationRef.current = conversation;
    }
  }, [conversationId, resetList, cache]);

  return {
    addChat,
    removeChat,
    updateChat,
    getChat,
    saveMessage,
    clearMessages,
    chats: list,
  };
}

export default ChatCacheProvider;
