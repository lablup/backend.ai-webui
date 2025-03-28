import { useEventNotStable } from '../../hooks/useEventNotStable';
import { Button } from 'antd';
import { ArrowDownIcon } from 'lucide-react';
import React, { useEffect } from 'react';

interface ScrollBottomHandlerButtonProps {
  autoScroll?: boolean;
  atBottom?: boolean;
  onScrollToBottom: (type: 'click' | 'auto') => void;
}
const ScrollBottomHandlerButton: React.FC<ScrollBottomHandlerButtonProps> = ({
  autoScroll,
  atBottom,
  ...props
}) => {
  const onScrollToBottom = useEventNotStable(props.onScrollToBottom);

  useEffect(() => {
    if (atBottom && autoScroll) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, autoScroll, onScrollToBottom]);

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
