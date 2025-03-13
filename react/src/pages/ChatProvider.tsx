import { useLocalStorageState } from 'ahooks';
import { createContext } from 'react';

interface ChatProviderProps {
  children: React.ReactNode;
}

export type ChatType = {
  key: string;
  sync: boolean;
  agentId?: string | null;
  endpointId?: string | null;
  modelId?: string | null;
};

export type ConversationType = {
  key: string;
  label: string;
  chats: ChatType[];
};

interface ChatContextProps {
  conversations: ConversationType[];
  setConversations: (update: ConversationType[]) => void;
}

export const ChatContext = createContext<ChatContextProps>({
  conversations: [],
  setConversations: () => {},
});

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [conversations, setConversations] = useLocalStorageState<
    ConversationType[]
  >('CHAT_LOCAL_HISTORY37', {
    defaultValue: [],
  });

  // @FIXME: state management,
  // focused conversations
  // focused chat
  // get current conversations
  // update chat
  // update conversations
  //
  return (
    <ChatContext.Provider
      value={{
        conversations: conversations ?? [],
        setConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
