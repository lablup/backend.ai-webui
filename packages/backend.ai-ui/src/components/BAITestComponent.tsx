import { Typography } from 'antd';
import React from 'react';

export interface BAITestComponentProps {
  /** Test message to display */
  message?: string;
  /** Whether to show in bold */
  bold?: boolean;
  /** Size of the text */
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 12,
  medium: 14,
  large: 18,
};

const BAITestComponent: React.FC<BAITestComponentProps> = ({
  message = 'Hello from BAITestComponent',
  bold = false,
  size = 'medium',
}) => {
  return (
    <Typography.Text
      style={{
        fontWeight: bold ? 'bold' : 'normal',
        fontSize: sizeMap[size],
      }}
    >
      {message}
    </Typography.Text>
  );
};

export default BAITestComponent;
