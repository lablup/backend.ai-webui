/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePresetPermissionTableAddMutation } from '../__generated__/RolePresetPermissionTableAddMutation.graphql';
import { RolePresetPermissionTableFragment$key } from '../__generated__/RolePresetPermissionTableFragment.graphql';
import { RolePresetPermissionTableQuery } from '../__generated__/RolePresetPermissionTableQuery.graphql';
import { RolePresetPermissionTableRemoveMutation } from '../__generated__/RolePresetPermissionTableRemoveMutation.graphql';
import { reasonMessage } from '../helper/mutationError';
import RBACPermissionGrid, {
  type RBACPermissionChanges,
  type RBACPermissionSaveFailure,
} from './RBACPermissionGrid';
import {
  INITIAL_FETCH_KEY,
  toLocalId,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/** Without a limit the manager answers only the first 10 entries. */
const PERMISSION_FETCH_LIMIT = 500;

interface RolePresetPermissionTableProps {
  rolePresetFrgmt: RolePresetPermissionTableFragment$key;
}

/**
 * The Permissions tab of `RolePresetDetailDrawer`: the preset's permission
 * entries in `RBACPermissionGrid`, saved as the two bulk preset-permission
 * mutations.
 */
const RolePresetPermissionTable: React.FC<RolePresetPermissionTableProps> = ({
  rolePresetFrgmt,
}) => {
  'use memo';
  const { logger } = useBAILogger();

  const rolePreset = useFragment(
    graphql`
      fragment RolePresetPermissionTableFragment on RolePreset {
        id
        scopeType
      }
    `,
    rolePresetFrgmt,
  );
  const rolePresetId = toLocalId(rolePreset.id);

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery<RolePresetPermissionTableQuery>(
    graphql`
      query RolePresetPermissionTableQuery(
        $rolePresetId: ID!
        $permissionLimit: Int
      ) {
        adminRolePreset(id: $rolePresetId) {
          # The list row reads the unargumented field; refetching it here
          # keeps its Permissions count current after a save.
          permissionCount: permissionPresets {
            count
          }
          permissionPresets(limit: $permissionLimit) {
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
    { rolePresetId, permissionLimit: PERMISSION_FETCH_LIMIT },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const addPermissions =
    useMutationWithPromise<RolePresetPermissionTableAddMutation>(graphql`
      mutation RolePresetPermissionTableAddMutation(
        $input: BulkAddRolePermissionPresetsInput!
      ) {
        adminBulkAddRolePresetPermissions(input: $input) {
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
  const removePermissions =
    useMutationWithPromise<RolePresetPermissionTableRemoveMutation>(graphql`
      mutation RolePresetPermissionTableRemoveMutation(
        $input: BulkRemoveRolePermissionPresetsInput!
      ) {
        adminBulkRemoveRolePresetPermissions(input: $input) {
          items {
            id
          }
          failed {
            permissionPresetId
            message
          }
        }
      }
    `);

  const grants = _.compact(
    (data.adminRolePreset?.permissionPresets?.edges ?? []).map(
      (edge) => edge?.node,
    ),
  ).map((node) => ({
    id: toLocalId(node.id),
    entityType: node.entityType,
    permission: node.permission,
  }));

  const save = async ({ toGrant, toRevoke }: RBACPermissionChanges) => {
    const [addResult, removeResult] = await Promise.allSettled([
      toGrant.length > 0
        ? addPermissions({
            input: {
              rolePresetId,
              permissions: toGrant.map(({ entityType, bit }) => ({
                entityType,
                permission: bit,
              })),
            },
          })
        : Promise.resolve(null),
      toRevoke.length > 0
        ? removePermissions({
            input: { permissionPresetIds: toRevoke.map(({ id }) => id) },
          })
        : Promise.resolve(null),
    ]);

    const failures: RBACPermissionSaveFailure[] = [];
    if (addResult.status === 'fulfilled') {
      addResult.value?.adminBulkAddRolePresetPermissions?.failed.forEach(
        (failure) => {
          logger.error('Failed to add preset permission', failure.message);
          failures.push({
            entityType: failure.entityType,
            bit: failure.permission,
            message: failure.message,
          });
        },
      );
    } else {
      logger.error('Failed to add preset permissions', addResult.reason);
      toGrant.forEach(({ entityType, bit }) =>
        failures.push({
          entityType,
          bit,
          message: reasonMessage(addResult.reason),
        }),
      );
    }
    if (removeResult.status === 'fulfilled') {
      const failedById = new Map(
        (
          removeResult.value?.adminBulkRemoveRolePresetPermissions?.failed ?? []
        ).map((failure) => [
          String(failure.permissionPresetId),
          failure.message,
        ]),
      );
      toRevoke.forEach(({ entityType, bit, id }) => {
        const failureMessage = failedById.get(id);
        if (failureMessage !== undefined) {
          logger.error('Failed to remove preset permission', failureMessage);
          failures.push({ entityType, bit, message: failureMessage });
        }
      });
    } else {
      logger.error('Failed to remove preset permissions', removeResult.reason);
      toRevoke.forEach(({ entityType, bit }) =>
        failures.push({
          entityType,
          bit,
          message: reasonMessage(removeResult.reason),
        }),
      );
    }
    return failures;
  };

  return (
    <RBACPermissionGrid
      scopeType={rolePreset.scopeType}
      grants={grants}
      grantsVersion={deferredFetchKey}
      loading={deferredFetchKey !== fetchKey}
      fetchKey={fetchKey}
      onRefresh={updateFetchKey}
      onSave={save}
    />
  );
};

export default RolePresetPermissionTable;
