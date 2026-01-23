import { useTokenCount } from '../../hooks/useTokenizer';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import { UIMessage } from 'ai';
import { Typography, Tag, Divider } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import { t } from 'i18next';
import { map, last } from 'lodash';
import React, { useMemo } from 'react';

interface ChatTokenCounterProps {
  input: string;
  messages: UIMessage[];
  startTime: number | null;
  style?: React.CSSProperties;
}

const ChatTokenCounter: React.FC<ChatTokenCounterProps> = ({
  input,
  messages,
  startTime,
}) => {
  const inputTokenCount = useTokenCount(input);
  const allChatMessageString = useMemo(() => {
    return map(messages, (message) =>
      message?.parts
        ?.filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join(''),
    ).join('');
  }, [messages]);
  const chatsTokenCount = useTokenCount(allChatMessageString);
  const totalTokenCount = inputTokenCount + chatsTokenCount;
  const lastAssistantMessageString = useMemo(() => {
    const lastAssistantMessage = last(messages);
    if (lastAssistantMessage?.role === 'assistant') {
      return (
        lastAssistantMessage?.parts
          ?.filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join('') || ''
      );
    } else {
      return '';
    }
  }, [messages]);

  const lastAssistantTokenCount = useTokenCount(lastAssistantMessageString);
  const tokenPerSecond = useMemo(() => {
    return lastAssistantTokenCount > 0 && startTime
      ? // eslint-disable-next-line react-hooks/purity
        lastAssistantTokenCount / ((Date.now() - startTime) / 1000)
      : 0;
  }, [lastAssistantTokenCount, startTime]);

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
