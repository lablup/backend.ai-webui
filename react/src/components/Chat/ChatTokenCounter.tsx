/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTokenCount } from '../../hooks/useTokenizer';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { UIMessage } from 'ai';
import { Typography, Tag, Divider } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { t } from 'i18next';
import { map, last } from 'lodash-es';
import React from 'react';

interface ChatTokenCounterProps {
  input: string;
  messages: UIMessage[];
  startTime: number | null;
  endTime: number | null;
  style?: React.CSSProperties;
}

const ChatTokenCounter: React.FC<ChatTokenCounterProps> = ({
  input,
  messages,
  startTime,
  endTime,
}) => {
  'use memo';

  const inputTokenCount = useTokenCount(input);
  const allChatMessageString = map(messages, (message) =>
    message?.parts
      ?.filter((part) => part.type === 'text')
      .map((part) => part.text)
      .join(''),
  ).join('');
  const chatsTokenCount = useTokenCount(allChatMessageString);
  const totalTokenCount = inputTokenCount + chatsTokenCount;
  const lastAssistantMessage = last(messages);
  const lastAssistantMessageString =
    lastAssistantMessage?.role === 'assistant'
      ? lastAssistantMessage?.parts
          ?.filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('') || ''
      : '';

  const lastAssistantTokenCount = useTokenCount(lastAssistantMessageString);
  let tokenPerSecond = 0;
  if (lastAssistantTokenCount > 0 && startTime) {
    // eslint-disable-next-line react-hooks/purity
    const elapsedSec = ((endTime ?? Date.now()) - startTime) / 1000;
    tokenPerSecond = elapsedSec > 0 ? lastAssistantTokenCount / elapsedSec : 0;
  }

  return (
    <BAIFlex justify="end" align="end">
      <Tag style={{ margin: 0 }}>
        <span>
          <Typography.Text>{tokenPerSecond.toFixed(1)}</Typography.Text>{' '}
          <Typography.Text type="secondary">TPS</Typography.Text>
        </span>{' '}
        <Divider orientation="vertical" />
        <span>
          <Typography.Text>{totalTokenCount}</Typography.Text>{' '}
          <Typography.Text type="secondary"> tokens</Typography.Text>
        </span>
        <QuestionIconWithTooltip title={t('chatui.TokenCounterTooltip')} />
      </Tag>
    </BAIFlex>
  );
};

export default ChatTokenCounter;
