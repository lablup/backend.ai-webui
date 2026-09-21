/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionDetailTabMatrixQuery } from '../__generated__/RolePermissionDetailTabMatrixQuery.graphql';
import { RolePermissionDetailTab_roleScopeFragment$key } from '../__generated__/RolePermissionDetailTab_roleScopeFragment.graphql';
import ScopedRolePermissionCard from './ScopedRolePermissionCard';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { BAISkeleton, BAICard, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface RolePermissionDetailTabProps {
  roleNodeFrgmt: RolePermissionDetailTab_roleScopeFragment$key;
}

/**
 * "Detailed Permissions" tab. A manager >= 26.9.0 answers the role's one
 * scope, so the tab renders one `ScopedRolePermissionCard` for that scope
 * type. An older manager answers a scopes connection, so the tab renders one
 * card per scope type `rbacPermissionMatrix` reports and each card hides
 * itself when the role has no scope of its type (ADR 0006).
 */
const RolePermissionDetailTab: React.FC<RolePermissionDetailTabProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();

  const role = useFragment(
    graphql`
      fragment RolePermissionDetailTab_roleScopeFragment on Role {
        totalScopes: scopes(first: 1) @deprecatedSince(version: "26.9.0") {
          count
        }
        scopeType @since(version: "26.9.0")
        scopeId @since(version: "26.9.0")
        ...ScopedRolePermissionCardFragment
      }
    `,
    roleNodeFrgmt,
  );

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<RolePermissionDetailTabMatrixQuery>(
      graphql`
        query RolePermissionDetailTabMatrixQuery {
          rbacPermissionMatrix {
            scopeType
            ...ScopedRolePermissionCard_rbacPermissionMatrixFragment
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  // The role's one scope type on managers >= 26.9.0; every matrix scope type,
  // as the server spells it, before.
  const scopeTypes = role.scopeType
    ? [role.scopeType]
    : _.uniq(
        (rbacPermissionMatrix ?? []).map(
          (combination) => combination.scopeType,
        ),
      );

  // A role on a manager >= 26.9.0 always belongs to one scope.
  if (!role.scopeId && role.totalScopes?.count === 0) {
    return (
      <BAICard>
        <EmptyState title={t('rbac.NoScopesToDisplay')} />
      </BAICard>
    );
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <Suspense fallback={<BAISkeleton />}>
        {_.map(scopeTypes, (scopeType) => (
          <ScopedRolePermissionCard
            key={scopeType}
            roleNodeFrgmt={role}
            rbacPermissionMatrixFrgmt={rbacPermissionMatrix ?? []}
            scopeType={scopeType}
          />
        ))}
      </Suspense>
    </BAIFlex>
  );
};

export default RolePermissionDetailTab;
