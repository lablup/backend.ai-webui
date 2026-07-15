/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionDetailTabMatrixQuery } from '../__generated__/RolePermissionDetailTabMatrixQuery.graphql';
import { RolePermissionDetailTab_roleScopeFragment$key } from '../__generated__/RolePermissionDetailTab_roleScopeFragment.graphql';
import ScopedRolePermissionCard from './ScopedRolePermissionCard';
import { Empty, Skeleton } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface RolePermissionDetailTabProps {
  roleNodeFrgmt: RolePermissionDetailTab_roleScopeFragment$key;
}

/**
 * "Detailed Permissions" tab — merges the former Scopes and Permissions tabs.
 * Renders one `ScopedRolePermissionCard` per scope type that
 * `rbacPermissionMatrix` reports (so a type added on the server needs no code
 * change here). Each card issues its own server-filtered query and hides
 * itself when the role has no scope of its type, leaving one card per assigned
 * scope type with display-only, grant-state color-coded entity tags (FR-2,
 * FR-3, FR-4).
 */
const RolePermissionDetailTab: React.FC<RolePermissionDetailTabProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();

  const role = useFragment(
    graphql`
      fragment RolePermissionDetailTab_roleScopeFragment on Role {
        totalScopes: scopes(first: 1) {
          count
        }
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

  // One card candidate per matrix scope type. The scope types come from the
  // server as-is — nothing is hardcoded client-side. Each card derives its own
  // entity × operation set from the matrix fragment.
  const scopeTypes = _.uniq(
    (rbacPermissionMatrix ?? []).map((combination) => combination.scopeType),
  );

  if (role.totalScopes?.count === 0) {
    return (
      <BAICard styles={{ body: { paddingTop: 0 } }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('rbac.NoScopesToDisplay')}
        />
      </BAICard>
    );
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="md">
      <Suspense fallback={<Skeleton active />}>
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
