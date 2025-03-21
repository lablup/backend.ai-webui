import { useTokenCount } from '../../hooks/useTokenizer';
import Flex from '../Flex';
import { RocketOutlined } from '@ant-design/icons';
import { Message } from 'ai';
import { Typography } from 'antd';
import { Tag, theme } from 'antd';
import { map, last } from 'lodash';
import React, { useMemo } from 'react';

interface ChatTokenCounterProps {
  input: string;
  messages: Message[];
  startTime: number | null;
}

const ChatTokenCounter: React.FC<ChatTokenCounterProps> = ({
  input,
  messages,
  startTime,
}) => {
  const { token } = theme.useToken();
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
    <Flex justify="end" align="end" style={{ margin: token.marginSM }}>
      <Tag>
        <Flex gap={'xs'}>
          <RocketOutlined />
          <Flex gap={'xxs'}>
            <Typography.Text>{tokenPerSecond.toFixed(2)}</Typography.Text>
            <Typography.Text type="secondary">tok/s</Typography.Text>
          </Flex>
          <Flex gap={'xxs'}>
            <Typography.Text>{totalTokenCount}</Typography.Text>
            <Typography.Text type="secondary">total tokens</Typography.Text>
          </Flex>
        </Flex>
      </Tag>
    </Flex>
  );
};

export default ChatTokenCounter;
