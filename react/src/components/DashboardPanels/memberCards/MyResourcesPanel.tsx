/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyResourcesPanelQuery } from '../../../__generated__/MyResourcesPanelQuery.graphql';
import { resourceGroupRows } from '../dashboardScope';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import ResourceUsageBars from './ResourceUsageBars';
import { toUsageRows } from './memberCardData';
import { Divider } from '@lablup/ui-common/Divider';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import React, { Fragment, useDeferredValue } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export const MyResourcesInResourceGroup: React.FC<{
  projectId: string;
  resourceGroupName: string;
  fetchKey: string;
}> = ({ projectId, resourceGroupName, fetchKey }) => {
  'use memo';
  const variables = { input: { projectId, resourceGroupName } };
  const deferredVariables = useDeferredValue(variables);
  const data = useLazyLoadQuery<MyResourcesPanelQuery>(
    graphql`
      query MyResourcesPanelQuery($input: EffectiveResourceAllocationV2Input!) {
        effectiveResourceAllocationV2(input: $input) {
          assignable {
            resourceType
            quantity
            unlimited
          }
          breakdown {
            keypair {
              used {
                resourceType
                quantity
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <ResourceUsageBars rows={toUsageRows(data.effectiveResourceAllocationV2)} />
  );
};

/** The viewer's used-vs-limit per slot, one block per resource group of the filter bar. */
const MyResourcesPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  const resourceGroups = resourceGroupRows(
    scope.rgs,
    vars.currentResourceGroup,
  );
  return (
    <MemberCard
      title={t('webui.menu.MyResources')}
      tooltip={<Trans i18nKey="dashboard.card.MyResourcesTooltip" />}
      fetchKey={fetchKey}
    >
      {(key) =>
        !projectId ? (
          <NoProjectText />
        ) : resourceGroups.length === 0 ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <BAIFlex direction="column" align="stretch" gap="sm">
            {resourceGroups.map((resourceGroupName, index) => (
              <Fragment key={resourceGroupName}>
                {index > 0 ? <Divider /> : null}
                <Text weight="semibold">{resourceGroupName}</Text>
                <MyResourcesInResourceGroup
                  projectId={projectId}
                  resourceGroupName={resourceGroupName}
                  fetchKey={key}
                />
              </Fragment>
            ))}
          </BAIFlex>
        )
      }
    </MemberCard>
  );
};

export default MyResourcesPanel;
