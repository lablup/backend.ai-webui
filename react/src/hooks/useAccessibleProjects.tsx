/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useCurrentDomainValue,
  useSuspendedBackendaiClient,
  useCurrentDomain,
} from '.';
import type { useAccessibleProjectsDomainProjectsPaginationQuery } from '../__generated__/useAccessibleProjectsDomainProjectsPaginationQuery.graphql';
import {
  ProjectTypeV2,
  useAccessibleProjectsQuery,
} from '../__generated__/useAccessibleProjectsQuery.graphql';
import type { useAccessibleProjects_domainProjectsFragment$key } from '../__generated__/useAccessibleProjects_domainProjectsFragment.graphql';
import { useCurrentUserRole } from './backendai';
import * as _ from 'lodash-es';
import { useEffect, useState } from 'react';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import type { FetchPolicy } from 'relay-runtime';

interface UseAccessibleProjectsOptions {
  /**
   * Domain to list projects for. Defaults to the current domain
   * (`useCurrentDomainValue`). Pass the same value the header passes to
   * `ProjectSelect` so both read the same Relay store records.
   */
  domain?: string;
  /**
   * Relay fetch policy. Defaults to `'store-or-network'` so validation
   * consumers reuse the store; `ProjectSelect` passes `'network-only'` to
   * keep its refresh-on-mount behavior.
   */
  fetchPolicy?: FetchPolicy;
}

/** The legacy `groups` row shape the consumers were written against. */
export interface AccessibleProject {
  id: string;
  name: string;
  type: ProjectTypeV2;
  is_active: boolean | null;
  resource_policy: string;
}

type ProjectV2Edge = {
  readonly node: {
    readonly entityId: string;
    readonly basicInfo: { readonly name: string; readonly type: ProjectTypeV2 };
    readonly organization: { readonly resourcePolicy: string };
    readonly lifecycle: { readonly isActive: boolean | null | undefined };
  };
};

const toAccessibleProject = (edge: ProjectV2Edge): AccessibleProject => ({
  id: edge.node.entityId,
  name: edge.node.basicInfo.name,
  type: edge.node.basicInfo.type,
  is_active: edge.node.lifecycle.isActive ?? null,
  resource_policy: edge.node.organization.resourcePolicy,
});

/**
 * The single source of truth for "which projects can the current user
 * enter" (FR-3388). This is exactly the data the header's `ProjectSelect`
 * renders: active projects of the domain (GENERAL + MODEL_STORE, unless an
 * admin's config blocklist hides the model store) intersected with the
 * user's project membership. The user's own personal project, which the
 * domain list never contains, is returned separately as `personalProject`.
 *
 * URL project validation (`useUrlProjectValidity`) and the header's
 * unselected-state check consume this hook instead of the login-time
 * `baiClient.groups` list, which only contains GENERAL-type projects and
 * therefore disagreed with the selector for model-store projects.
 *
 * RBAC role assignments are deliberately NOT consulted (decision on
 * FR-3388): whatever the selector offers is considered enterable.
 *
 * `groups` is every active project of the domain for admins (the
 * `disableDefaultFilter` surfaces); for other users it is the same list as
 * `accessibleProjects`, which is what the legacy `groups` field answered them.
 */
