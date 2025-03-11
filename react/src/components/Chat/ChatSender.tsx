import { Sender, SenderProps } from '@ant-design/x';
import { GetRef } from 'antd';
import { useEffect, useRef } from 'react';

interface ChatSenderProps extends SenderProps {
  loading?: boolean;
  autoFocus?: boolean;
  onStop?: () => void;
  onSend?: () => void;
}

// @TODO: 외부의 공유 데이터를 여기 아래로 모두 가져온다. jotai provider 를 사용한다.
// setInput 을 받거나 다른 방법으로 입력을 공유한다. DOM event, or ref?
// Chat Sender 에서 onChage 시에 외부로 이벤트를 올리는것을 개선
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
