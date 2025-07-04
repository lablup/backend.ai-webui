import { useTokenCount } from '../../hooks/useTokenizer';
import Flex from '../Flex';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { Message } from 'ai';
import { Typography, Tag, Divider } from 'antd';
import { t } from 'i18next';
import { map, last } from 'lodash';
import React, { useMemo } from 'react';

interface ChatTokenCounterProps {
  input: string;
  messages: Message[];
  startTime: number | null;
  style?: React.CSSProperties;
}

const ChatTokenCounter: React.FC<ChatTokenCounterProps> = ({
  input,
  messages,
  startTime,
  style,
}) => {
  const inputTokenCount = useTokenCount(input);
  const allChatMessageString = useMemo(() => {
    return map(messages, (message) => message?.content).join('');
  }, [messages]);
  const chatsTokenCount = useTokenCount(allChatMessageString);
  const totalTokenCount = inputTokenCount + chatsTokenCount;
  const lastAssistantMessageString = useMemo(() => {
    const lastAssistantMessage = last(messages);
    if (lastAssistantMessage?.role === 'assistant') {
      return lastAssistantMessage?.content;
    } else {
      return '';
    }
  }, [messages]);

  const lastAssistantTokenCount = useTokenCount(lastAssistantMessageString);
  const tokenPerSecond = useMemo(() => {
    return lastAssistantTokenCount > 0 && startTime
      ? lastAssistantTokenCount / ((Date.now() - startTime) / 1000)
      : 0;
  }, [lastAssistantTokenCount, startTime]);

  return (
    <Flex justify="end" align="end">
      <Tag style={{ margin: 0 }}>
        <span>
          <Typography.Text>{tokenPerSecond.toFixed(1)}</Typography.Text>{' '}
          <Typography.Text type="secondary">TPS</Typography.Text>
        </span>{' '}
        <Divider type="vertical" />
        <span>
          <Typography.Text>{totalTokenCount}</Typography.Text>{' '}
          <Typography.Text type="secondary"> tokens</Typography.Text>
        </span>
        <QuestionIconWithTooltip title={t('chatui.TokenCounterTooltip')} />
      </Tag>
    </Flex>
  );
};

export default ChatTokenCounter;
