/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '.';
import { useAccessibleProjectsQuery } from '../__generated__/useAccessibleProjectsQuery.graphql';
import { useCurrentUserInfo, useCurrentUserRole } from './backendai';
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
 */
export const useAccessibleProjects = (
  options?: UseAccessibleProjectsOptions,
) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const currentDomainName = useCurrentDomainValue();
  const [currentUser] = useCurrentUserInfo();
  const userRole = useCurrentUserRole();
  const blockList = baiClient?._config?.blockList ?? null;

  const { groups, user } = useLazyLoadQuery<useAccessibleProjectsQuery>(
    graphql`
      query useAccessibleProjectsQuery(
        $domain_name: String
        $email: String
        $type: [String]
      ) {
        groups(domain_name: $domain_name, is_active: true, type: $type) {
          id
          is_active
          name
          resource_policy
          type
        }
        user(email: $email) {
          groups {
            id
            name
          }
        }
      }
    `,
    {
      domain_name: options?.domain ?? currentDomainName,
      email: currentUser.email,
      type:
        (userRole === 'admin' || userRole === 'superadmin') &&
        _.includes(blockList, 'model-store')
          ? ['GENERAL']
          : ['GENERAL', 'MODEL_STORE'],
    },
    {
      fetchPolicy: options?.fetchPolicy ?? 'store-or-network',
    },
  );

  // Membership filter: only projects the user actually belongs to.
  const accessibleProjects = groups?.filter((project) =>
    user?.groups?.map((group) => group?.id).includes(project?.id),
  );

  return { groups, accessibleProjects };
};
