/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Typography } from 'antd';
import React, { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
  text?: string;
}

const CopyableCodeText: React.FC<Props> = ({ text, children }) => {
  return (
    <Typography.Text copyable code>
      {text || children}
    </Typography.Text>
  );
};

export default CopyableCodeText;
