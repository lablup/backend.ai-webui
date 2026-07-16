/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTokenCount } from '../../hooks/useTokenizer';
import { UIMessage } from 'ai';
import { Typography, Tag, Divider } from 'antd';
import { BAIQuestionIconWithTooltip, BAIFlex } from 'backend.ai-ui';
import { t } from 'i18next';
import { map, last } from 'lodash-es';
import React, { useEffect, useState } from 'react';

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
      ?.filter((part) => part.type === 'text' || part.type === 'reasoning')
      .map((part) => part.text)
      .join(''),
  ).join('');
  const chatsTokenCount = useTokenCount(allChatMessageString);
  const totalTokenCount = inputTokenCount + chatsTokenCount;
  const lastAssistantMessage = last(messages);
  const lastAssistantMessageString =
    lastAssistantMessage?.role === 'assistant'
      ? lastAssistantMessage?.parts
          ?.filter((part) => part.type === 'text' || part.type === 'reasoning')
          .map((part) => part.text)
          .join('') || ''
      : '';

  const estimatedLastAssistantTokenCount = useTokenCount(
    lastAssistantMessageString,
  );
  // Prefer the model-reported output token count (attached to the final
  // message metadata in ChatCard) over the client-side gpt-tokenizer estimate.
  // It is only present once streaming finishes and only on paths that report
  // usage (client-side streamText); during streaming and on server paths that
  // omit usage, fall back to the estimate.
  const usageOutputTokens =
    lastAssistantMessage?.role === 'assistant'
      ? (
          lastAssistantMessage?.metadata as
            { outputTokens?: number } | undefined
        )?.outputTokens
      : undefined;
  const lastAssistantTokenCount =
    typeof usageOutputTokens === 'number' && usageOutputTokens > 0
      ? usageOutputTokens
      : estimatedLastAssistantTokenCount;

  // The elapsed denominator needs a current timestamp, but reading `Date.now()`
  // directly in render does not work: under the React Compiler ('use memo'),
  // the elapsed expression is memoized on its tracked deps (startTime/endTime)
  // only — `Date.now()` is an untracked impure call, so the denominator would
  // freeze at ~0s from when startTime was first set, inflating TPS until
  // streaming ends. TPS only changes when the token count changes, so rather
  // than a ticking timer we sample the wall clock at each token-count update:
  // numerator and denominator are then snapshots of the same instant, with no
  // periodic re-renders in between, while time stays out of render so the
  // compiler freeze cannot return. If the stream stalls the display holds its
  // last value instead of decaying; the final value at endTime is unaffected.
  const [measuredAt, setMeasuredAt] = useState<number | null>(null);
  useEffect(() => {
    setMeasuredAt(Date.now());
  }, [lastAssistantTokenCount]);

  let tokenPerSecond = 0;
  if (lastAssistantTokenCount > 0 && startTime) {
    const sampledAt = endTime ?? measuredAt;
    const elapsedSec = sampledAt !== null ? (sampledAt - startTime) / 1000 : 0;
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
        <BAIQuestionIconWithTooltip title={t('chatui.TokenCounterTooltip')} />
      </Tag>
    </BAIFlex>
  );
};

export default ChatTokenCounter;
