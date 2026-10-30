/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyResourcesPanelQuery } from '../../../__generated__/MyResourcesPanelQuery.graphql';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import ResourceUsageBars from './ResourceUsageBars';
import { toUsageRows } from './memberCardData';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
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
        }
        myUserResourceAllocationV2 {
          user {
            used {
              resourceType
              quantity
            }
            assignable {
              resourceType
              quantity
              unlimited
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const effective = data.effectiveResourceAllocationV2;
  const user = data.myUserResourceAllocationV2?.user;
  return (
    <ResourceUsageBars
      rows={
        effective && user
          ? toUsageRows(user.used, [effective.assignable, user.assignable])
          : []
      }
    />
  );
};

/** The viewer's used-vs-limit per slot in the card's resource group. */
const MyResourcesPanel: React.FC<PanelComponentProps> = ({
  scope,
  vars,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  const resourceGroupName = vars.resourceGroup;
  return (
    <MemberCard
      title={t('webui.menu.MyResources')}
      tooltip={<Trans i18nKey="dashboard.card.MyResourcesTooltip" />}
      fetchKey={fetchKey}
      resetKeys={[projectId, resourceGroupName]}
    >
      {(key) =>
        !projectId ? (
          <NoProjectText />
        ) : !resourceGroupName ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <BAIFlex direction="column" align="stretch" gap="sm">
            <Text weight="semibold">{resourceGroupName}</Text>
            <MyResourcesInResourceGroup
              projectId={projectId}
              resourceGroupName={resourceGroupName}
              fetchKey={key}
            />
          </BAIFlex>
        )
      }
    </MemberCard>
  );
};

export default MyResourcesPanel;
