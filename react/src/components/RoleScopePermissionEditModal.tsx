/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  type CreatePermissionInput,
  type PermissionBit,
  RoleScopePermissionEditModalBulkAddMutation,
} from '../__generated__/RoleScopePermissionEditModalBulkAddMutation.graphql';
import { RoleScopePermissionEditModalBulkRemoveMutation } from '../__generated__/RoleScopePermissionEditModalBulkRemoveMutation.graphql';
import { RoleScopePermissionEditModalFragment$key } from '../__generated__/RoleScopePermissionEditModalFragment.graphql';
import { RoleScopePermissionEditModal_permissionsFragment$key } from '../__generated__/RoleScopePermissionEditModal_permissionsFragment.graphql';
import { RoleScopePermissionEditModal_rbacPermissionMatrixFragment$key } from '../__generated__/RoleScopePermissionEditModal_rbacPermissionMatrixFragment.graphql';
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { reasonMessage } from '../helper/mutationError';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import {
  applyBulkPermissionCells,
  type BulkCellState,
  type PermissionCellDiff,
} from '../helper/rbacPermissionDiff';
import { useSuspendedBackendaiClient } from '../hooks';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIBulkEditFormItem,
  BAIBulkErrorModal,
  BAICheckbox,
  type BAIColumnsType,
  BAIDoubleToken,
  BAIFlex,
  BAIListAlert,
  BAIModal,
  type BAIModalProps,
  BAITable,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import _ from 'lodash';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

/**
 * The five `PermissionBit`s, in column order. A manager < 26.9.0 names the
 * same five as its direct `OperationType`s.
 */
const PERMISSION_BITS: ReadonlyArray<string> = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

/**
 * `OperationType`'s delegate operations. A manager >= 26.9.0 lists none of
 * them in its permission matrix, so the delegate column group only appears
 * when the matrix lists one.
 */
const DELEGATE_OPERATIONS: ReadonlyArray<string> = [
  'GRANT_ALL',
  'GRANT_READ',
  'GRANT_UPDATE',
  'GRANT_SOFT_DELETE',
  'GRANT_HARD_DELETE',
];

// Separates the `entityType` and `permission` halves of a grid cell key
// (`"<entityType>|<permission>"`). Scoped to this modal.
const CELL_KEY_SEPARATOR = '|';
const makeCellKey = (entityType: string, permission: string) =>
  `${entityType}${CELL_KEY_SEPARATOR}${permission}`;

/** One scope being edited, resolved by the parent card. */
export interface EditingScope {
  scopeId: string;
  /** Display name; the raw scope id stands in when absent. */
  scopeName?: string | null;
}

/**
 * One failed bulk request, shaped for the shared `BAIBulkErrorModal` table —
 * one row per request the server rejected (FR-3334).
 */
interface FailedPermissionRequest {
  key: string;
  /** Scope display name (falls back to the raw scope id). */
  scopeLabel: string;
  /**
   * Grid cell key of the failed permission; absent when a failed row cannot
   * be mapped back to a requested cell (e.g. an unknown permission id).
   */
  cellKey?: string;
  message: string;
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
  /** The scope type of every edited scope, spelled as the manager answered. */
  scopeType: string;
  /**
   * The scope(s) being edited. One entry → single-scope edit; many →
   * multi-scope bulk edit (managers < 26.9.0 only, where a role can hold
   * several scopes). Empty while the modal is closed.
   */
  scopes: ReadonlyArray<EditingScope>;
  onRequestClose: (success: boolean) => void;
}

