import Flex from './Flex';
import {
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Tooltip, Typography, theme } from 'antd';
import React from 'react';

export interface ResourceAvailableGageBarProps {
  title?: React.ReactNode;
  valueLabel?: React.ReactNode;
  percent?: number;
  infoTooltip?: React.ReactNode;
}
const ResourceAvailableGageBar: React.FC<ResourceAvailableGageBarProps> = ({
  title,
  valueLabel,
  percent = 0,
  infoTooltip,
}) => {
  const { token } = theme.useToken();
  return (
    <Flex gap={'xxs'}>
      <Flex
        style={{
          padding: 1,
          border: '1px solid #d9d9d9',
          borderRadius: 3,
          width: 150,
          backgroundColor: token.colorBgContainerDisabled,
        }}
        direction="column"
        align="stretch"
      >
        <Flex
          style={{
            height: '100%',
            width: `${percent}%`,
            position: 'absolute',
            left: 0,
            top: 0,
            backgroundColor: token.colorSuccess,
            opacity: 0.7,
            zIndex: 0,
            overflow: 'hidden',
          }}
        ></Flex>
        <Flex direction="row" justify="between">
          <Typography.Text>{title}</Typography.Text>
          <Typography.Text>{valueLabel}</Typography.Text>
        </Flex>
      </Flex>
      {infoTooltip && (
        <Tooltip title={infoTooltip}>
          <InfoCircleOutlined />
        </Tooltip>
      )}
    </Flex>
  );
};

export default ResourceAvailableGageBar;
