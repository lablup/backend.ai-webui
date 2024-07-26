import { Button, Input, Space } from 'antd';
import { InputProps, InputRef } from 'antd/es/input';
import { SendIcon, SquareIcon } from 'lucide-react';
import React, { useRef, useEffect } from 'react';

const { Compact } = Space;

interface ChatInputProps extends InputProps {
  loading?: boolean;
  autoFocus?: boolean;
  onStop?: () => void;
  onSend?: () => void;
}
const ChatInput: React.FC<ChatInputProps> = ({
  style,
  loading,
  autoFocus,
  onStop,
  onSend,
  ...inputProps
}) => {
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <Compact
      style={{
        width: '100%',
        ...style,
      }}
    >
      <Input
        ref={inputRef}
        {...inputProps}
        onPressEnter={(e) => {
          if (!loading) {
            onSend && onSend();
          }
          // e.preventDefault();
        }}
      />
      <Button
        htmlType={'button'}
        icon={loading ? <SquareIcon /> : <SendIcon />}
        onClick={() => {
          if (loading) {
            onStop && onStop();
          } else {
            onSend && onSend();
          }
        }}
      />
    </Compact>
  );
};

export default ChatInput;
