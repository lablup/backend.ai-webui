/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceGroupTotalPanelQuery } from '../../../__generated__/ResourceGroupTotalPanelQuery.graphql';
import { useCurrentUserRole } from '../../../hooks/backendai';
import TotalResourceWithinResourceGroup from '../../TotalResourceWithinResourceGroup';
import PanelFrame from '../PanelFrame';
import type { PanelComponentProps } from '../types';
import { Text } from '@lablup/ui-common/Text';
import { BAIBoardItemErrorBoundary, BAISkeleton } from 'backend.ai-ui';
import React, { Suspense, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ResourceGroupTotal: React.FC<{
  resourceGroup: string;
  fetchKey: string;
  isRefetching: boolean;
}> = ({ resourceGroup, fetchKey, isRefetching }) => {
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
    />
  );
};

/** The totals of the card's resource group. */
const ResourceGroupTotalPanel: React.FC<PanelComponentProps> = ({
  vars,
  fetchKey,
  isRefetching,
}) => {
  'use memo';
  const { t } = useTranslation();
  const title = t('webui.menu.TotalResourcesInResourceGroup');
  const resourceGroup = vars.resourceGroup;
  return (
    <BAIBoardItemErrorBoundary
      title={title}
      status="error"
      resetKeys={[fetchKey, resourceGroup]}
    >
      {resourceGroup ? (
        // The fallback keeps the title up while the totals load.
        <Suspense
          fallback={
            <PanelFrame title={title}>
              <BAISkeleton />
            </PanelFrame>
          }
        >
          <ResourceGroupTotal
            resourceGroup={resourceGroup}
            fetchKey={fetchKey}
            isRefetching={isRefetching}
          />
        </Suspense>
      ) : (
        <PanelFrame title={title}>
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        </PanelFrame>
      )}
    </BAIBoardItemErrorBoundary>
  );
};

export default ResourceGroupTotalPanel;
