import { useLocalStorageState } from 'ahooks';
import { createContext, useState } from 'react';

interface ChatProviderProps {
  children: React.ReactNode;
}

type Chat = {
  endpointId: any;
  agentId: string;
};

type ChatOption = {
  agentId?: string | null;
  endpointId?: string | null;
  modelId?: string | null;
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
  option: ChatOption | undefined;
  setOption: (option: ChatOption) => void;
  isSynchronous: boolean;
  setSynchronous: (isSynchronous: boolean) => void;
}

export const ChatContext = createContext<ChatContextProps | undefined>(
  undefined,
);

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [message, setMessage] = useState<string>('');
  const [option, setOption] = useState<ChatOption | undefined>(undefined);
  const [isSynchronous, setSynchronous] = useState(false);
  const [conversationList, setConversationList] =
    useLocalStorageState<ConversationListType>('CHAT_LOCAL_HISTORY10', {
      defaultValue: {
        conversations: [
          {
            key: '0',
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
      value={{
        message,
        setMessage,
        conversations,
        setConversations,
        option,
        setOption,
        isSynchronous, // @FIXME should be belong to each conversation
        setSynchronous,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
