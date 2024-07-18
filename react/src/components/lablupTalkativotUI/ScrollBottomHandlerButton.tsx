import { Button } from 'antd';
import { ArrowDownIcon } from 'lucide-react';
import React, { useEffect } from 'react';

interface ScrollBottomHandlerButtonProps {
  autoScroll?: boolean;
  atBottom?: boolean;
  lastMessageContent?: string;
  onScrollToBottom?: (type: 'click' | 'auto') => void;
}
const ScrollBottomHandlerButton: React.FC<ScrollBottomHandlerButtonProps> = ({
  autoScroll,
  atBottom,
  lastMessageContent,
  onScrollToBottom,
}) => {
  useEffect(() => {
    if (atBottom && autoScroll) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, autoScroll, lastMessageContent]);

  return (
    <Button
      icon={<ArrowDownIcon />}
      shape="circle"
      onClick={() => {
        onScrollToBottom && onScrollToBottom('click');
      }}
    ></Button>
  );
};

export default ScrollBottomHandlerButton;
