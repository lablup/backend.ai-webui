import { Sender, SenderProps } from '@ant-design/x';
import { GetRef } from 'antd';
import { useEffect, useRef } from 'react';

interface ChatSenderProps extends SenderProps {
  loading?: boolean;
  autoFocus?: boolean;
  onStop?: () => void;
  onSend?: () => void;
}
const ChatSender: React.FC<ChatSenderProps> = ({
  style,
  loading,
  autoFocus,
  onStop,
  onSend,
  ...senderProps
}) => {
  const senderRef = useRef<GetRef<typeof Sender>>(null);

  useEffect(() => {
    if (autoFocus && senderRef.current) {
      senderRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Sender
      ref={senderRef}
      {...senderProps}
      loading={loading}
      onSubmit={() => {
        onSend?.();
      }}
      onCancel={() => {
        onStop?.();
      }}
      submitType="enter"
    />
  );
};
export default ChatSender;
