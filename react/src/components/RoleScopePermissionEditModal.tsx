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
import {
  RoleScopePermissionEditModal_scopesFragment$data,
  RoleScopePermissionEditModal_scopesFragment$key,
} from '../__generated__/RoleScopePermissionEditModal_scopesFragment.graphql';
import {
  applyBulkPermissionCells,
  type BulkCellState,
  diffPermissionCells,
  type PermissionCellDiff,
} from '../helper/rbacPermissionDiff';
import { App, Checkbox, Empty, Form, theme, Tooltip, Typography } from 'antd';
import {
  BAIBulkEditFormItem,
  BAIBulkErrorModal,
  type BAIColumnsType,
  BAIFlex,
  BAIListAlert,
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
// (`"<entityType>|<operation>"`). Scoped to this modal.
const CELL_KEY_SEPARATOR = '|';
const makeCellKey = (entityType: string, operation: string) =>
  `${entityType}${CELL_KEY_SEPARATOR}${operation}`;

/** Internal per-scope shape derived from the scopes fragment. */
interface EditingScope {
  scopeId: string;
  scopeName?: string | null;
}

/**
 * One failed bulk request, shaped for the shared `BAIBulkErrorModal` table —
 * one row per request the server rejected (FR-3334).
 */
interface FailedPermissionRequest {
  key: string;
  scopeLabel: string;
  permissionLabel: string;
  action: 'grant' | 'revoke';
  message: string;
}

/**
 * An `EntityRef` scope row with the per-type name fields selected — the
 * `_scopesFragment` element type with the Relay brand key dropped, so
 * `ScopedRolePermissionCard`'s structurally identical query nodes are
 * accepted too.
 */
type ScopeNameRecord = Omit<
  RoleScopePermissionEditModal_scopesFragment$data[number],
  ' $fragmentType'
>;

/**
 * Resolve an `EntityRef`'s human-readable display name from its resolved
 * `scope` entity, per scope type. Returns null-ish when the type is unknown
 * or the entity carries no name — callers fall back to the raw scope id.
 * Exported for `ScopedRolePermissionCard`, whose table shows the same names.
 */
export const resolveScopeName = (
  record: ScopeNameRecord,
): string | null | undefined => {
  const scope = record?.scope;
  if (!scope) return null;
  switch (record.scopeType) {
    case 'DOMAIN':
      return scope.basicInfo?.domainName;
    case 'PROJECT':
      return scope.basicInfo?.projectName;
    case 'USER':
      return scope.basicInfo?.email;
    case 'VFOLDER':
      return scope.vfolderName;
    case 'SESSION':
      return scope.metadata?.sessionName;
    case 'MODEL_DEPLOYMENT':
      return scope.metadata?.deploymentName;
    case 'RESOURCE_GROUP':
      return scope.resourceGroupName;
    case 'CONTAINER_REGISTRY':
      return scope.project
        ? `${scope.registryName} - ${scope.project}`
        : scope.registryName;
    default:
      return null;
  }
};

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
  /**
   * The `EntityRef` scope row(s) being edited. One entry → single-scope edit;
   * many → multi-scope bulk edit (FR-6). Empty while the modal is closed. The
   * scope type is derived from these nodes (uniform per card), so no separate
   * prop is needed.
   */
  scopesFrgmt: RoleScopePermissionEditModal_scopesFragment$key;
  onRequestClose: (success: boolean) => void;
}

