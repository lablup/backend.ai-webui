import BAIFlex from './BAIFlex';
import { List, Typography, theme } from 'antd';
import React, { ReactNode } from 'react';

export interface NotificationItemTemplateStyles {
  title?: React.CSSProperties;
  description?: React.CSSProperties;
  action?: React.CSSProperties;
  footer?: React.CSSProperties;
}

export interface NotificationItemTemplateProps {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  styles?: NotificationItemTemplateStyles;
}

const isPrimitiveContent = (
  value: ReactNode,
): value is string | number | bigint => {
  const valueType = typeof value;
  return (
    valueType === 'string' || valueType === 'number' || valueType === 'bigint'
  );
};

const NotificationItemTemplate: React.FC<NotificationItemTemplateProps> = ({
  title,
  description,
  action,
  footer,
  styles,
}) => {
  const { token } = theme.useToken();

  const renderTextContent = (
    content: ReactNode,
    typographyStyle?: React.CSSProperties,
  ) => {
    return isPrimitiveContent(content) ? (
      <Typography.Text style={typographyStyle}>{content}</Typography.Text>
    ) : (
      content
    );
  };

  return (
    <List.Item>
      <BAIFlex direction="column" align="stretch" gap="xxs">
        {title && (
          <div
            style={{
              fontWeight: 500,
              marginRight: 22,
              marginBottom: token.marginSM,
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
              color: token.colorTextSecondary,
              ...styles?.footer,
            }}
          >
            {renderTextContent(footer)}
          </div>
        )}
      </BAIFlex>
    </List.Item>
  );
};

export { NotificationItemTemplate };

export default NotificationItemTemplate;
