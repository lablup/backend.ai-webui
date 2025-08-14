import { Typography } from 'antd';
import type { TextProps as AntdTextProps } from 'antd/es/typography/Text';
import React from 'react';

export interface BAITextProps extends AntdTextProps {
  monospace?: boolean;
}

const BAIText: React.FC<BAITextProps> = ({
  type,
  style,
  monospace,
  children,
  ...restProps
}) => {
  // If monospace prop is true, apply monospace font styling
  if (monospace) {
    return (
      <Typography.Text
        type={type}
        {...restProps}
        style={{
          fontFamily: 'monospace',
          ...style,
        }}
      >
        {children}
      </Typography.Text>
    );
  }

  // For non-monospace text, pass all props directly to antd Text
  return (
    <Typography.Text type={type} style={style} {...restProps}>
      {children}
    </Typography.Text>
  );
};

export default BAIText;