export const useAccessibleProjects = (
  options?: UseAccessibleProjectsOptions,
) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const currentDomainName = useCurrentDomainValue();
  const userRole = useCurrentUserRole();
  const blockList = baiClient?._config?.blockList ?? null;

  const domainName = options?.domain ?? currentDomainName;
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const types: Array<ProjectTypeV2> =
    isAdmin && _.includes(blockList, 'model-store')
      ? ['GENERAL']
      : ['GENERAL', 'MODEL_STORE'];

  // Both lists read `scopedProjectsV2` (ADR 0012): the caller's memberships for
  // everyone, plus every project of the current domain for admins.
  const { id: currentDomainId } = useCurrentDomain();
  const domainScope = { domain: [{ value: currentDomainId }] };
  const queryRef = useLazyLoadQuery<useAccessibleProjectsQuery>(
    graphql`
      query useAccessibleProjectsQuery(
        $domainScope: ProjectScope!
        $userScope: ProjectScope!
        $domainName: String!
        $types: [ProjectTypeV2!]!
        $memberTypes: [ProjectTypeV2!]!
        $isAdmin: Boolean!
      ) {
        ...useAccessibleProjects_domainProjectsFragment
          @include(if: $isAdmin)
          @alias(as: "adminDomainProjects")
          @arguments(
            scope: $domainScope
            domainName: $domainName
            types: $types
          )
        memberProjects: scopedProjectsV2(
          scope: $userScope
          filter: {
            isActive: true
            domainName: { equals: $domainName }
            type: { in_: $memberTypes }
          }
          limit: 1000
        ) {
          edges {
            node {
              id
              entityId
              basicInfo {
                name
                type
              }
              organization {
                resourcePolicy
              }
              lifecycle {
                isActive
              }
            }
          }
        }
      }
    `,
    {
      domainScope,
      userScope: { user: [{ value: baiClient.user_uuid }] },
      domainName,
      types,
      memberTypes: [...types, 'PERSONAL'],
      isAdmin,
    },
    {
      fetchPolicy: options?.fetchPolicy ?? 'store-or-network',
    },
  );
  const { memberProjects, adminDomainProjects } = queryRef;

  // The manager caps a page at 1000 rows; keep loading until the admin list is
  // complete. Non-admins never spread the fragment, so `data` stays null.
  const {
    data: domainProjects,
    hasNext,
    isLoadingNext,
    loadNext,
  } = usePaginationFragment<
    useAccessibleProjectsDomainProjectsPaginationQuery,
    useAccessibleProjects_domainProjectsFragment$key
  >(
    graphql`
      fragment useAccessibleProjects_domainProjectsFragment on Query
      @refetchable(
        queryName: "useAccessibleProjectsDomainProjectsPaginationQuery"
      )
      @argumentDefinitions(
        scope: { type: "ProjectScope!" }
        domainName: { type: "String!" }
        types: { type: "[ProjectTypeV2!]!" }
        first: { type: "Int", defaultValue: 1000 }
        after: { type: "String" }
      ) {
        scopedProjectsV2(
          scope: $scope
          filter: {
            isActive: true
            domainName: { equals: $domainName }
            type: { in_: $types }
          }
          first: $first
          after: $after
        ) @connection(key: "useAccessibleProjects_scopedProjectsV2") {
          edges {
            node {
              id
              entityId
              basicInfo {
                name
                type
              }
              organization {
                resourcePolicy
              }
              lifecycle {
                isActive
              }
            }
          }
        }
      }
    `,
    adminDomainProjects ?? null,
  );
  // A failed page leaves `hasNext` true; latch the failure so the effect does
  // not refetch it in a loop. A different domain or type set starts fresh.
  const pagingKey = `${domainName}:${types.join(',')}`;
  const [failedPagingKey, setFailedPagingKey] = useState<string | null>(null);
  useEffect(() => {
    if (hasNext && !isLoadingNext && failedPagingKey !== pagingKey) {
      loadNext(1000, {
        onComplete: (error) => {
          if (error) setFailedPagingKey(pagingKey);
        },
      });
    }
  }, [hasNext, isLoadingNext, loadNext, failedPagingKey, pagingKey]);

  // The personal project rides along in the membership read; the domain list
  // never contains it, so it is returned separately.
  const [personalEdges, memberEdges] = _.partition(
    memberProjects?.edges,
    (edge) => edge.node.basicInfo.type === 'PERSONAL',
  );
  const accessibleProjects = _.map(memberEdges, toAccessibleProject);
  const groups = domainProjects?.scopedProjectsV2
    ? _.map(domainProjects.scopedProjectsV2.edges, toAccessibleProject)
    : accessibleProjects;

  const personalProjectNode = _.first(personalEdges)?.node;
  const personalProject = personalProjectNode
    ? {
        id: personalProjectNode.entityId,
        name: personalProjectNode.basicInfo.name,
      }
    : undefined;

  return { groups, accessibleProjects, personalProject };
};
