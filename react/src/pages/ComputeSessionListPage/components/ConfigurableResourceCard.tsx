/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ConfigurableResourceCardQuery } from '../../../__generated__/ConfigurableResourceCardQuery.graphql';
import MyResource from '../../../components/MyResource';
import MyResourceWithinResourceGroup from '../../../components/MyResourceWithinResourceGroup';
import TotalResourceWithinResourceGroup, {
  useIsAvailableTotalResourceWithinResourceGroup,
} from '../../../components/TotalResourceWithinResourceGroup';
import { useCurrentUserRole } from '../../../hooks/backendai';
import { useBAISettingUserState } from '../../../hooks/useBAISetting';
import { useCurrentResourceGroupValue } from '../../../hooks/useCurrentProject';
import './ConfigurableResourceCard.css';
import {
  DropdownMenu,
  type DropdownMenuOption,
} from '@lablup/ui-common/DropdownMenu';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAICard,
  BAICardProps,
  BAISkeleton,
  filterOutEmpty,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Check, Settings } from 'lucide-react';
import React, { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  const { token } = useTheme();
  const { t } = useTranslation();
  const [selectedPanelType, setSelectedPanelType] = useBAISettingUserState(
    'resource_panel_type',
  );
  const userRole = useCurrentUserRole();

  const isAvailableTotalResourcePanel =
    useIsAvailableTotalResourceWithinResourceGroup();
  const currentResourceGroup = useCurrentResourceGroupValue();
  const currentPanelType: ResourcePanelType = selectedPanelType ?? 'MyResource';

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
        // The agent scan runs only while the total panel is the one shown.
        fetchPolicy:
          isAvailableTotalResourcePanel &&
          currentPanelType === 'TotalResourceWithinResourceGroup'
            ? 'network-only'
            : 'store-only',
        fetchKey: fetchKey,
      },
    );

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

  // antd `menu={{ items: [{ type: 'group', children }] }}` -> Astryx
  // `items: [{ type: 'section', title, items }]` (MAPPING §3.7 — sections are
  // native here, and better shaped than antd's `children` key).
  const menuItems: Array<DropdownMenuOption> = [
    {
      type: 'section',
      title: t('session.PanelSettings'),
      items: _.map(panelOptions, (option) => ({
        label: option.label,
        onClick: () => setSelectedPanelType(option.value),
        // Marks the view on screen, since the views share the menu.
        endContent:
          option.value === currentPanelType ? (
            <Check size="1em" aria-hidden />
          ) : undefined,
      })),
    },
  ];

  const settingsButton = (
    <DropdownMenu
      button={{
        label: t('session.PanelSettings'),
        icon: <Settings size="1em" />,
        isIconOnly: true,
        variant: 'ghost',
      }}
      hasChevron={false}
      alignment="end"
      items={menuItems}
    />
  );

  const renderResourcePanel = () => {
    const commonProps = {
      fetchKey,
      style: { border: 'none', ...props.style },
      extra: settingsButton,
      ..._.omit(props, ['style', 'title']),
    };

    switch (currentPanelType) {
      case 'TotalResourceWithinResourceGroup':
        return (
          isAvailableTotalResourcePanel && (
            <TotalResourceWithinResourceGroup
              {...commonProps}
              queryRef={queryRefForTotalResource}
            />
          )
        );
      case 'MyResourceWithinResourceGroup':
        return <MyResourceWithinResourceGroup {...commonProps} />;
      default:
        return <MyResource {...commonProps} />;
    }
  };

  return (
    // The panel supplies its own inset, so the card must contribute none.
    // `styles.body` is accepted and ignored by BAICard; `padding` is the knob.
    <BAICard
      padding={0}
      className="session-resource-card"
      {..._.omit(props, ['style'])}
      style={{ ...props.style }}
    >
      <Suspense
        fallback={
          <BAISkeleton style={{ padding: `0px ${token('--spacing-5')}` }} />
        }
      >
        {renderResourcePanel()}
      </Suspense>
    </BAICard>
  );
};

export default ConfigurableResourceCard;
