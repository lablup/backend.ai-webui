/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionSummaryTableFragment$key } from '../__generated__/RolePermissionSummaryTableFragment.graphql';
import { RolePermissionSummaryTableGrantMutation } from '../__generated__/RolePermissionSummaryTableGrantMutation.graphql';
import { RolePermissionSummaryTableQuery } from '../__generated__/RolePermissionSummaryTableQuery.graphql';
import { RolePermissionSummaryTableRevokeMutation } from '../__generated__/RolePermissionSummaryTableRevokeMutation.graphql';
import { reasonMessage } from '../helper/mutationError';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import RBACPermissionGrid, {
  type RBACPermissionChanges,
  type RBACPermissionSaveFailure,
} from './RBACPermissionGrid';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIFlex,
  BAIId,
  BAIText,
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/**
 * Upper bound of permission rows fetched for the role — far above one scope's
 * entity × bit grid, so the grid never misses a grant.
 */
const PERMISSION_FETCH_LIMIT = 500;

export interface RolePermissionSummaryTableProps {
  roleNodeFrgmt: RolePermissionSummaryTableFragment$key;
  /** The role's scope, resolved by the drawer content (it selects `scope`
   *  once for both; a second selection would ride the role list query). */
  scopeName: string | null;
  scopeId: string;
}

/**
 * The Permissions tab of `RoleDetailDrawerV2` (managers >= 26.9.0a4, one
 * scope per role): the role's grants in `RBACPermissionGrid`, saved as the two
 * bulk role-permission mutations. Its own query and mutations select the 26.9
 * fields only; the fragment's `scopeType` carries `@since` because it rides
 * the role list query (ADR 0006).
 */
const RolePermissionSummaryTable: React.FC<RolePermissionSummaryTableProps> = ({
  roleNodeFrgmt,
  scopeName,
  scopeId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { logger } = useBAILogger();

  const role = useFragment(
    graphql`
      fragment RolePermissionSummaryTableFragment on Role {
        id
        source
        scopeType @since(version: "26.9.0a4")
      }
    `,
    roleNodeFrgmt,
  );
  const roleId = toLocalId(role.id);
  const scopeType = role.scopeType ?? '';

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery<RolePermissionSummaryTableQuery>(
    graphql`
      query RolePermissionSummaryTableQuery(
        $roleId: UUID!
        $permissionLimit: Int
      ) {
        adminRole(id: $roleId) {
          permissions(limit: $permissionLimit) {
            edges {
              node {
                id
                entityType
                permission
              }
            }
          }
        }
      }
    `,
    { roleId, permissionLimit: PERMISSION_FETCH_LIMIT },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const grantPermissions =
    useMutationWithPromise<RolePermissionSummaryTableGrantMutation>(graphql`
      mutation RolePermissionSummaryTableGrantMutation(
        $input: BulkAddRolePermissionsInput!
      ) {
        adminBulkAddRolePermissions(input: $input) {
          items {
            id
            entityType
            permission
          }
          failed {
            entityType
            permission
            message
          }
        }
      }
    `);
  const revokePermissions =
    useMutationWithPromise<RolePermissionSummaryTableRevokeMutation>(graphql`
      mutation RolePermissionSummaryTableRevokeMutation(
        $input: BulkRemoveRolePermissionsInput!
      ) {
        adminBulkRemoveRolePermissions(input: $input) {
          items {
            id
          }
          failed {
            permissionId
            message
          }
        }
      }
    `);

  const grants = _.compact(
    (data.adminRole?.permissions?.edges ?? []).map((edge) => edge?.node),
  ).map((node) => ({
    id: toLocalId(node.id),
    entityType: node.entityType,
    permission: node.permission,
  }));

  const save = async ({ toGrant, toRevoke }: RBACPermissionChanges) => {
    const [grantResult, revokeResult] = await Promise.allSettled([
      toGrant.length > 0
        ? grantPermissions({
            input: {
              permissions: toGrant.map(({ entityType, bit }) => ({
                roleId,
                entityType,
                permission: bit,
              })),
            },
          })
        : Promise.resolve(null),
      toRevoke.length > 0
        ? revokePermissions({
            input: { permissionIds: toRevoke.map(({ id }) => id) },
          })
        : Promise.resolve(null),
    ]);

    const failures: RBACPermissionSaveFailure[] = [];
    if (grantResult.status === 'fulfilled') {
      grantResult.value?.adminBulkAddRolePermissions?.failed.forEach(
        (failure) => {
          logger.error('Failed to grant permission', failure.message);
          failures.push({
            entityType: failure.entityType ?? '',
            bit: failure.permission ?? '',
            message: failure.message,
          });
        },
      );
    } else {
      logger.error('Failed to grant permissions', grantResult.reason);
      toGrant.forEach(({ entityType, bit }) =>
        failures.push({
          entityType,
          bit,
          message: reasonMessage(grantResult.reason),
        }),
      );
    }
    if (revokeResult.status === 'fulfilled') {
      const failedById = new Map(
        (revokeResult.value?.adminBulkRemoveRolePermissions?.failed ?? []).map(
          (failure) => [String(failure.permissionId), failure.message],
        ),
      );
      toRevoke.forEach(({ entityType, bit, id }) => {
        const failureMessage = failedById.get(id);
        if (failureMessage !== undefined) {
          logger.error('Failed to revoke permission', failureMessage);
          failures.push({ entityType, bit, message: failureMessage });
        }
      });
    } else {
      logger.error('Failed to revoke permissions', revokeResult.reason);
      toRevoke.forEach(({ entityType, bit }) =>
        failures.push({
          entityType,
          bit,
          message: reasonMessage(revokeResult.reason),
        }),
      );
    }
    return failures;
  };

  return (
    <RBACPermissionGrid
      scopeType={scopeType}
      toolbarStart={
        <BAIFlex gap="xs" align="center">
          {scopeName ? (
            <BAIText strong>{scopeName}</BAIText>
          ) : (
            <BAIId uuid={scopeId} style={{ maxWidth: 160 }} />
          )}
          <Token
            color="blue"
            label={t(rbacTypeI18nKey(scopeType), { defaultValue: scopeType })}
          />
        </BAIFlex>
      }
      grants={grants}
      grantsVersion={deferredFetchKey}
      loading={deferredFetchKey !== fetchKey}
      fetchKey={fetchKey}
      readOnly={role.source === 'SYSTEM'}
      onRefresh={updateFetchKey}
      onSave={save}
    />
  );
};

export default RolePermissionSummaryTable;