/**
 * Scope-level permission edit modal. Replaces the former
 * `CreatePermissionModal`: instead of creating one permission at a time, it
 * edits a scope's entire configurable entity × action grid at once (FR-6).
 *
 * - **Single-scope** (`scopes.length === 1`): the operations the role
 *   currently grants on that scope are pre-checked; saving reconciles the grid
 *   against them.
 * - **Multi-scope bulk** (`scopes.length > 1`): every cell starts as
 *   'Keep as is' (`BAIBulkEditFormItem`; per-scope current values are NOT
 *   merged for display). Clicking a cell switches it into edit mode with the
 *   checkbox checked by default. Only cells the user switched into edit mode
 *   are applied to every selected scope; untouched cells keep each scope's
 *   existing value.
 *
 * All data (role id, permission matrix, granted permissions) arrives via
 * fragments from the parent card's query — opening the modal issues no fetch
 * of its own. Saving permissions is reversible, so this is a normal
 * `BAIModal`, not a typed-confirmation modal
 * (`.claude/rules/destructive-confirmation.md`).
 *
 * The grid state is initialized once on mount, so consumers must wrap this
 * modal in `BAIUnmountAfterClose` — it mounts fresh per open, which is what
 * resets the grid to the currently-granted state.
 */
const RoleScopePermissionEditModal: React.FC<
  RoleScopePermissionEditModalProps
