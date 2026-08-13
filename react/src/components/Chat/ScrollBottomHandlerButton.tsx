/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { IconButton } from '@astryxdesign/core/IconButton';
import { useEventNotStable } from 'backend.ai-ui';
import { ArrowDownIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  useEffect(() => {
    if (atBottom && autoScroll) {
      onScrollToBottom?.('auto');
    }
  }, [atBottom, autoScroll, onScrollToBottom]);

  return (
    <IconButton
      icon={<ArrowDownIcon />}
      label={t('chatui.ScrollToBottom')}
      onClick={() => {
        onScrollToBottom && onScrollToBottom('click');
      }}
    />
  );
};

export default ScrollBottomHandlerButton;
