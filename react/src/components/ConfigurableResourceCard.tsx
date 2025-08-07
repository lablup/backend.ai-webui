import { TotalResourceWithinResourceGroupFragment$key } from '../__generated__/TotalResourceWithinResourceGroupFragment.graphql';
import { filterOutEmpty } from '../helper';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import MyResource from './MyResource';
import MyResourceWithinResourceGroup from './MyResourceWithinResourceGroup';
import TotalResourceWithinResourceGroup from './TotalResourceWithinResourceGroup';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Skeleton, theme } from 'antd';
import { BAICard, BAICardProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type ResourcePanelType =
  | 'MyResource'
  | 'MyResourceWithinResourceGroup'
  | 'TotalResourceWithinResourceGroup';

interface ConfigurableResourceCardProps extends BAICardProps {
  fetchKey?: string;
  isRefetching?: boolean;
  queryRef?: TotalResourceWithinResourceGroupFragment$key;
  onResourceGroupChange?: (resourceGroup: string) => void;
}

const ConfigurableResourceCard: React.FC<ConfigurableResourceCardProps> = ({
  fetchKey,
  isRefetching,
  queryRef,
  onResourceGroupChange,
  ...props
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [selectedPanelType, setSelectedPanelType] = useBAISettingUserState(
    'resource_panel_type',
  );

  const currentPanelType: ResourcePanelType = selectedPanelType || 'MyResource';

  const panelOptions = filterOutEmpty([
    {
      label: t('webui.menu.MyResources'),
      value: 'MyResource' as ResourcePanelType,
    },
    {
      label: t('webui.menu.MyResourcesInResourceGroup'),
      value: 'MyResourceWithinResourceGroup' as ResourcePanelType,
    },
    queryRef && {
      label: t('webui.menu.TotalResourcesInResourceGroup'),
      value: 'TotalResourceWithinResourceGroup' as ResourcePanelType,
    },
  ]);

  useEffect(() => {
    if (!queryRef && currentPanelType === 'TotalResourceWithinResourceGroup') {
      setSelectedPanelType('MyResource');
    }
    // fallback to MyResource if TotalResourceWithinResourceGroup is not available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const menuItems: MenuProps['items'] = [
    {
      key: 'panel-settings',
      label: t('session.PanelSettings'),
      type: 'group',
      children: _.map(panelOptions, (option) => ({
        key: option.value,
        label: option.label,
        onClick: () => setSelectedPanelType(option.value),
      })),
    },
  ];

  const settingsButton = (
    <Dropdown
      menu={{
        items: menuItems,
        selectable: true,
        defaultSelectedKeys: [currentPanelType],
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={<SettingOutlined />}
        style={{
          backgroundColor: 'transparent',
          margin: -token.marginXS,
        }}
      />
    </Dropdown>
  );

  const renderResourcePanel = () => {
    const commonProps = {
      fetchKey,
      isRefetching,
      style: { border: 'none', ...props.style },
      extraActions: settingsButton,
      onResourceGroupChange,
      titleStyle: {
        paddingLeft: 0,
      },
      ..._.omit(props, ['style']),
    };

    switch (currentPanelType) {
      case 'MyResourceWithinResourceGroup':
        return <MyResourceWithinResourceGroup {...commonProps} />;
      case 'TotalResourceWithinResourceGroup':
        return (
          queryRef && (
            <TotalResourceWithinResourceGroup
              {...commonProps}
              queryRef={queryRef}
            />
          )
        );
      default:
        return <MyResource {...commonProps} />;
    }
  };

  return (
    <BAICard
      {..._.omit(props, ['style'])}
      style={{ ...props.style }}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Suspense
        fallback={
          <Skeleton active style={{ padding: `0px ${token.marginMD}px` }} />
        }
      >
        {renderResourcePanel()}
      </Suspense>
    </BAICard>
  );
};

export default ConfigurableResourceCard;
