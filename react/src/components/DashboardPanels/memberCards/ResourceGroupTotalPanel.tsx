/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceGroupTotalPanelQuery } from '../../../__generated__/ResourceGroupTotalPanelQuery.graphql';
import { useCurrentUserRole } from '../../../hooks/backendai';
import TotalResourceWithinResourceGroup from '../../TotalResourceWithinResourceGroup';
import PanelSettingsHeaderControls from '../PanelSettingsHeaderControls';
import type { PanelComponentProps } from '../types';
import { useTheme } from '@lablup/ui-common/theme';
import { BAIBoardItemErrorBoundary, BAIFlex, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ResourceGroupTotal: React.FC<{
  resourceGroup: string;
  fetchKey: string;
  isRefetching: boolean;
  extra?: React.ReactNode;
}> = ({ resourceGroup, fetchKey, isRefetching, extra }) => {
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
      extra={extra}
    />
  );
};

/** The resource group totals, one block per resource group of the card's setting. */
const ResourceGroupTotalPanel: React.FC<PanelComponentProps> = ({
  vars,
  fetchKey,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const resourceGroups = vars.resourceGroups;
  return (
    <BAIBoardItemErrorBoundary
      title={t('webui.menu.TotalResourcesInResourceGroup')}
      status="error"
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        {resourceGroups.map((resourceGroup, index) => (
          <Suspense
            key={resourceGroup}
            fallback={<BAISkeleton style={{ padding: token('--spacing-5') }} />}
          >
            <ResourceGroupTotal
              resourceGroup={resourceGroup}
              fetchKey={fetchKey}
              isRefetching={isRefetching}
              // This card draws its own header per group; the first one carries the card's controls.
              extra={index === 0 ? <PanelSettingsHeaderControls /> : undefined}
            />
          </Suspense>
        ))}
      </BAIFlex>
    </BAIBoardItemErrorBoundary>
  );
};

export default ResourceGroupTotalPanel;
