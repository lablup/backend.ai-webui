import { useBAISettingUserState } from '../hooks/useBAISetting';
import MyResource from './MyResource';
import MyResourceWithinResourceGroup from './MyResourceWithinResourceGroup';
import TotalResourceWithinResourceGroup, {
  useIsAvailableTotalResourceWithinResourceGroup,
} from './TotalResourceWithinResourceGroup';
import { SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Skeleton, theme } from 'antd';
import { filterOutEmpty, BAICard, BAICardProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { ConfigurableResourceCardQuery } from 'src/__generated__/ConfigurableResourceCardQuery.graphql';
import { useCurrentUserRole } from 'src/hooks/backendai';
import { useCurrentResourceGroupValue } from 'src/hooks/useCurrentProject';

export type ResourcePanelType =
  | 'MyResource'
  | 'MyResourceWithinResourceGroup'
  | 'TotalResourceWithinResourceGroup';

interface ConfigurableResourceCardProps extends BAICardProps {
  fetchKey?: string;
}

const ConfigurableResourceCard: React.FC<ConfigurableResourceCardProps> = ({
  fetchKey,
  ...props
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const [selectedPanelType, setSelectedPanelType] = useBAISettingUserState(
    'resource_panel_type',
  );
  const userRole = useCurrentUserRole();

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();
  const currentResourceGroup = useCurrentResourceGroupValue();

  const queryRefForTotalResource =
    useLazyLoadQuery<ConfigurableResourceCardQuery>(
      graphql`
        query ConfigurableResourceCardQuery(
          $resourceGroup: String
          $isSuperAdmin: Boolean!
          $agentNodeFilter: String!
        ) {
          ...TotalResourceWithinResourceGroupFragment
            @arguments(
              resourceGroup: $resourceGroup
              isSuperAdmin: $isSuperAdmin
              agentNodeFilter: $agentNodeFilter
            )
        }
      `,
      {
        resourceGroup: currentResourceGroup || 'default',
        isSuperAdmin: _.isEqual(userRole, 'superadmin'),
        agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${currentResourceGroup}"`,
      },
      {
        // if TotalResourceWithinResourceGroup is not available, do not fetch the query
        fetchPolicy: isAvailableTotalResourcePanel
          ? 'network-only'
          : 'store-only',
        fetchKey: fetchKey,
      },
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
    isAvailableTotalResourcePanel && {
      label: t('webui.menu.TotalResourcesInResourceGroup'),
      value: 'TotalResourceWithinResourceGroup' as ResourcePanelType,
    },
  ]);

  useEffect(() => {
    if (
      !isAvailableTotalResourcePanel &&
      currentPanelType === 'TotalResourceWithinResourceGroup'
    ) {
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
      style: { border: 'none', ...props.style },
      extra: settingsButton,
      titleStyle: {
        paddingLeft: 0,
      },
      ..._.omit(props, ['style', 'title']),
    };

    switch (currentPanelType) {
      case 'MyResourceWithinResourceGroup':
        return <MyResourceWithinResourceGroup {...commonProps} />;
      case 'TotalResourceWithinResourceGroup':
        return (
          isAvailableTotalResourcePanel && (
            <TotalResourceWithinResourceGroup
              {...commonProps}
              queryRef={queryRefForTotalResource}
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
