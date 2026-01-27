import { Typography } from 'antd';
import React from 'react';

export interface BAITestComponentProps {
  /** Test message to display */
  message?: string;
  /** Whether to show in bold */
  bold?: boolean;
  /** Custom color for the text */
  color?: string;
}

const BAITestComponent: React.FC<BAITestComponentProps> = ({
  message = 'Hello from BAITestComponent',
  bold = false,
  color,
}) => {
  return (
    <Typography.Text
      style={{
        fontWeight: bold ? 'bold' : 'normal',
        color,
      }}
    >
      {message}
    </Typography.Text>
  );
};

export default BAITestComponent;
