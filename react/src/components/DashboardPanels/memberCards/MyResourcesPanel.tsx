/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyResourcesPanelQuery } from '../../../__generated__/MyResourcesPanelQuery.graphql';
import { useCurrentDomain } from '../../../hooks';
import { readPrimary, readSecondary } from '../panelPermission';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import ResourceUsageStatistics from './ResourceUsageStatistics';
import { freeAsLimits, offeredSlotsOf, toUsageRows } from './memberCardData';
import { Text } from '@lablup/ui-common/Text';
import React, { useDeferredValue } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * The viewer's used-vs-limit per slot in one resource group; the dashboard
 * card and the session page's My Resources in Resource Group both render it.
 */
export const MyResourcesInResourceGroup: React.FC<{
  projectId: string;
  resourceGroupName: string;
  fetchKey: string;
}> = ({ projectId, resourceGroupName, fetchKey }) => {
  'use memo';
  const currentDomain = useCurrentDomain();
  const variables = {
    projectId,
    // One named group is read, so the OR'd scopes only widen where it is found: the session
    // page's header picker can hold a group reached through the domain or the keypair.
    scope: {
      domain: [{ value: currentDomain.id }],
      project: [{ value: projectId }],
    },
    resourceGroupFilter: { name: { equals: resourceGroupName } },
  };
  const deferredVariables = useDeferredValue(variables);
  // Fields a plain project member can read; `effectiveResourceAllocationV2`
  // needs session READ on the project, which members lack (ADR 0027).
  const data = useLazyLoadQuery<MyResourcesPanelQuery>(
    graphql`
      query MyResourcesPanelQuery(
        $projectId: UUID!
        $scope: ResourceGroupScope!
        $resourceGroupFilter: ResourceGroupFilter!
      ) {
        myUserResourceAllocationV2 @catch(to: RESULT) {
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
        projectResourceAllocationV2(projectId: $projectId) @catch(to: RESULT) {
          project {
            assignable {
              resourceType
              quantity
              unlimited
            }
          }
        }
        scopedResourceGroups(
          scope: $scope
          filter: $resourceGroupFilter
          limit: 1
        ) @catch(to: RESULT) {
          edges {
            node {
              resourceInfo {
                capacity {
                  entries {
                    resourceType
                    quantity
                  }
                }
                free {
                  entries {
                    resourceType
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    `,
    deferredVariables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const user = readPrimary(data.myUserResourceAllocationV2)?.user;
  const project = readSecondary(data.projectResourceAllocationV2).value
    ?.project;
  const resourceInfo = readSecondary(data.scopedResourceGroups).value
    ?.edges?.[0]?.node?.resourceInfo;
  return (
    <ResourceUsageStatistics
      rows={
        user
          ? toUsageRows(
              user.used,
              [
                user.assignable,
                project?.assignable ?? [],
                freeAsLimits(resourceInfo?.free.entries),
              ],
              {
                slots:
                  offeredSlotsOf(resourceInfo?.capacity.entries) ?? undefined,
              },
            )
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
      title={t('webui.menu.MyResourcesInResourceGroup')}
      tooltip={
        <Trans i18nKey="webui.menu.MyResourcesInResourceGroupDescription" />
      }
      fetchKey={fetchKey}
      resetKeys={[projectId, resourceGroupName]}
    >
      {(key) =>
        !projectId ? (
          <NoProjectText />
        ) : !resourceGroupName ? (
          <Text type="supporting">{t('dashboard.card.NoResourceGroup')}</Text>
        ) : (
          <MyResourcesInResourceGroup
            projectId={projectId}
            resourceGroupName={resourceGroupName}
            fetchKey={key}
          />
        )
      }
    </MemberCard>
  );
};

export default MyResourcesPanel;
