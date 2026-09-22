/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionDetailTabMatrixQuery } from '../__generated__/RolePermissionDetailTabMatrixQuery.graphql';
import { RolePermissionDetailTab_roleScopeFragment$key } from '../__generated__/RolePermissionDetailTab_roleScopeFragment.graphql';
import { type RBACElementType } from '../__generated__/ScopedRolePermissionCardQuery.graphql';
import RolePermissionSummaryTable from './RolePermissionSummaryTable';
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
 * "Detailed Permissions" tab. A manager >= 26.9.0a4 answers the role's one
 * scope, so the tab renders the per-entity permission summary for that scope.
 * An older manager answers a scopes connection, so the tab renders one
 * `ScopedRolePermissionCard` per scope type `rbacPermissionMatrix` reports and
 * each card hides itself when the role has no scope of its type (ADR 0006).
 */
const RolePermissionDetailTab: React.FC<RolePermissionDetailTabProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();

  const role = useFragment(
    graphql`
      fragment RolePermissionDetailTab_roleScopeFragment on Role {
        totalScopes: scopes(first: 1) @deprecatedSince(version: "26.9.0a4") {
          count
        }
        scopeType @since(version: "26.9.0a4")
        scopeId @since(version: "26.9.0a4")
        ...RolePermissionSummaryTableFragment
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
            ...RolePermissionSummaryTable_rbacPermissionMatrixFragment
            ...ScopedRolePermissionCard_rbacPermissionMatrixFragment
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

  // A role on a manager >= 26.9.0a4 always belongs to one scope.
  if (!role.scopeId && role.totalScopes?.count === 0) {
    return (
      <BAICard>
        <EmptyState title={t('rbac.NoScopesToDisplay')} />
      </BAICard>
    );
  }

  if (role.scopeType) {
    return (
      <Suspense fallback={<BAISkeleton />}>
        <RolePermissionSummaryTable
          roleNodeFrgmt={role}
          rbacPermissionMatrixFrgmt={rbacPermissionMatrix ?? []}
          scopeType={role.scopeType}
        />
      </Suspense>
    );
  }

  // Every matrix scope type, as the server spells it; each card derives its
  // own entity × operation set from the matrix fragment.
  const scopeTypes = _.uniq(
    (rbacPermissionMatrix ?? []).map((combination) => combination.scopeType),
  );

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <Suspense fallback={<BAISkeleton />}>
        {_.map(scopeTypes, (scopeType) => (
          <ScopedRolePermissionCard
            key={scopeType}
            roleNodeFrgmt={role}
            rbacPermissionMatrixFrgmt={rbacPermissionMatrix ?? []}
            // The 26.8 enum spelling; the card only mounts on that path.
            scopeType={scopeType as RBACElementType}
          />
        ))}
      </Suspense>
    </BAIFlex>
  );
};

export default RolePermissionDetailTab;
