/*
 to-astryx W2-D: antd `Typography.Text` -> Astryx `Text`, and antd `List.Item`
 -> a plain `<div>`.

 PILOT-DECISION: `List.Item` is NOT mapped onto Astryx's `ListItem`. Astryx's
 item is a structured ROW (`label` / `description` / `startContent` /
 `endContent`) — a different anatomy from the stacked title / description /
 action / footer block this component composes itself. And antd's `List.Item`
 rendered a bare `<div class="ant-list-item">` here anyway: the notification
 items are rendered by the notification STACK, never inside a `<List>`, so
 there was no list semantics to preserve. The div carries a `bai-notification-item`
 class so the stack keeps a stable hook.
*/
import BAIFlex from './BAIFlex';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import React, { type ReactNode } from 'react';

export interface BAINotificationItemStyles {
  title?: React.CSSProperties;
  description?: React.CSSProperties;
  action?: React.CSSProperties;
  footer?: React.CSSProperties;
}

export interface BAINotificationItemProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  styles?: BAINotificationItemStyles;
}

const isPrimitiveContent = (
  value: ReactNode,
): value is string | number | bigint => {
  const valueType = typeof value;
  return (
    valueType === 'string' || valueType === 'number' || valueType === 'bigint'
  );
};

const BAINotificationItem: React.FC<BAINotificationItemProps> = ({
  title,
  description,
  action,
  footer,
  styles,
}) => {
  const { token } = useTheme();

  const renderTextContent = (
    content: ReactNode,
    typographyStyle?: React.CSSProperties,
  ) => {
    return isPrimitiveContent(content) ? (
      <Text style={typographyStyle}>{content}</Text>
    ) : (
      content
    );
  };

  return (
    <div className="bai-notification-item">
      <BAIFlex direction="column" align="stretch" gap="xxs">
        {title && (
          <div
            style={{
              fontWeight: 500,
              marginRight: 22,
              marginBottom: token('--spacing-3'),
              ...styles?.title,
            }}
          >
            {renderTextContent(title)}
          </div>
        )}

        {description && (
          <div style={styles?.description}>
            {renderTextContent(description)}
          </div>
        )}

        {action && (
          <BAIFlex
            direction="row"
            align="end"
            justify="end"
            gap="xxs"
            style={styles?.action}
          >
            {action}
          </BAIFlex>
        )}

        {footer && (
          <div
            style={{
              alignSelf: 'flex-end',
              color: token('--color-text-secondary'),
              ...styles?.footer,
            }}
          >
            {renderTextContent(footer)}
          </div>
        )}
      </BAIFlex>
    </div>
  );
};

export { BAINotificationItem };

export default BAINotificationItem;
