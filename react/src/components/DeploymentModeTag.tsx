import { SettingOutlined, CodeOutlined } from '@ant-design/icons';
import { Tag, Tooltip } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface DeploymentModeTagProps {
  mode: 'simple' | 'expert';
  showIcon?: boolean;
  showTooltip?: boolean;
  size?: 'small' | 'default';
  style?: React.CSSProperties;
}

const DeploymentModeTag: React.FC<DeploymentModeTagProps> = ({
  mode,
  showIcon = true,
  showTooltip = true,
  size = 'default',
  style,
}) => {
  const { t } = useTranslation();

  const getModeConfig = (mode: string) => {
    switch (mode) {
      case 'simple':
        return {
          color: 'blue',
          icon: <SettingOutlined />,
          label: t('deployment.SimpleMode'),
          description: t('deployment.SimpleModeTooltip'),
        };
      case 'expert':
        return {
          color: 'purple',
          icon: <CodeOutlined />,
          label: t('deployment.ExpertMode'),
          description: t('deployment.ExpertModeTooltip'),
        };
      default:
        return {
          color: 'default',
          icon: null,
          label: mode,
          description: '',
        };
    }
  };

  const config = getModeConfig(mode);

  const tagElement = (
    <Tag
      color={config.color}
      icon={showIcon ? config.icon : undefined}
      style={style}
    >
      {config.label}
    </Tag>
  );

  if (showTooltip && config.description) {
    return <Tooltip title={config.description}>{tagElement}</Tooltip>;
  }

  return tagElement;
};

export default DeploymentModeTag;
