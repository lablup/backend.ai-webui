import { Button, Input, Space } from 'antd';
import { InputProps, InputRef } from 'antd/es/input';
import { SendIcon, SquareIcon } from 'lucide-react';
import React, { useRef, useEffect } from 'react';

const { Compact } = Space;

interface ChatInputProps extends InputProps {
  loading?: boolean;
  autoFocus?: boolean;
  onClickStop?: () => void;
  onClickSubmit?: () => void;
}
const ChatInput: React.FC<ChatInputProps> = ({
  style,
  loading,
  autoFocus,
  onClickStop,
  onClickSubmit,
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
            onClickSubmit && onClickSubmit();
          }
          e.preventDefault();
        }}
      />
      <Button
        htmlType={loading ? 'button' : 'submit'}
        icon={loading ? <SquareIcon /> : <SendIcon />}
        onClick={(e) => {
          if (loading) {
            onClickStop && onClickStop();
          }
        }}
      />
    </Compact>
  );
};

export default ChatInput;
