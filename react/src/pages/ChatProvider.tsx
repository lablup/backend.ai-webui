import { useLocalStorageState } from 'ahooks';
import { createContext, useState } from 'react';

interface ChatProviderProps {
  children: React.ReactNode;
}

type Chat = {
  endpointId: any;
  agentId: string;
};

export type ConversationType = {
  key: string;
  label: string;
  chats: Chat[];
};

type ConversationListType = {
  conversations?: ConversationType[];
};

interface ChatContextProps {
  message: string;
  setMessage: (message: string) => void;
  conversations: ConversationType[];
  setConversations: (conversations: ConversationType[]) => void;
}

export const ChatContext = createContext<ChatContextProps | undefined>(
  undefined,
);

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [conversationList, setConversationList] =
    useLocalStorageState<ConversationListType>('CHAT_LOCAL_HISTORY8', {
      defaultValue: {
        conversations: [
          {
            key: '1',
            label: 'Chat',
            chats: [],
          },
        ],
      },
    });

  const conversations = conversationList?.conversations || [];
  const setConversations = (convs: ConversationType[]) =>
    setConversationList({ conversations: convs });

  return (
    <ChatContext.Provider
      value={{ message, setMessage, conversations, setConversations }}
    >
      {children}
    </ChatContext.Provider>
  );
};
