/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { theme } from '../../theme-shim';
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
    const { token } = theme.useToken();

    return (
      <BAIFlex
        direction={placement.left ? 'row' : 'row-reverse'}
        justify={'start'}
        align="baseline"
        style={{
          marginLeft: placement.left ? 0 : '15%',
          marginRight: placement.right ? 0 : 20,
          paddingLeft: token.paddingMD,
          paddingRight: token.paddingMD,
          paddingTop: placement.top ? token.paddingMD : 0,
          paddingBottom: placement.bottom ? token.paddingMD : 0,
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
            width: token.controlHeight,
            height: token.controlHeight,
            flexShrink: 0,
            borderRadius: '50%',
            backgroundColor: token.colorFillTertiary,
            fontSize: token.fontSizeHeading3,
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
