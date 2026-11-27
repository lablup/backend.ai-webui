/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePresetPermissionTableAddMutation } from '../../../__generated__/RolePresetPermissionTableAddMutation.graphql';
import { RolePresetPermissionTableFragment$key } from '../../../__generated__/RolePresetPermissionTableFragment.graphql';
import { RolePresetPermissionTableQuery } from '../../../__generated__/RolePresetPermissionTableQuery.graphql';
import { RolePresetPermissionTableRemoveMutation } from '../../../__generated__/RolePresetPermissionTableRemoveMutation.graphql';
import { reasonMessage } from '../../../helper/mutationError';
import RBACPermissionGrid, {
  type RBACPermissionChanges,
  type RBACPermissionSaveFailure,
} from './RBACPermissionGrid';
import {
  INITIAL_FETCH_KEY,
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
        entityId
        scopeType
      }
    `,
    rolePresetFrgmt,
  );
  const rolePresetId = rolePreset.entityId;

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
                fieldId
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
        atomicBulkAddRolePresetPermissions(input: $input) {
          items {
            id
          }
        }
      }
    `);
  const removePermissions =
    useMutationWithPromise<RolePresetPermissionTableRemoveMutation>(graphql`
      mutation RolePresetPermissionTableRemoveMutation(
        $input: PartialBulkRemoveRolePresetPermissionsInput!
      ) {
        partialBulkRemoveRolePresetPermissions(input: $input) {
          successes {
            id
          }
          failed {
            id
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
    id: node.fieldId,
    entityType: node.entityType,
    permission: node.permission,
  }));

  const save = async ({ toGrant, toRevoke }: RBACPermissionChanges) => {
    // The add is all or nothing, so it goes first: a rejection saves nothing
    // and reaches the grid as one error.
    if (toGrant.length > 0) {
      await addPermissions({
        input: {
          rolePresetId,
          permissions: toGrant.map(({ entityType, bit }) => ({
            entityType,
            permission: bit,
          })),
        },
      }).catch((error) => {
        logger.error('Failed to add preset permissions', error);
        throw error;
      });
    }
    if (toRevoke.length === 0) {
      return [];
    }

    // The remove answers per entry; a rejected request fails every entry.
    try {
      const result = await removePermissions({
        input: { ids: toRevoke.map(({ id }) => id) },
      });
      const failedById = new Map(
        result.partialBulkRemoveRolePresetPermissions.failed.map((failure) => [
          String(failure.id),
          failure.message,
        ]),
      );
      return toRevoke.flatMap(({ entityType, bit, id }) => {
        const failureMessage = failedById.get(id);
        if (failureMessage === undefined) return [];
        logger.error('Failed to remove preset permission', failureMessage);
        return [{ entityType, bit, message: failureMessage }];
      });
    } catch (error) {
      logger.error('Failed to remove preset permissions', error);
      return toRevoke.map(({ entityType, bit }): RBACPermissionSaveFailure => ({
        entityType,
        bit,
        message: reasonMessage(error),
      }));
    }
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
