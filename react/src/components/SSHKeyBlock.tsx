/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../theme-shim';
import './SSHKeyBlock.css';
import { Text } from '@astryxdesign/core/Text';
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

/** A labelled, copyable SSH key in a box that owns its own overflow. */
const SSHKeyBlock: React.FC<SSHKeyBlockProps> = ({
  label,
  value,
  placeholder,
  maxHeight = 160,
  extra,
}) => {
  'use memo';
  const { token } = theme.useToken();

  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <BAIFlex direction="row" align="center" gap="xs">
        <Text weight="semibold">{label}</Text>
        {value ? <BAIText copyable={{ text: value }} /> : null}
      </BAIFlex>
      <div
        className="ssh-key-block"
        style={{
          maxHeight,
          overflow: 'auto',
          padding: `${token.paddingXS}px ${token.paddingSM}px`,
          backgroundColor: token.colorFillQuaternary,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusSM,
        }}
      >
        {value ? (
          <pre style={{ margin: 0 }}>{value}</pre>
        ) : (
          <BAIText type="secondary">{placeholder}</BAIText>
        )}
      </div>
      {extra}
    </BAIFlex>
  );
};

export default SSHKeyBlock;
