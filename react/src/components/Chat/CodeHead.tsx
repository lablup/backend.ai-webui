/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React, { memo } from 'react';

const { Text } = Typography;

/**
 * Header bar of a fenced code block: the language label on the left and a
 * caller-supplied slot on the right.
 *
 * The slot is deliberately not a copy button — `ChatMessageContent` passes one
 * (hidden while streaming), while `MarkdownContent` leaves it to its own caller
 * via `codeBlockExtra`.
 */
export const CodeHead = memo<{ lang: string; extra?: React.ReactNode }>(
  ({ lang, extra }) => {
    'use memo';

    const { token } = theme.useToken();

    return (
      <BAIFlex
        style={{
          margin: 0,
          minHeight: 38,
          padding: `0 ${token.paddingSM}px`,
          background: 'rgba(0, 0, 0, 0.02)',
          width: '100%',
        }}
      >
        <BAIFlex
          style={{
            display: 'inline-block',
            flex: '1',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          <Text style={{ fontWeight: 'normal' }} type="secondary">
            {lang}
          </Text>
        </BAIFlex>
        <BAIFlex>{extra}</BAIFlex>
      </BAIFlex>
    );
  },
);

CodeHead.displayName = 'CodeHead';
