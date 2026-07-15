/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type OperationType,
  type RBACElementType,
  RoleScopePermissionEditModalBulkAddMutation,
} from '../__generated__/RoleScopePermissionEditModalBulkAddMutation.graphql';
import { RoleScopePermissionEditModalBulkRemoveMutation } from '../__generated__/RoleScopePermissionEditModalBulkRemoveMutation.graphql';
import { RoleScopePermissionEditModalFragment$key } from '../__generated__/RoleScopePermissionEditModalFragment.graphql';
import { RoleScopePermissionEditModal_permissionsFragment$key } from '../__generated__/RoleScopePermissionEditModal_permissionsFragment.graphql';
import { RoleScopePermissionEditModal_rbacPermissionMatrixFragment$key } from '../__generated__/RoleScopePermissionEditModal_rbacPermissionMatrixFragment.graphql';
import { diffPermissionCells } from '../helper/rbacPermissionDiff';
import { App, Checkbox, Empty, theme, Tooltip, Typography } from 'antd';
import {
  type BAIColumnsType,
  BAIFlex,
  BAIModal,
  type BAIModalProps,
  BAITable,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

/**
 * Grantable operations grouped into Direct vs Delegate (`GRANT_*`), ported from
 * the removed `CreatePermissionModal`. Together they cover the full
 * `OperationType` enum — every operation always gets a column; combinations the
 * permission matrix does not support render as disabled cells. The order here
 * is the column order within each group.
 */
const DIRECT_OPERATIONS: ReadonlyArray<OperationType> = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

const DELEGATE_OPERATIONS: ReadonlyArray<OperationType> = [
  'GRANT_ALL',
  'GRANT_READ',
  'GRANT_UPDATE',
  'GRANT_SOFT_DELETE',
  'GRANT_HARD_DELETE',
];

// Separates the `entityType` and `operation` halves of a grid cell key
// (`"<entityType>|<operation>"`). Scoped to this modal — the tab's scope-row
// keys (`scopeType|scopeId`) use their own separator.
const CELL_KEY_SEPARATOR = '|';
const makeCellKey = (entityType: string, operation: string) =>
  `${entityType}${CELL_KEY_SEPARATOR}${operation}`;

export interface RoleScopePermissionEditModalScope {
  scopeId: string;
  scopeName?: string | null;
}

interface RoleScopePermissionEditModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'title' | 'footer'
> {
  roleNodeFrgmt: RoleScopePermissionEditModalFragment$key;
  rbacPermissionMatrixFrgmt: RoleScopePermissionEditModal_rbacPermissionMatrixFragment$key;
  /**
   * The role's permission rows for this scope type, fetched by the parent
   * card's query — the same set its grant-state tags are computed from, so the
   * pre-checked grid always agrees with the tags on screen.
   */
  permissionsFrgmt: RoleScopePermissionEditModal_permissionsFragment$key;
  scopeType: string;
  /** The concrete scope instance being edited; `null` while the modal is closed. */
  editingScope: RoleScopePermissionEditModalScope | null;
  onRequestClose: (success: boolean) => void;
}

/**
 * Scope-level permission edit modal (single scope). Replaces the former
 * `CreatePermissionModal`: instead of creating one permission at a time, it
 * edits the scope's entire configurable entity × action grid at once (FR-6).
 *
 * All data (role id, permission matrix, granted permissions) arrives via
 * fragments from the parent card's query — opening the modal issues no fetch
 * of its own. Saving permissions is reversible, so this is a normal
 * `BAIModal`, not a typed-confirmation modal
 * (`.claude/rules/destructive-confirmation.md`).
 *
 * The checked-state (`editedKeys`) is initialized once on mount, so consumers
 * must wrap this modal in `BAIUnmountAfterClose` — it mounts fresh per open,
 * which is what resets the grid to the currently-granted state.
 */
const RoleScopePermissionEditModal: React.FC<
  RoleScopePermissionEditModalProps
> = ({
  roleNodeFrgmt,
  rbacPermissionMatrixFrgmt,
  permissionsFrgmt,
  scopeType,
  editingScope,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, notification } = App.useApp();
  const { logger } = useBAILogger();

  const role = useFragment(
    graphql`
      fragment RoleScopePermissionEditModalFragment on Role {
        id
      }
    `,
    roleNodeFrgmt,
  );
  const roleId = toLocalId(role.id);

  const rbacPermissionMatrix = useFragment(
    graphql`
      fragment RoleScopePermissionEditModal_rbacPermissionMatrixFragment on ScopeEntityOperationCombination
      @relay(plural: true) {
        scopeType
        entities {
          entityType
          actions {
            requiredPermission
          }
        }
      }
    `,
    rbacPermissionMatrixFrgmt,
  );

  const permissions = useFragment(
    graphql`
      fragment RoleScopePermissionEditModal_permissionsFragment on Permission
      @relay(plural: true) {
        id
        scopeId
        entityType
        operation
      }
    `,
    permissionsFrgmt,
  );

  const bulkAddPermissions =
    useMutationWithPromise<RoleScopePermissionEditModalBulkAddMutation>(graphql`
      mutation RoleScopePermissionEditModalBulkAddMutation(
        $input: BulkAddRolePermissionsInput!
      ) {
        adminBulkAddRolePermissions(input: $input) {
          items {
            id
            scopeType
            scopeId
            entityType
            operation
          }
          failed {
            entityType
            operation
            message
          }
        }
      }
    `);

  const bulkRemovePermissions =
    useMutationWithPromise<RoleScopePermissionEditModalBulkRemoveMutation>(
      graphql`
        mutation RoleScopePermissionEditModalBulkRemoveMutation(
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
      `,
    );

  // Captured at mount: wrapped in `BAIUnmountAfterClose`, this component lives
  // exactly one open cycle, and freezing the scope keeps the title/grid stable
  // during the close animation after the parent clears `editingScope`.
  const [scope] = useState(editingScope);
  const scopeId = scope?.scopeId;
  const scopeTypeLabel = t(`rbac.types.${scopeType}`, {
    defaultValue: scopeType,
  });
  const displayName = scope?.scopeName || scopeId || '-';

  // Configurable entity × operation grid for this scope type. Cells are keyed by
  // the OperationType (`requiredPermission`) — the value granted/revoked and the
  // same identity the tag state (FR-4) compares against — so two matrix actions
  // that share a requiredPermission collapse to a single checkbox.
  const matrixEntry = rbacPermissionMatrix.find(
    (combination) => combination.scopeType === scopeType,
  );
  const entities = (matrixEntry?.entities ?? [])
    .filter((entity) => entity.actions.length > 0)
    .map((entity) => ({
      entityType: entity.entityType,
      supportedOperations: new Set(
        entity.actions.map((action) => action.requiredPermission),
      ),
    }));

  // The role's currently-granted cells for the edited scope, narrowed from the
  // parent card's scope-type-wide permission set, plus each cell's permission
  // id (needed to delete on uncheck).
  const initialKeys = new Set<string>();
  const permissionIdByKey = new Map<string, string>();
  permissions.forEach((permission) => {
    if (permission.scopeId !== scopeId) return;
    const key = makeCellKey(permission.entityType, permission.operation);
    initialKeys.add(key);
    permissionIdByKey.set(key, toLocalId(permission.id));
  });

  const [editedKeys, setEditedKeys] = useState<Set<string>>(
    () => new Set(initialKeys),
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleCell = (key: string, checked: boolean) => {
    setEditedKeys((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  };

  const operationLabel = (operation: string) =>
    t(`rbac.operations.${operation}`, { defaultValue: operation });

  // Column header for a `GRANT_*` operation. The Delegate group header already
  // says "delegate", so the column shows only the delegated base operation
  // (GRANT_READ → "Read"); GRANT_ALL has no base operation and shows "All".
  const delegateOperationColumnLabel = (operation: OperationType) => {
    const baseOperation = operation.replace(/^GRANT_/, '');
    return baseOperation === 'ALL'
      ? t('general.All')
      : operationLabel(baseOperation);
  };

  const describeCell = (key: string) => {
    const [entityType, operation] = key.split(CELL_KEY_SEPARATOR);
    return `${t(`rbac.types.${entityType}`, {
      defaultValue: entityType,
    })} / ${operationLabel(operation)}`;
  };

  const handleSave = async () => {
    if (!scopeId) return;
    const { toCreate, toDelete } = diffPermissionCells(initialKeys, editedKeys);

    // Dirty tracking: nothing changed → close without any request (FR-6).
    if (toCreate.length === 0 && toDelete.length === 0) {
      onRequestClose(true);
      return;
    }

    const createInputs = toCreate.map((key) => {
      const [entityType, operation] = key.split(CELL_KEY_SEPARATOR);
      return {
        roleId,
        scopeType: scopeType as RBACElementType,
        scopeId,
        entityType: entityType as RBACElementType,
        operation: operation as OperationType,
      };
    });
    // toDelete ⊆ initialKeys, and every initial key has its permission id
    // recorded, so the lookup cannot miss; the filter is for type narrowing.
    const deleteIds = toDelete
      .map((key) => permissionIdByKey.get(key))
      .filter((id): id is string => !!id);
    const keyByPermissionId = new Map(
      Array.from(permissionIdByKey, ([key, id]) => [id, key] as const),
    );

    setIsSaving(true);
    try {
      // The whole diff ships as at most two bulk mutations (26.4.4): one add
      // batch, one remove batch. Both payloads report per-row failures; a
      // wholly-rejected request counts its entire batch as failed (FR-6 /
      // spec Risks).
      const [addResult, removeResult] = await Promise.allSettled([
        createInputs.length > 0
          ? bulkAddPermissions({ input: { permissions: createInputs } })
          : Promise.resolve(null),
        deleteIds.length > 0
          ? bulkRemovePermissions({ input: { permissionIds: deleteIds } })
          : Promise.resolve(null),
      ]);

      const failedLabels: string[] = [];
      if (addResult.status === 'fulfilled') {
        addResult.value?.adminBulkAddRolePermissions?.failed.forEach(
          (failure) => {
            logger.error('Failed to add permission', failure.message);
            failedLabels.push(
              describeCell(makeCellKey(failure.entityType, failure.operation)),
            );
          },
        );
      } else {
        logger.error('Failed to add permissions', addResult.reason);
        failedLabels.push(...toCreate.map(describeCell));
      }
      if (removeResult.status === 'fulfilled') {
        removeResult.value?.adminBulkRemoveRolePermissions?.failed.forEach(
          (failure) => {
            logger.error('Failed to remove permission', failure.message);
            const key = keyByPermissionId.get(failure.permissionId);
            failedLabels.push(
              key ? describeCell(key) : String(failure.permissionId),
            );
          },
        );
      } else {
        logger.error('Failed to remove permissions', removeResult.reason);
        failedLabels.push(...toDelete.map(describeCell));
      }

      if (failedLabels.length === 0) {
        message.success(t('rbac.PermissionsSaved'));
      } else {
        notification.error({
          title: t('rbac.PermissionsPartialFailure', {
            count: failedLabels.length,
          }),
          description: failedLabels.join(', '),
        });
      }
    } finally {
      setIsSaving(false);
    }

    // Close and let the section refetch so tags reflect the true state, even on
    // a partial failure.
    onRequestClose(true);
  };

  // Every OperationType renders a cell; combinations absent from the
  // permission matrix show a '-' with a "not assignable" tooltip so the
  // grid shape stays identical across entities.
  const renderPermissionCell = (
    entity: (typeof entities)[number],
    operation: OperationType,
  ) => {
    if (!entity.supportedOperations.has(operation)) {
      return (
        <Tooltip title={t('rbac.PermissionNotAssignable')}>
          <Typography.Text type="secondary" style={{ padding: '0 8px' }}>
            -
          </Typography.Text>
        </Tooltip>
      );
    }
    const key = makeCellKey(entity.entityType, operation);
    return (
      <Checkbox
        checked={editedKeys.has(key)}
        onChange={(event) => toggleCell(key, event.target.checked)}
      />
    );
  };

  const columns: BAIColumnsType<(typeof entities)[number]> = [
    {
      key: 'entityType',
      title: t('rbac.PermissionType'),
      fixed: 'left',
      render: (_value, entity) => (
        <Typography.Text>
          {t(`rbac.types.${entity.entityType}`, {
            defaultValue: entity.entityType,
          })}
        </Typography.Text>
      ),
    },
    {
      key: 'direct',
      title: t('rbac.operationGroups.Direct'),
      children: DIRECT_OPERATIONS.map((operation) => ({
        key: operation,
        title: operationLabel(operation),
        align: 'center',
        render: (_value: unknown, entity: (typeof entities)[number]) =>
          renderPermissionCell(entity, operation),
      })),
    },
    {
      key: 'delegate',
      title: t('rbac.operationGroups.Delegate'),
      children: DELEGATE_OPERATIONS.map((operation) => ({
        key: operation,
        title: delegateOperationColumnLabel(operation),
        align: 'center',
        render: (_value: unknown, entity: (typeof entities)[number]) =>
          renderPermissionCell(entity, operation),
      })),
    },
  ];

  return (
    <BAIModal
      {...baiModalProps}
      title={
        <BAIFlex
          direction="column"
          align="start"
          gap="xxs"
          style={{ minWidth: 0, width: '100%' }}
        >
          <span>{t('rbac.EditScopePermissions')}</span>
          <Typography.Text
            type="secondary"
            ellipsis={{ tooltip: `${scopeTypeLabel} / ${displayName}` }}
            style={{ fontSize: token.fontSizeSM, maxWidth: '100%' }}
          >
            {`${scopeTypeLabel} / ${displayName}`}
          </Typography.Text>
        </BAIFlex>
      }
      okText={t('button.Save')}
      onOk={handleSave}
      confirmLoading={isSaving}
      onCancel={() => onRequestClose(false)}
      width={760}
    >
      {entities.length === 0 ? (
        <Empty description={t('rbac.NoPermissionsToDisplay')} />
      ) : (
        <BAITable
          rowKey="entityType"
          columns={columns}
          dataSource={entities}
          pagination={false}
          resizable={false}
          bordered
          size="small"
          scroll={{ x: 'max-content' }}
        />
      )}
    </BAIModal>
  );
};

export default RoleScopePermissionEditModal;
