/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIFlexProps } from 'backend.ai-ui';
import React, { memo } from 'react';

export type ChatMessagePlacement = {
  top?: boolean;
  left?: boolean;
  right?: boolean;
  bottom?: boolean;
};

export interface ChatMessageContainerProps extends BAIFlexProps {
  placement?: ChatMessagePlacement;
  containerStyle?: React.CSSProperties;
  avatar?: React.ReactNode;
  children?: React.ReactNode;
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = memo(
  ({ children, placement = {}, avatar, onMouseEnter, onMouseLeave }) => {
    const { token } = useTheme();

    return (
      <BAIFlex
        direction={placement.left ? 'row' : 'row-reverse'}
        justify={'start'}
        align="baseline"
        style={{
          marginLeft: placement.left ? 0 : '15%',
          marginRight: placement.right ? 0 : 20,
          paddingLeft: token('--spacing-5'),
          paddingRight: token('--spacing-5'),
          paddingTop: placement.top ? token('--spacing-5') : 0,
          paddingBottom: placement.bottom ? token('--spacing-5') : 0,
        }}
        gap={'sm'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {/* PILOT-DECISION: antd `Avatar` rendered arbitrary node children (a
            raw emoji character). Astryx `Avatar` (MAPPING.md §4) only
            supports `src`/`name`-derived initials, not a children slot — so
            an emoji avatar has no direct destination. Self-built as a fixed
            circular flex box (P10-style rebuild), same as antd's default
            avatar size/shape. */}
        <BAIFlex
          justify="center"
          align="center"
          style={{
            width: token('--size-element-md'),
            height: token('--size-element-md'),
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: token('--color-fill-tertiary'),
            fontSize: token('--font-size-2xl'),
            lineHeight: 1,
          }}
        >
          {avatar}
        </BAIFlex>
        <BAIFlex
          direction="column"
          align={placement.left ? 'start' : 'end'}
          wrap="wrap"
          style={{ flex: 1 }}
          gap={'xs'}
        >
          {children}
        </BAIFlex>
      </BAIFlex>
    );
  },
);

ChatMessageContainer.displayName = 'ChatMessageContainer';