/**
 * Scope-level permission edit modal. Edits a scope's entire configurable
 * entity × permission grid at once (FR-6).
 *
 * - **Single-scope** (`scopes.length === 1`): the permissions the role
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
  scopeType,
  scopes,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  // A manager >= 26.9.0 takes `{ roleId, entityType, permission }` and answers
  // no scope on a permission; an older one takes the scope and an
  // `OperationType` (ADR 0006).
  const isSingleScopeRole = baiClient.supports('rbac-single-scope-role');

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
        scopeId @deprecatedSince(version: "26.9.0a1")
        entityType
        operation @deprecatedSince(version: "26.9.0a1")
        permission @since(version: "26.9.0a1")
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
            scopeId @deprecatedSince(version: "26.9.0a1")
            entityType
            operation @deprecatedSince(version: "26.9.0a1")
            permission @since(version: "26.9.0a1")
          }
          failed {
            scopeId @deprecatedSince(version: "26.9.0a1")
            entityType
            operation @deprecatedSince(version: "26.9.0a1")
            permission @since(version: "26.9.0a1")
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
  // exactly one open cycle, and freezing the list keeps the title/grid stable
  // during the close animation after the parent clears its selection.
  const [scopeList] = useState<ReadonlyArray<EditingScope>>(scopes);
  const isBulk = scopeList.length > 1;
  // A manager >= 26.9.0 answers no scope on a permission: every permission
  // follows the role's one scope, which is the one scope being edited.
  const roleScopeId = isSingleScopeRole ? scopeList[0]?.scopeId : undefined;
  // Falls back to the raw RBAC type name when no i18n label is registered.
  const rbacTypeLabel = (type: string) =>
    t(rbacTypeI18nKey(type), { defaultValue: type });
  const scopeTypeLabel = rbacTypeLabel(scopeType);
  const displayName = scopeList[0]?.scopeName || scopeList[0]?.scopeId || '-';

  // Configurable entity × permission grid for this scope type. Cells are
  // keyed by `requiredPermission` — the value granted/revoked and the same
  // identity the tag state compares against — so two matrix actions that
  // share a requiredPermission collapse to a single checkbox. A manager
  // >= 26.9.0 answers a `PermissionBit`, an older one an `OperationType`.
  const matrixEntry = rbacPermissionMatrix.find(
    (combination) =>
      combination.scopeType.toUpperCase() === scopeType.toUpperCase(),
  );
  const entities = (matrixEntry?.entities ?? [])
    .filter((entity) => entity.actions.length > 0)
    .map((entity) => ({
      entityType: entity.entityType,
      grantable: new Set<string>(
        entity.actions.map((action) => action.requiredPermission),
      ),
    }));
  const hasDelegateOperations = entities.some((entity) =>
    DELEGATE_OPERATIONS.some((operation) => entity.grantable.has(operation)),
  );

  // Cells already reconciled by earlier partially-failed saves, keyed by
  // scopeId → cellKey → new permission id (granted) or null (revoked). The
  // permissions fragment stays stale until the parent refetches on close, so
  // these overrides layer the true backend state on top of it — a retry then
  // re-submits only the cells that actually failed (FR-3334).
  const [appliedCellOverrides, setAppliedCellOverrides] = useState<
    ReadonlyMap<string, ReadonlyMap<string, string | null>>
  >(new Map());

  // The role's currently-granted cells grouped by scope, each mapped to its
  // permission id (needed to delete on uncheck) — a scope's granted cell keys
  // are exactly this map's inner keys, and bulk save reconciles every selected
  // scope against its own initial state.
  const permissionIdByScopeCell = new Map<string, Map<string, string>>();
  permissions.forEach((permission) => {
    const granted = permission.permission ?? permission.operation;
    const permissionScopeId = permission.scopeId ?? roleScopeId;
    if (!granted || !permissionScopeId) return;
    const cellKey = makeCellKey(permission.entityType, granted);
    let idByCell = permissionIdByScopeCell.get(permissionScopeId);
    if (!idByCell) {
      idByCell = new Map<string, string>();
      permissionIdByScopeCell.set(permissionScopeId, idByCell);
    }
    idByCell.set(cellKey, toLocalId(permission.id));
  });
  // Layer the already-applied cells (from earlier partially-failed saves) on
  // top of the fragment-derived state. Last write wins per cell, so a cell
  // granted then revoked (or vice versa) across retries resolves correctly.
  appliedCellOverrides.forEach((cells, overrideScopeId) => {
    let idByCell = permissionIdByScopeCell.get(overrideScopeId);
    cells.forEach((permissionId, cellKey) => {
      if (permissionId === null) {
        idByCell?.delete(cellKey);
      } else {
        if (!idByCell) {
          idByCell = new Map<string, string>();
          permissionIdByScopeCell.set(overrideScopeId, idByCell);
        }
        idByCell.set(cellKey, permissionId);
      }
    });
  });
  /** The cell keys a scope currently grants (initial state for the diff). */
  const initialKeysOf = (targetScopeId: string | undefined) =>
    new Set(
      targetScopeId
        ? (permissionIdByScopeCell.get(targetScopeId)?.keys() ?? [])
        : [],
    );

  const singleScopeId = !isBulk ? scopeList[0]?.scopeId : undefined;

  // Single-scope edit: the one scope's currently-granted cells, used to
  // pre-check the grid via each cell's Form.Item `initialValue`.
  const singleInitialKeys = initialKeysOf(singleScopeId);
  // Every grid cell is a boolean field on this form, keyed by its cell key.
  // Single-scope: every rendered cell registers at mount, pre-checked with
  // the scope's granted state. Bulk: only cells switched into edit mode
  // register (`BAIBulkEditFormItem`); 'Keep as is' cells stay `undefined`.
  const formRef =
    useRef<FormInstance<Record<string, boolean | undefined>>>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [failedRequests, setFailedRequests] = useState<
    FailedPermissionRequest[]
  >([]);
  // How many of the last save's requests the backend accepted — shown next to
  // the partial-failure notice as "(Success: n, Failed: m)".
  const [succeededRequestCount, setSucceededRequestCount] = useState(0);

  const operationLabel = (operation: string) =>
    t(`rbac.operations.${operation}`, { defaultValue: operation });

  // Column header for a `GRANT_*` operation. The Delegate group header already
  // says "delegate", so the column shows only the delegated base operation
  // (GRANT_READ → "Read"); GRANT_ALL has no base operation and shows "All".
  const delegateOperationColumnLabel = (operation: string) => {
    const baseOperation = operation.replace(/^GRANT_/, '');
    return baseOperation === 'ALL'
      ? t('general.All')
      : operationLabel(baseOperation);
  };

  const scopeLabelOf = (scope: EditingScope | undefined, fallback: string) =>
    scope?.scopeName || scope?.scopeId || fallback;

  // A changed cell value is a fresh attempt, no longer the one the server
  // rejected — drop the cell's failed mark. `BAICheckbox` only paints the
  // error status; clearing it is this owner's call.
  const clearCellError = (cellKey: string) => {
    formRef.current?.setFields([{ name: cellKey, errors: [] }]);
  };

  const handleSave = async () => {
    // Cells the grid defines: single-scope registers every rendered cell as
    // a boolean; bulk registers only the cells switched into edit mode
    // ('Keep as is' cells stay `undefined` and are skipped).
    const cellValues: Record<string, boolean | undefined> =
      formRef.current?.getFieldsValue(true) ?? {};
    const modifiedCells = new Map<string, BulkCellState>();
    Object.entries(cellValues).forEach(([key, value]) => {
      if (value === true) {
        modifiedCells.set(key, 'checked');
      } else if (value === false) {
        modifiedCells.set(key, 'unchecked');
      }
    });

    // Per-target reconciliation: the grid cells apply to every selected
    // scope's own initial state — already-satisfied cells produce no request,
    // and cells absent from the form ('Keep as is', or grants the grid does
    // not render) keep each scope's existing value.
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
      const scopeInitial = initialKeysOf(scope.scopeId);
      const diff: PermissionCellDiff = applyBulkPermissionCells(
        scopeInitial,
        modifiedCells,
      );
      diff.toCreate.forEach((key) => createEntries.push({ scope, key }));
      // toDelete ⊆ the scope's initial keys, which are exactly the recorded
      // permission ids' keys, so the lookup cannot miss.
      diff.toDelete.forEach((key) => {
        const permissionId = permissionIdByScopeCell
          .get(scope.scopeId)
          ?.get(key);
        if (permissionId) {
          deleteEntries.push({ scope, key, permissionId });
        }
      });
    });

    // Dirty tracking: nothing changed anywhere → tell the user and close
    // without any request (FR-6). Report success (→ parent refetch) only
    // when an earlier partially-failed save already applied changes, same
    // as the cancel handler — a pristine no-op must not trigger a refetch.
    if (createEntries.length === 0 && deleteEntries.length === 0) {
      message.info(t('rbac.NoChangesMade'));
      onRequestClose(appliedCellOverrides.size > 0);
      return;
    }

    const createInputs: CreatePermissionInput[] = createEntries.map(
      ({ scope, key }) => {
        const [entityType, permission] = key.split(CELL_KEY_SEPARATOR);
        if (isSingleScopeRole) {
          return {
            roleId,
            entityType,
            permission: permission as PermissionBit,
          };
        }
        // The 26.9 supergraph types `permission` as required and the scope
        // as an `RBACElementType`; the cast goes with 26.8 support (ADR 0006).
        return {
          roleId,
          scopeType,
          scopeId: scope.scopeId,
          entityType,
          operation: permission,
        } as CreatePermissionInput;
      },
    );
    const deleteIds = deleteEntries.map((entry) => entry.permissionId);

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

      if (addResult.status === 'fulfilled') {
        const addPayload = addResult.value?.adminBulkAddRolePermissions;
        // Successfully-created rows carry their new permission id — record it
        // so a later uncheck of the same cell can delete it without a refetch.
        addPayload?.items.forEach((item) => {
          const granted = item.permission ?? item.operation;
          const itemScopeId = item.scopeId ?? roleScopeId;
          if (!granted || !itemScopeId) return;
          recordApplied(
            itemScopeId,
            makeCellKey(item.entityType, granted),
            toLocalId(item.id),
          );
        });
        addPayload?.failed.forEach((failure) => {
          logger.error('Failed to add permission', failure.message);
          const failureScopeId = failure.scopeId ?? roleScopeId ?? '';
          const cellKey = makeCellKey(
            failure.entityType,
            failure.permission ?? failure.operation ?? '',
          );
          failures.push({
            key: `grant-${failureScopeId}-${cellKey}`,
            scopeLabel: scopeLabelOf(
              scopeList.find((scope) => scope.scopeId === failureScopeId),
              failureScopeId,
            ),
            cellKey,
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
            cellKey: key,
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
          const entry = deleteEntries.find(
            (candidate) =>
              candidate.permissionId === String(failure.permissionId),
          );
          failures.push({
            key: `revoke-${failure.permissionId}`,
            scopeLabel: entry
              ? scopeLabelOf(entry.scope, entry.scope.scopeId)
              : String(failure.permissionId),
            cellKey: entry?.key,
            message: failure.message,
          });
        });
      } else {
        logger.error('Failed to remove permissions', removeResult.reason);
        deleteEntries.forEach(({ scope, key }) => {
          failures.push({
            key: `revoke-${scope.scopeId}-${key}`,
            scopeLabel: scopeLabelOf(scope, scope.scopeId),
            cellKey: key,
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
          // Copy-on-write per scope: untouched scopes keep their (readonly)
          // cell maps; updated scopes get a merged copy, new cells last so
          // they win per cell key.
          const next = new Map(previous);
          appliedUpdates.forEach((cells, updatedScopeId) => {
            next.set(
              updatedScopeId,
              new Map([...(previous.get(updatedScopeId) ?? []), ...cells]),
            );
          });
          return next;
        });
      }
      // Immediate failure notice as a toast on top of the detail modal — the
      // modal carries the per-request table, the message the at-a-glance cue.
      message.error(t('rbac.PermissionsPartialFailureDescription'));
      // Every request is either a failure row or accepted by the backend.
      setSucceededRequestCount(
        createEntries.length + deleteEntries.length - failures.length,
      );
      setFailedRequests(failures);
      // An empty-string field error flags the failed cells (= field names)
      // with error status without printing a message under the cell — an
      // empty explain row has no height and the cell items keep
      // `marginBottom: 0`, so the grid layout is untouched; the messages
      // live in the error modal table. Set over every form field so cells
      // that succeeded on a retry drop their previous mark.
      const failedCellKeys = new Set(
        _.compact(failures.map((failure) => failure.cellKey)),
      );
      formRef.current?.setFields(
        Object.keys(cellValues).map((name) => ({
          name,
          errors: failedCellKeys.has(name) ? [''] : [],
        })),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Every column renders a cell; combinations absent from the permission
  // matrix show a '-' with a "not assignable" tooltip so the grid shape stays
  // identical across entities. Bulk mode renders each cell as a
  // `BAIBulkEditFormItem`: 'Keep as is' until clicked, then an editable
  // checkbox that starts checked.
  const renderPermissionCell = (
    entity: (typeof entities)[number],
    permission: string,
  ) => {
    if (!entity.grantable.has(permission)) {
      return (
        <Tooltip content={t('rbac.PermissionNotAssignable')}>
          <Text color="secondary" style={{ padding: '0 8px' }}>
            -
          </Text>
        </Tooltip>
      );
    }
    const key = makeCellKey(entity.entityType, permission);
    if (isBulk) {
      return (
        <BAIBulkEditFormItem
          name={key}
          valuePropName="checked"
          // Applies when the field registers, i.e. the moment the cell is
          // switched into edit mode — the checkbox starts checked.
          initialValue={true}
        >
          <BAICheckbox onChange={() => clearCellError(key)} />
        </BAIBulkEditFormItem>
      );
    }
    return (
      <Form.Item
        name={key}
        valuePropName="checked"
        // Pre-checked with the scope's currently-granted state.
        initialValue={singleInitialKeys.has(key)}
        style={{ marginBottom: 0 }}
      >
        <BAICheckbox onChange={() => clearCellError(key)} />
      </Form.Item>
    );
  };

  const permissionColumns = (
    operations: ReadonlyArray<string>,
    columnTitle: (operation: string) => string,
  ) =>
    operations.map((operation) => ({
      key: operation,
      title: columnTitle(operation),
      align: 'center' as const,
      // Bulk cells host the 'Keep as is' placeholder input, which needs a
      // stable column width (checkbox-only cells size themselves).
      width: isBulk ? 120 : undefined,
      render: (_value: unknown, entity: (typeof entities)[number]) =>
        renderPermissionCell(entity, operation),
    }));
  const bitColumns = permissionColumns(PERMISSION_BITS, operationLabel);
  const columns: BAIColumnsType<(typeof entities)[number]> = [
    {
      key: 'entityType',
      title: t('rbac.PermissionType'),
      fixed: 'left',
      render: (_value, entity) => (
        <Text>{rbacTypeLabel(entity.entityType)}</Text>
      ),
    },
    // The Direct / Delegate group headers only earn their row when a delegate
    // column exists; otherwise the five bits sit flat.
    ...(hasDelegateOperations
      ? [
          {
            key: 'direct',
            title: t('rbac.operationGroups.Direct'),
            children: bitColumns,
          },
          {
            key: 'delegate',
            title: t('rbac.operationGroups.Delegate'),
            children: permissionColumns(
              DELEGATE_OPERATIONS,
              delegateOperationColumnLabel,
            ),
          },
        ]
      : bitColumns),
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
            <Text
              type="supporting"
              weight="normal"
              maxLines={1}
              hasTruncateTooltip
              style={{ maxWidth: '100%' }}
            >
              {displayName}
            </Text>
          )}
        </BAIFlex>
      }
      okText={t('button.Save')}
      onOk={handleSave}
      confirmLoading={isSaving}
      // After a partial failure some changes did reach the backend, so even a
      // cancel must report success=true — the parent then refetches and the
      // tags reflect the true state.
      onCancel={() => onRequestClose(appliedCellOverrides.size > 0)}
      // Bulk cells render a 'Keep as is' placeholder input per column, so the
      // grid needs considerably more room than the checkbox-only grid.
      width={isBulk ? 900 : 760}
    >
      <Form ref={formRef} component={false}>
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
            <EmptyState title={t('rbac.NoPermissionsToDisplay')} />
          ) : (
            <BAITable
              scroll={{ x: 'max-content' }}
              rowKey="entityType"
              columns={columns}
              dataSource={entities}
              pagination={false}
              resizable={false}
              bordered
              size="small"
            />
          )}
        </BAIFlex>
      </Form>
      {/* Per-request errors of a partially-failed save (FR-3334). Rendered
          inside the edit modal so both live one open cycle under the parent's
          `BAIUnmountAfterClose`; the edit modal (and the user's edits) stays
          open behind it for a retry. */}
      <BAIBulkErrorModal<FailedPermissionRequest>
        open={!_.isEmpty(failedRequests)}
        alertDescription={
          <>
            {t('rbac.PermissionsPartialFailureDescription')}{' '}
            <Text type="supporting">
              {t('rbac.PermissionsPartialFailureCounts', {
                succeeded: succeededRequestCount,
                failed: failedRequests.length,
              })}
            </Text>
          </>
        }
        dataSource={failedRequests}
        onRequestClose={() => setFailedRequests([])}
        columns={[
          {
            key: 'scope',
            title: t('rbac.ScopeId'),
            dataIndex: 'scopeLabel',
            render: (scopeLabel: string) => (
              <BAIDoubleToken
                values={[
                  { label: scopeTypeLabel, color: 'blue' },
                  { label: scopeLabel, color: 'default' },
                ]}
              />
            ),
          },
          {
            key: 'permission',
            title: t('rbac.Permission'),
            dataIndex: 'cellKey',
            render: (cellKey: FailedPermissionRequest['cellKey']) => {
              if (!cellKey) {
                return '-';
              }
              const [entityType, permission] =
                cellKey.split(CELL_KEY_SEPARATOR);
              return (
                <BAIDoubleToken
                  values={[
                    { label: rbacTypeLabel(entityType), color: 'blue' },
                    { label: operationLabel(permission), color: 'default' },
                  ]}
                />
              );
            },
          },
          {
            key: 'message',
            title: t('rbac.ErrorMessage'),
            dataIndex: 'message',
          },
        ]}
      />
    </BAIModal>
  );
};

export default RoleScopePermissionEditModal;
