/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '.';
import {
  ProjectTypeV2,
  useAccessibleProjectsQuery,
} from '../__generated__/useAccessibleProjectsQuery.graphql';
import { useCurrentUserRole } from './backendai';
import { toLocalId } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { graphql, useLazyLoadQuery } from 'react-relay';
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
    readonly id: string;
    readonly basicInfo: { readonly name: string; readonly type: ProjectTypeV2 };
    readonly organization: { readonly resourcePolicy: string };
    readonly lifecycle: { readonly isActive: boolean | null | undefined };
  };
};

const toAccessibleProject = (edge: ProjectV2Edge): AccessibleProject => ({
  id: toLocalId(edge.node.id),
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
 * user's project membership.
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

  // `domainProjectsV2` needs domain-admin rights, so only admins ask for it.
  const { domainProjectsV2, myUserV2 } =
    useLazyLoadQuery<useAccessibleProjectsQuery>(
      graphql`
        query useAccessibleProjectsQuery(
          $domainName: String!
          $types: [ProjectTypeV2!]!
          $isAdmin: Boolean!
        ) {
          domainProjectsV2(
            scope: { domainName: $domainName }
            filter: { isActive: true, type: { in_: $types } }
            limit: 1000
          ) @include(if: $isAdmin) {
            edges {
              node {
                id
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
          myUserV2 {
            projects(
              filter: {
                isActive: true
                domainName: { equals: $domainName }
                type: { in_: $types }
              }
              limit: 1000
            ) {
              edges {
                node {
                  id
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
        }
      `,
      { domainName, types, isAdmin },
      {
        fetchPolicy: options?.fetchPolicy ?? 'store-or-network',
      },
    );

  const accessibleProjects = _.map(
    myUserV2?.projects?.edges,
    toAccessibleProject,
  );
  const groups = domainProjectsV2
    ? _.map(domainProjectsV2.edges, toAccessibleProject)
    : accessibleProjects;

  return { groups, accessibleProjects };
};
