import Flex, { FlexProps } from '../Flex';
import { theme } from 'antd';
import React, { memo } from 'react';

export enum ChatMessagePlacement {
  Left,
  Right,
}

export interface ChatMessageContainerProps extends FlexProps {
  placement?: ChatMessagePlacement;
  containerStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = memo(
  ({
    children,
    placement = ChatMessagePlacement.Left,
    containerStyle,
    onMouseEnter,
    onMouseLeave,
  }) => {
    return (
      <Flex
        direction={
          placement === ChatMessagePlacement.Left ? 'row' : 'row-reverse'
        }
        justify={'start'}
        align="baseline"
        style={{
          marginLeft: placement === ChatMessagePlacement.Left ? '0' : '15%',
          marginRight: placement === ChatMessagePlacement.Right ? '0' : 20,
          ...containerStyle,
        }}
        gap={'sm'}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </Flex>
    );
  },
);

ChatMessageContainer.displayName = 'ChatMessageContainer';

export const ChatMessageAbove: React.FC<ChatMessageContainerProps> = memo(
  ({ placement = ChatMessagePlacement.Left }) => {
    const { token } = theme.useToken();

    return (
      <ChatMessageContainer
        placement={placement}
        containerStyle={{
          paddingLeft: token.paddingMD,
          paddingRight: token.paddingMD,
          paddingTop: token.paddingMD,
          paddingBottom: 0,
        }}
      />
    );
  },
);

ChatMessageAbove.displayName = 'ChatMessageAbove';

export const ChatMessageBelow: React.FC<ChatMessageContainerProps> = memo(
  ({ placement = ChatMessagePlacement.Left }) => {
    const { token } = theme.useToken();

    return (
      <ChatMessageContainer
        placement={placement}
        containerStyle={{
          paddingLeft: token.paddingMD,
          paddingRight: token.paddingMD,
          paddingTop: token.paddingMD,
          paddingBottom: 0,
        }}
      />
    );
  },
);

ChatMessageBelow.displayName = 'ChatMessageBelow';
