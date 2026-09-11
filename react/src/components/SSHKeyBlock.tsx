/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import './SSHKeyBlock.css';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIText } from 'backend.ai-ui';
import React from 'react';

interface SSHKeyBlockProps {
  /** Row label; the copy control sits right after it. */
  label: React.ReactNode;
  /** The key text. Empty renders `placeholder` and no copy control. */
  value?: string | null;
  /** Shown inside the box while there is no key. */
  placeholder?: React.ReactNode;
  /** Vertical cap on the key box; anything longer scrolls inside the box. */
  maxHeight?: number;
  /** Rendered under the key box (e.g. the one-time-view warning). */
  extra?: React.ReactNode;
}

/** A labelled, copyable SSH key; long lines wrap so the box only scrolls vertically. */
const SSHKeyBlock: React.FC<SSHKeyBlockProps> = ({
  label,
  value,
  placeholder,
  maxHeight = 160,
  extra,
}) => {
  'use memo';
  const { token } = useTheme();

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex direction="row" align="center">
        <Text weight="semibold">{label}</Text>
        {value ? <BAIText copyable={{ text: value }} /> : null}
      </BAIFlex>
      <div
        className="ssh-key-block"
        style={{
          maxHeight,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: `${token('--spacing-2')} ${token('--spacing-3')}`,
          backgroundColor: token('--color-fill-quaternary'),
          border: `1px solid ${token('--color-border')}`,
          borderRadius: token('--radius-inner'),
        }}
      >
        {value ? (
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {value}
          </pre>
        ) : (
          <BAIText type="secondary">{placeholder}</BAIText>
        )}
      </div>
      {extra}
    </BAIFlex>
  );
};

export default SSHKeyBlock;
