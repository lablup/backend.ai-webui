import { Sender, SenderProps } from '@ant-design/x';
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
  const senderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus && senderRef.current) {
      // FIXME: The Sender doesn't support autoFocus and tabIndex. To achieve auto-focusing, I had to resort to using querySelector.
      const inputRef = senderRef.current.querySelector('textarea');
      if (inputRef) {
        inputRef.focus();
      }
    }
  }, [autoFocus]);

  return (
    <Sender
      ref={senderRef}
      {...senderProps}
      loading={loading}
      onSubmit={() => {
        if (loading) {
          onStop && onStop();
        } else {
          onSend && onSend();
        }
      }}
      submitType="enter"
    />
  );
};
export default ChatSender;
