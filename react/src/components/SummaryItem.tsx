import Flex from './Flex';
import { RightOutlined } from '@ant-design/icons';
import { theme } from 'antd';
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
    <Flex direction="column" style={{ width: '100%' }}>
      <Flex
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
      </Flex>
      <Flex
        className="drag-cancel-component"
        style={{
          width: '100%',
          padding: token.paddingMD,
        }}
      >
        {contents}
      </Flex>
    </Flex>
  );
};
