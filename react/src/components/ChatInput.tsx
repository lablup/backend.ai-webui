import { Button, Input, Space } from 'antd';
import { InputProps } from 'antd/es/input';
import { SendIcon, SquareIcon } from 'lucide-react';
import React from 'react';

const { Compact } = Space;

interface ChatInputProps extends InputProps {
  loading?: boolean;
  onClickStop?: () => void;
  onClickSubmit?: () => void;
}
const ChatInput: React.FC<ChatInputProps> = ({
  style,
  loading,
  onClickStop,
  onClickSubmit,
  ...inputProps
}) => {
  return (
    <Compact
      style={{
        width: '100%',
        ...style,
      }}
    >
      <Input
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
