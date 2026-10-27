/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceGroupTotalPanelQuery } from '../../../__generated__/ResourceGroupTotalPanelQuery.graphql';
import { useCurrentUserRole } from '../../../hooks/backendai';
import TotalResourceWithinResourceGroup from '../../TotalResourceWithinResourceGroup';
import PanelSettingsHeaderControls from '../PanelSettingsHeaderControls';
import type { PanelComponentProps } from '../types';
import { Heading } from '@lablup/ui-common/Heading';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBoardItemErrorBoundary,
  BAIBoardItemTitle,
  BAIFlex,
  BAIIconWithTooltip,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISkeleton,
  useIsInBAIBoardItem,
} from 'backend.ai-ui';
import { CircleHelp } from 'lucide-react';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ResourceGroupTotal: React.FC<{
  resourceGroup: string;
  fetchKey: string;
  isRefetching: boolean;
  displayType: 'used' | 'free';
}> = ({ resourceGroup, fetchKey, isRefetching, displayType }) => {
  'use memo';
  const isSuperAdmin = useCurrentUserRole() === 'superadmin';
  const variables = {
    resourceGroup,
    isSuperAdmin,
    agentNodeFilter: `schedulable == true & status == "ALIVE" & scaling_group == "${resourceGroup}"`,
  };
  const deferredVariables = useDeferredValue(variables);
  const queryRef = useLazyLoadQuery<ResourceGroupTotalPanelQuery>(
    graphql`
      query ResourceGroupTotalPanelQuery(
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
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <TotalResourceWithinResourceGroup
      queryRef={queryRef}
      resourceGroup={deferredVariables.resourceGroup}
      refetching={isRefetching || deferredVariables !== variables}
      hideRefreshButton
      asSection
      displayType={displayType}
    />
  );
};

/** The resource group totals: one header with the card's picker, then a section per resource group of the card's setting. */
const ResourceGroupTotalPanel: React.FC<PanelComponentProps> = ({
  vars,
  fetchKey,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const isInBoard = useIsInBAIBoardItem();
  const [displayType, setDisplayType] = useState<'used' | 'free'>('used');
  const resourceGroups = vars.resourceGroups;
  return (
    <BAIBoardItemErrorBoundary
      title={t('webui.menu.TotalResourcesInResourceGroup')}
      status="error"
    >
      <BAIFlex direction="column" align="stretch">
        <BAIFlex
          direction="column"
          align="stretch"
          // On a board the board pads the item.
          style={
            isInBoard ? undefined : { paddingInline: token('--spacing-8') }
          }
        >
          <BAIBoardItemTitle
            title={
              <BAIFlex align="center" gap="xs" wrap="wrap">
                <Heading level={5}>
                  {t('webui.menu.TotalResourcesInResourceGroup')}
                </Heading>
                <BAIIconWithTooltip
                  icon={<CircleHelp size="1em" />}
                  content={t(
                    'webui.menu.TotalResourcesInResourceGroupDescription',
                  )}
                />
                <PanelSettingsHeaderControls />
              </BAIFlex>
            }
            extra={
              <BAISegmentedControl
                size="sm"
                aria-label={`${t('dashboard.Used')}/${t('dashboard.Free')}`}
                value={displayType}
                onChange={(value) =>
                  setDisplayType(value === 'free' ? 'free' : 'used')
                }
              >
                <BAISegmentedControlItem
                  value="used"
                  label={t('dashboard.Used')}
                />
                <BAISegmentedControlItem
                  value="free"
                  label={t('dashboard.Free')}
                />
              </BAISegmentedControl>
            }
          />
        </BAIFlex>
        <BAIFlex direction="column" align="stretch" gap="sm">
          {resourceGroups.map((resourceGroup) => (
            <Suspense key={resourceGroup} fallback={<BAISkeleton />}>
              <ResourceGroupTotal
                resourceGroup={resourceGroup}
                fetchKey={fetchKey}
                isRefetching={isRefetching}
                displayType={displayType}
              />
            </Suspense>
          ))}
        </BAIFlex>
      </BAIFlex>
    </BAIBoardItemErrorBoundary>
  );
};

export default ResourceGroupTotalPanel;
