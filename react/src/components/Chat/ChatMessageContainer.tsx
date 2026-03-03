/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Avatar, theme } from 'antd';
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
        <Avatar style={{ fontSize: token.fontSizeHeading3 }}>{avatar}</Avatar>
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
