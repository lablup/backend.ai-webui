import BAIFlex from './BAIFlex';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Typography, Tooltip, theme } from 'antd';
import React from 'react';

export interface BAIBoardItemTitleProps {
  title: React.ReactNode | string;
  tooltip?: React.ReactNode;
  extra?: React.ReactNode;
  style?: React.CSSProperties;
}

const BAIBoardItemTitle: React.FC<BAIBoardItemTitleProps> = ({
  title,
  tooltip,
  extra,
  style,
}) => {
  const { token } = theme.useToken();

  return (
    <BAIFlex
      align="center"
      justify="between"
      style={{
        paddingBlock: token.paddingMD,
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        backgroundColor: token.colorBgContainer,
        zIndex: 1,
        ...style,
      }}
      gap="xs"
      wrap="wrap"
    >
      <BAIFlex gap={'xs'} align="center" wrap="wrap">
        {typeof title === 'string' ? (
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
        ) : (
          title
        )}
        {tooltip ? (
          <Tooltip title={tooltip}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextSecondary }}
            />
          </Tooltip>
        ) : null}
      </BAIFlex>

      <BAIFlex
        gap={'xs'}
        align="center"
        justify="end"
        style={{ marginLeft: 'auto' }}
      >
        {extra}
      </BAIFlex>
    </BAIFlex>
  );
};

BAIBoardItemTitle.displayName = 'BAIBoardItemTitle';
export default BAIBoardItemTitle;
