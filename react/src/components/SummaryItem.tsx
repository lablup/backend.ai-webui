/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RightOutlined } from '@ant-design/icons';
import { theme } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

interface SummaryItemProps {
  title: string;
  contents?: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}

export const SummaryItem: React.FC<SummaryItemProps> = ({
  title,
  contents,
  onClick,
  icon,
}: SummaryItemProps) => {
  const { token } = theme.useToken();

  return (
    <BAIFlex direction="column" style={{ width: '100%' }}>
      <BAIFlex
        style={{
          width: '100%',
          height: contents ? 'auto' : '100%',
          borderBottom: contents ? `1px solid ${token.colorBorder}` : 'none',
          padding: token.paddingMD,
          justifyContent: 'space-between',
          fontWeight: 'bold',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        {contents ? (
          title
        ) : (
          <>
            {icon}
            {title}
            <RightOutlined
              className="drag-cancel-component"
              style={{ cursor: 'pointer' }}
              onClick={onClick}
            />
          </>
        )}
      </BAIFlex>
      <BAIFlex
        className="drag-cancel-component"
        style={{
          width: '100%',
          padding: token.paddingMD,
        }}
      >
        {contents}
      </BAIFlex>
    </BAIFlex>
  );
};