> = ({
  roleNodeFrgmt,
  rbacPermissionMatrixFrgmt,
  permissionsFrgmt,
  scopesFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
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
            scopeId
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
  // exactly one open cycle, and freezing the scope refs keeps the title/grid
  // stable during the close animation after the parent clears its selection.
  const [scopeRefs] = useState(scopesFrgmt);
  const scopeNodes = useFragment(
    graphql`
      fragment RoleScopePermissionEditModal_scopesFragment on EntityRef
      @relay(plural: true) {
        scopeType
        scopeId
        scope {
          ... on DomainV2 {
            basicInfo {
              domainName: name
            }
          }
          ... on ProjectV2 {
            basicInfo {
              projectName: name
            }
          }
          ... on UserV2 {
            basicInfo {
              email
            }
          }
          ... on VirtualFolderNode {
            vfolderName: name
          }
          ... on SessionV2 {
            metadata {
              sessionName: name
            }
          }
          ... on ModelDeployment {
            metadata {
              deploymentName: name
            }
          }
          ... on ResourceGroup {
            resourceGroupName: name
          }
          ... on ContainerRegistryV2 {
            registryName
            project
          }
        }
      }
    `,
    scopeRefs,
  );

  // The scope type is uniform across a card's rows — derived from the nodes.
  const scopeType = scopeNodes[0]?.scopeType;
  const scopeList: EditingScope[] = scopeNodes.map((node) => ({
    scopeId: node.scopeId,
    scopeName: resolveScopeName(node),
  }));
  const isBulk = scopeList.length > 1;
  const scopeById = new Map(
    scopeList.map((scope) => [scope.scopeId, scope] as const),
  );
  // Falls back to the raw scope type when no i18n label is registered.
  const scopeTypeLabel = t(`rbac.types.${scopeType}`, {
    defaultValue: scopeType ?? '',
  });
  const displayName = scopeList[0]?.scopeName || scopeList[0]?.scopeId || '-';

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

  // Cells already reconciled by earlier partially-failed saves, keyed by
  // scopeId → cellKey → new permission id (granted) or null (revoked). The
  // permissions fragment stays stale until the parent refetches on close, so
  // these overrides layer the true backend state on top of it — a retry then
  // re-submits only the cells that actually failed (FR-3334).
  const [appliedCellOverrides, setAppliedCellOverrides] = useState<
    ReadonlyMap<string, ReadonlyMap<string, string | null>>
  >(new Map());

  // The role's currently-granted cells grouped by scope, plus each cell's
  // permission id (needed to delete on uncheck) — bulk save reconciles every
  // selected scope against its own initial state.
  const initialKeysByScopeId = new Map<string, Set<string>>();
  const permissionIdByScopeCell = new Map<string, Map<string, string>>();
  permissions.forEach((permission) => {
    const cellKey = makeCellKey(permission.entityType, permission.operation);
    let keys = initialKeysByScopeId.get(permission.scopeId);
    if (!keys) {
      keys = new Set<string>();
      initialKeysByScopeId.set(permission.scopeId, keys);
    }
    keys.add(cellKey);
    let idByCell = permissionIdByScopeCell.get(permission.scopeId);
    if (!idByCell) {
      idByCell = new Map<string, string>();
      permissionIdByScopeCell.set(permission.scopeId, idByCell);
    }
    idByCell.set(cellKey, toLocalId(permission.id));
  });
  // Layer the already-applied cells (from earlier partially-failed saves) on
  // top of the fragment-derived state. Last write wins per cell, so a cell
  // granted then revoked (or vice versa) across retries resolves correctly.
  appliedCellOverrides.forEach((cells, overrideScopeId) => {
    let keys = initialKeysByScopeId.get(overrideScopeId);
    let idByCell = permissionIdByScopeCell.get(overrideScopeId);
    cells.forEach((permissionId, cellKey) => {
      if (permissionId === null) {
        keys?.delete(cellKey);
        idByCell?.delete(cellKey);
      } else {
        if (!keys) {
          keys = new Set<string>();
          initialKeysByScopeId.set(overrideScopeId, keys);
        }
        if (!idByCell) {
          idByCell = new Map<string, string>();
          permissionIdByScopeCell.set(overrideScopeId, idByCell);
        }
        keys.add(cellKey);
        idByCell.set(cellKey, permissionId);
      }
    });
  });

  const singleScopeId = !isBulk ? scopeList[0]?.scopeId : undefined;

  // Single-scope edit: the one scope's grants are pre-checked and the grid is
  // diffed against them on save.
  const [editedKeys, setEditedKeys] = useState<Set<string>>(
    () =>
      new Set(
        singleScopeId ? (initialKeysByScopeId.get(singleScopeId) ?? []) : [],
      ),
  );
  // Bulk edit: each editable cell is a `BAIBulkEditFormItem` field on this
  // form. Cells left as 'Keep as is' hold `undefined`; cells switched into
  // edit mode hold the checkbox boolean.
  const [bulkForm] = Form.useForm<Record<string, boolean | undefined>>();
  const [isSaving, setIsSaving] = useState(false);
  // Per-request errors of the last save, surfaced through the shared
  // bulk-error modal. The rows persist after the error modal closes (only the
  // open flag flips) so the table doesn't empty out mid close-animation.
  const [failedRequests, setFailedRequests] = useState<
    FailedPermissionRequest[]
  >([]);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  // Whether any change already reached the backend (partial success). The
  // parent must refetch on close even if the user then cancels.
  const hasAppliedChanges = appliedCellOverrides.size > 0;

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

  /** Human-readable "Entity / Operation" label of a grid cell. */
  const permissionCellLabel = (key: string) => {
    const [entityType, operation] = key.split(CELL_KEY_SEPARATOR);
    return `${t(`rbac.types.${entityType}`, {
      defaultValue: entityType,
    })} / ${operationLabel(operation)}`;
  };

  const scopeLabelOf = (scope: EditingScope | undefined, fallback: string) =>
    scope?.scopeName || scope?.scopeId || fallback;

  const handleSave = async () => {
    if (!scopeType || scopeList.length === 0) {
      return;
    }

    // Bulk edit: only the cells the user switched into edit mode carry a
    // boolean; cells left as 'Keep as is' stay `undefined` and are skipped.
    const bulkValues: Record<string, boolean | undefined> = isBulk
      ? bulkForm.getFieldsValue(true)
      : {};
    const modifiedCells = new Map<string, BulkCellState>();
    Object.entries(bulkValues).forEach(([key, value]) => {
      if (value === true) {
        modifiedCells.set(key, 'checked');
      } else if (value === false) {
        modifiedCells.set(key, 'unchecked');
      }
    });

    // Per-target reconciliation: single-scope diffs the grid against its
    // pre-checked state; bulk applies only the user-modified cells to every
    // selected scope's own initial state ('Keep as is' cells untouched,
    // already-satisfied scopes skipped) — both share the dirty-tracking core
    // in `rbacPermissionDiff`.
    const createEntries: Array<{
      scope: EditingScope;
      key: string;
    }> = [];
    const deleteEntries: Array<{
      scope: EditingScope;
      key: string;
      permissionId: string;
    }> = [];
    scopeList.forEach((scope) => {
      const scopeInitial =
        initialKeysByScopeId.get(scope.scopeId) ?? new Set<string>();
      const diff: PermissionCellDiff = isBulk
        ? applyBulkPermissionCells(scopeInitial, modifiedCells)
        : diffPermissionCells(scopeInitial, editedKeys);
      diff.toCreate.forEach((key) => createEntries.push({ scope, key }));
      // toDelete ⊆ the scope's initial keys, and every initial key has its
      // permission id recorded, so the lookup cannot miss.
      diff.toDelete.forEach((key) => {
        const permissionId = permissionIdByScopeCell
          .get(scope.scopeId)
          ?.get(key);
        if (permissionId) {
          deleteEntries.push({ scope, key, permissionId });
        }
      });
    });

    // Dirty tracking: nothing changed anywhere → close without any request
    // (FR-6).
    if (createEntries.length === 0 && deleteEntries.length === 0) {
      onRequestClose(true);
      return;
    }

    const createInputs = createEntries.map(({ scope, key }) => {
      const [entityType, operation] = key.split(CELL_KEY_SEPARATOR);
      return {
        roleId,
        scopeType: scopeType as RBACElementType,
        scopeId: scope.scopeId,
        entityType: entityType as RBACElementType,
        operation: operation as OperationType,
      };
    });
    const deleteIds = deleteEntries.map((entry) => entry.permissionId);
    const entryByPermissionId = new Map(
      deleteEntries.map((entry) => [entry.permissionId, entry] as const),
    );

    setIsSaving(true);
    try {
      // The whole per-scope diff ships as at most two bulk mutations (26.4.4):
      // one add batch, one remove batch. Both payloads report per-row
      // failures; a wholly-rejected request counts its entire batch as failed
      // (FR-6 / spec Risks).
      const [addResult, removeResult] = await Promise.allSettled([
        createInputs.length > 0
          ? bulkAddPermissions({ input: { permissions: createInputs } })
          : Promise.resolve(null),
        deleteIds.length > 0
          ? bulkRemovePermissions({ input: { permissionIds: deleteIds } })
          : Promise.resolve(null),
      ]);

      const failures: FailedPermissionRequest[] = [];
      // Cells the backend actually reconciled in this save — layered onto
      // `appliedCellOverrides` on partial failure so a retry skips them.
      const appliedUpdates = new Map<string, Map<string, string | null>>();
      const recordApplied = (
        appliedScopeId: string,
        cellKey: string,
        permissionId: string | null,
      ) => {
        let cells = appliedUpdates.get(appliedScopeId);
        if (!cells) {
          cells = new Map<string, string | null>();
          appliedUpdates.set(appliedScopeId, cells);
        }
        cells.set(cellKey, permissionId);
      };
      // useMutationWithPromise rejects GraphQL-level failures with the raw
      // PayloadError[], so unwrap per-error messages instead of String().
      const reasonMessage = (reason: unknown): string => {
        if (reason instanceof Error) {
          return reason.message;
        }
        if (Array.isArray(reason)) {
          const messages = reason
            .map((item) =>
              item !== null && typeof item === 'object' && 'message' in item
                ? String(item.message)
                : String(item),
            )
            .filter(Boolean);
          if (messages.length > 0) {
            return messages.join('\n');
          }
        }
        return String(reason);
      };

      if (addResult.status === 'fulfilled') {
        const addPayload = addResult.value?.adminBulkAddRolePermissions;
        // Successfully-created rows carry their new permission id — record it
        // so a later uncheck of the same cell can delete it without a refetch.
        addPayload?.items.forEach((item) => {
          recordApplied(
            item.scopeId,
            makeCellKey(item.entityType, item.operation),
            toLocalId(item.id),
          );
        });
        addPayload?.failed.forEach((failure) => {
          logger.error('Failed to add permission', failure.message);
          const cellKey = makeCellKey(failure.entityType, failure.operation);
          failures.push({
            key: `grant-${failure.scopeId}-${cellKey}`,
            scopeLabel: scopeLabelOf(
              scopeById.get(failure.scopeId),
              failure.scopeId,
            ),
            permissionLabel: permissionCellLabel(cellKey),
            action: 'grant',
            message: failure.message,
          });
        });
      } else {
        logger.error('Failed to add permissions', addResult.reason);
        // A wholly-rejected request counts its entire batch as failed.
        createEntries.forEach(({ scope, key }) => {
          failures.push({
            key: `grant-${scope.scopeId}-${key}`,
            scopeLabel: scopeLabelOf(scope, scope.scopeId),
            permissionLabel: permissionCellLabel(key),
            action: 'grant',
            message: reasonMessage(addResult.reason),
          });
        });
      }
      if (removeResult.status === 'fulfilled') {
        const removePayload =
          removeResult.value?.adminBulkRemoveRolePermissions;
        const failedRemoveIds = new Set(
          (removePayload?.failed ?? []).map((failure) =>
            String(failure.permissionId),
          ),
        );
        // Requested deletions not reported as failed were applied.
        deleteEntries.forEach((entry) => {
          if (!failedRemoveIds.has(entry.permissionId)) {
            recordApplied(entry.scope.scopeId, entry.key, null);
          }
        });
        removePayload?.failed.forEach((failure) => {
          logger.error('Failed to remove permission', failure.message);
          const entry = entryByPermissionId.get(String(failure.permissionId));
          failures.push({
            key: `revoke-${failure.permissionId}`,
            scopeLabel: entry
              ? scopeLabelOf(entry.scope, entry.scope.scopeId)
              : String(failure.permissionId),
            permissionLabel: entry ? permissionCellLabel(entry.key) : '-',
            action: 'revoke',
            message: failure.message,
          });
        });
      } else {
        logger.error('Failed to remove permissions', removeResult.reason);
        deleteEntries.forEach(({ scope, key }) => {
          failures.push({
            key: `revoke-${scope.scopeId}-${key}`,
            scopeLabel: scopeLabelOf(scope, scope.scopeId),
            permissionLabel: permissionCellLabel(key),
            action: 'revoke',
            message: reasonMessage(removeResult.reason),
          });
        });
      }

      if (failures.length === 0) {
        message.success(t('rbac.PermissionsSaved'));
        // Close and let the section refetch so tags reflect the true state.
        onRequestClose(true);
        return;
      }

      // Partial failure: keep this modal — and the user's edits — alive for a
      // retry (FR-3334). The applied cells are layered onto the initial state
      // so the next save re-submits only what actually failed; the per-request
      // errors are surfaced through the shared bulk-error modal.
      if (appliedUpdates.size > 0) {
        setAppliedCellOverrides((previous) => {
          const next = new Map(
            Array.from(
              previous,
              ([prevScopeId, cells]) => [prevScopeId, new Map(cells)] as const,
            ),
          );
          appliedUpdates.forEach((cells, updatedScopeId) => {
            let target = next.get(updatedScopeId);
            if (!target) {
              target = new Map<string, string | null>();
              next.set(updatedScopeId, target);
            }
            const targetCells = target;
            cells.forEach((permissionId, cellKey) => {
              targetCells.set(cellKey, permissionId);
            });
          });
          return next;
        });
      }
      setFailedRequests(failures);
      setIsFailureModalOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  // Every OperationType renders a cell; combinations absent from the
  // permission matrix show a '-' with a "not assignable" tooltip so the
  // grid shape stays identical across entities. Bulk mode renders each cell
  // as a `BAIBulkEditFormItem`: 'Keep as is' until clicked, then an editable
  // checkbox that starts checked.
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
    if (isBulk) {
      return (
        <BAIBulkEditFormItem
          name={key}
          valuePropName="checked"
          // Applies when the field registers, i.e. the moment the cell is
          // switched into edit mode — the checkbox starts checked.
          initialValue={true}
        >
          <Checkbox />
        </BAIBulkEditFormItem>
      );
    }
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
        // Bulk cells host the 'Keep as is' placeholder input, which needs a
        // stable column width (checkbox-only cells size themselves).
        width: isBulk ? 120 : undefined,
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
        width: isBulk ? 120 : undefined,
        render: (_value: unknown, entity: (typeof entities)[number]) =>
          renderPermissionCell(entity, operation),
      })),
    },
  ];

  // Failed-request table shown in the shared bulk-error modal — one row per
  // rejected grant/revoke request.
  const failureColumns: BAIColumnsType<FailedPermissionRequest> = [
    {
      key: 'scope',
      title: t('rbac.ScopeId'),
      dataIndex: 'scopeLabel',
    },
    {
      key: 'permission',
      title: t('rbac.Permission'),
      dataIndex: 'permissionLabel',
    },
    {
      key: 'action',
      title: t('rbac.Action'),
      dataIndex: 'action',
      render: (action: FailedPermissionRequest['action']) =>
        action === 'grant' ? t('rbac.Grant') : t('rbac.Revoke'),
    },
    {
      key: 'message',
      title: t('rbac.ErrorMessage'),
      dataIndex: 'message',
    },
  ];

  return (
    <BAIModal
      {...baiModalProps}
      title={
        <BAIFlex
          direction="column"
          align="start"
          style={{ minWidth: 0, width: '100%' }}
        >
          <span>
            {t(
              isBulk
                ? 'rbac.BulkEditScopeTypePermissions'
                : 'rbac.EditScopeTypePermissions',
              { type: scopeTypeLabel },
            )}
          </span>
          {!isBulk && (
            // Single-scope edit: the edited scope's name as a small subtitle
            // (the title itself only carries the scope type).
            <Typography.Text
              type="secondary"
              ellipsis={{ tooltip: displayName }}
              style={{
                fontSize: token.fontSizeSM,
                fontWeight: 'normal',
                maxWidth: '100%',
              }}
            >
              {displayName}
            </Typography.Text>
          )}
        </BAIFlex>
      }
      okText={t('button.Save')}
      onOk={handleSave}
      confirmLoading={isSaving}
      // After a partial failure some changes did reach the backend, so even a
      // cancel must report success=true — the parent then refetches and the
      // tags reflect the true state.
      onCancel={() => onRequestClose(hasAppliedChanges)}
      // Bulk cells render a 'Keep as is' placeholder input per operation
      // column, so the grid needs considerably more room than the
      // checkbox-only single-scope grid. antd's own `max-width:
      // calc(100vw - 32px)` keeps it inside the viewport on small screens.
      width={isBulk ? 900 : 760}
    >
      <Form form={bulkForm} component={false}>
        <BAIFlex direction="column" align="stretch" gap="sm">
          {isBulk && (
            // Keep-as-is semantics + the concrete scopes this edit will touch
            // (same pattern as UpdateUsersModal's selected-users alert).
            <BAIListAlert
              type="info"
              showIcon
              title={t('rbac.BulkEditKeepAsIsDescription', {
                type: scopeTypeLabel,
              })}
              items={scopeList.map((scope) => ({
                key: scope.scopeId,
                content: scope.scopeName || scope.scopeId,
              }))}
            />
          )}
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
        </BAIFlex>
      </Form>
      {/* Per-request errors of a partially-failed save (FR-3334). Rendered
          inside the edit modal so both live one open cycle under the parent's
          `BAIUnmountAfterClose`; the edit modal (and the user's edits) stays
          open behind it for a retry. */}
      <BAIBulkErrorModal<FailedPermissionRequest>
        open={isFailureModalOpen}
        description={t('rbac.PermissionsPartialFailureDescription')}
        columns={failureColumns}
        dataSource={failedRequests}
        onRequestClose={() => setIsFailureModalOpen(false)}
      />
    </BAIModal>
  );
};

export default RoleScopePermissionEditModal;
