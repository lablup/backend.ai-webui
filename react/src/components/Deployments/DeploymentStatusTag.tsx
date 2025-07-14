import {
  CheckCircleOutlined,
  LoadingOutlined,
  PauseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { Tag } from 'antd';
import React from 'react';

interface DeploymentStatusTagProps {
  status: 'Active' | 'Hibernated' | 'Failed' | 'Deploying' | 'Destroyed';
  style?: React.CSSProperties;
}

const DeploymentStatusTag: React.FC<DeploymentStatusTagProps> = ({
  status,
  style,
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Active':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
        };
      case 'Deploying':
        return {
          color: 'processing',
          icon: <LoadingOutlined />,
        };
      case 'Hibernated':
        return {
          color: 'warning',
          icon: <PauseCircleOutlined />,
        };
      case 'Failed':
        return {
          color: 'error',
          icon: <ExclamationCircleOutlined />,
        };
      case 'Destroyed':
        return {
          color: 'default',
          icon: <ExclamationCircleOutlined />,
        };
      default:
        return {
          color: 'default',
          icon: null,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tag color={config.color} icon={config.icon} style={style}>
      {status}
    </Tag>
  );
};

export default DeploymentStatusTag;
