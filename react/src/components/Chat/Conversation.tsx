import { ConversationType } from '../../pages/ChatProvider';

type Chat = {
  endpointId: any;
  agentId: string;
};

type Endpoint = {
  defaultId: string;
};

export type ConversationProps = {
  conversation: ConversationType;
};

export const Conversation: React.FC<ConversationProps> = ({
  conversation,
  ...props
}) => {
  return <div>Conversation</div>;
};
