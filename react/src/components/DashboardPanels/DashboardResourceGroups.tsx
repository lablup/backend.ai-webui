/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DashboardResourceGroupsQuery } from '../../__generated__/DashboardResourceGroupsQuery.graphql';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useSuspenseTanQuery } from '../../hooks/reactQueryAlias';
import {
  type AllowedResourceGroups,
  defaultResourceGroupOf,
  resourceGroupScopeOf,
} from './dashboardScope';
import { offeredSlotsOf } from './memberCards/memberCardData';
import type { DashboardScope } from './types';
import type {
  BAIScopedResourceGroupSelectFilter,
  BAIScopedResourceGroupSelectProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { createContext, use } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface DashboardResourceGroups extends AllowedResourceGroups {
  /** What a card without a saved resource group reads. */
  defaultResourceGroup: string | null;
  /** The pickers' scope: the page's project, else the current domain. */
  scope: BAIScopedResourceGroupSelectProps['scope'];
  /** Leaves the SFTP-only groups out of the pickers. */
  filter: BAIScopedResourceGroupSelectFilter | undefined;
  /** Slots the allowed groups offer (cpu and mem always); null when no capacity was read. */
  offeredSlots: ReadonlySet<string> | null;
}

export const DashboardResourceGroupsContext =
  createContext<DashboardResourceGroups | null>(null);

/** The page's allowed resource groups; `null` outside a dashboard board. */
export const useDashboardResourceGroups = () =>
  use(DashboardResourceGroupsContext);

const PAGE_SIZE = 100;

const projectIdOf = (scope: DashboardScope): string | null =>
  scope.kind === 'mine'
    ? scope.projectId
    : scope.projectIds === 'all'
      ? null
      : (scope.projectIds[0] ?? null);

/**
 * Reads the resource groups the page's project (the superadmin page: the
 * current domain) may use, once per page, for every card's default and picker.
 * It never reads the header's current project or resource group (ADR 0027).
 */
export const DashboardResourceGroupsProvider: React.FC<{
  scope: DashboardScope;
  children: React.ReactNode;
}> = ({ scope, children }) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const projectId = projectIdOf(scope);
  const hasScope = scope.kind !== 'mine' || !!scope.projectId;
  const { data: sftpResourceGroups } = useSuspenseTanQuery<Array<string>>({
    queryKey: ['DashboardResourceGroupsProvider.sftp', projectId],
    queryFn: async (): Promise<Array<string>> => {
      const hosts: {
        volume_info?: Record<string, { sftp_scaling_groups?: Array<string> }>;
      } | null = await baiClient.vfolder
        .list_hosts(projectId ?? undefined)
        .catch(() => null);
      return _.uniq(
        _.flatMap(
          _.values(hosts?.volume_info ?? {}),
          (volume) => volume?.sftp_scaling_groups ?? [],
        ),
      );
    },
    staleTime: 60_000,
  });
  const filter: BAIScopedResourceGroupSelectFilter | undefined = _.isEmpty(
    sftpResourceGroups,
  )
    ? undefined
    : { name: { notIn: sftpResourceGroups } };
  const pickerScope = resourceGroupScopeOf(scope);
  const data = useLazyLoadQuery<DashboardResourceGroupsQuery>(
    graphql`
      query DashboardResourceGroupsQuery(
        $scope: ResourceGroupScope!
        $filter: ResourceGroupFilter
        $limit: Int!
        $hasScope: Boolean!
      ) {
        scopedResourceGroups(
          scope: $scope
          filter: $filter
          orderBy: [{ field: NAME, direction: ASC }]
          limit: $limit
        ) @include(if: $hasScope) @catch(to: RESULT) {
          count
          edges {
            node {
              name
              resourceInfo {
                capacity {
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
    {
      scope: pickerScope,
      filter: filter ?? null,
      limit: PAGE_SIZE,
      hasScope,
    },
    { fetchPolicy: 'store-or-network' },
  );
  const connection = data.scopedResourceGroups?.ok
    ? data.scopedResourceGroups.value
    : null;
  const names = _.compact(_.map(connection?.edges, (edge) => edge?.node?.name));
  const offeredSets = _.compact(
    _.map(connection?.edges, (edge) =>
      offeredSlotsOf(edge?.node?.resourceInfo?.capacity.entries),
    ),
  );
  const offeredSlots = offeredSets.length
    ? new Set(offeredSets.flatMap((slots) => [...slots]))
    : null;
  // A failed read cannot rule a saved group out, so it keeps it.
  const allowed: AllowedResourceGroups = {
    names,
    isComplete: hasScope
      ? !!connection && (connection.count ?? 0) <= names.length
      : true,
  };

  return (
    <DashboardResourceGroupsContext
      value={{
        ...allowed,
        defaultResourceGroup: defaultResourceGroupOf(allowed),
        scope: pickerScope,
        filter,
        offeredSlots,
      }}
    >
      {children}
    </DashboardResourceGroupsContext>
  );
};
