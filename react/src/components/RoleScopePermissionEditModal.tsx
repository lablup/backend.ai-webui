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
import { reasonMessage } from '../helper/mutationError';
import {
  applyBulkPermissionCells,
  type BulkCellState,
  type PermissionCellDiff,
} from '../helper/rbacPermissionDiff';
import { App, Empty, Form, theme, Tooltip, Typography } from 'antd';
import {
  BAIBulkEditFormItem,
  BAIBulkErrorModal,
  BAICheckbox,
  type BAIColumnsType,
  BAIDoubleTag,
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
  /** Scope display name (falls back to the raw scope id). */
  scopeLabel: string;
  /**
   * Grid cell key of the failed permission; absent when a failed row cannot
   * be mapped back to a requested cell (e.g. an unknown permission id).
   */
  cellKey?: string;
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
  // Falls back to the raw RBAC type name when no i18n label is registered.
  const rbacTypeLabel = (type: string) =>
    t(`rbac.types.${type}`, { defaultValue: type });
  const scopeTypeLabel = scopeType ? rbacTypeLabel(scopeType) : '';
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

  // The role's currently-granted cells grouped by scope, each mapped to its
  // permission id (needed to delete on uncheck) — a scope's granted cell keys
  // are exactly this map's inner keys, and bulk save reconciles every selected
  // scope against its own initial state.
  const permissionIdByScopeCell = new Map<string, Map<string, string>>();
  permissions.forEach((permission) => {
    const cellKey = makeCellKey(permission.entityType, permission.operation);
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
  const [form] = Form.useForm<Record<string, boolean | undefined>>();
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
  const delegateOperationColumnLabel = (operation: OperationType) => {
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
    form.setFields([{ name: cellKey, errors: [] }]);
  };

  const handleSave = async () => {
    // No scope nodes → nothing to derive the scope type from, nothing to save.
    if (!scopeType) {
      return;
    }

    // Cells the grid defines: single-scope registers every rendered cell as
    // a boolean; bulk registers only the cells switched into edit mode
    // ('Keep as is' cells stay `undefined` and are skipped).
    const cellValues: Record<string, boolean | undefined> =
      form.getFieldsValue(true);
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
              scopeList.find((scope) => scope.scopeId === failure.scopeId),
              failure.scopeId,
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
      form.setFields(
        Object.keys(cellValues).map((name) => ({
          name,
          errors: failedCellKeys.has(name) ? [''] : [],
        })),
      );
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

  const operationGroups = [
    {
      key: 'direct',
      title: t('rbac.operationGroups.Direct'),
      operations: DIRECT_OPERATIONS,
      columnTitle: operationLabel,
    },
    {
      key: 'delegate',
      title: t('rbac.operationGroups.Delegate'),
      operations: DELEGATE_OPERATIONS,
      columnTitle: delegateOperationColumnLabel,
    },
  ];
  const columns: BAIColumnsType<(typeof entities)[number]> = [
    {
      key: 'entityType',
      title: t('rbac.PermissionType'),
      fixed: 'left',
      render: (_value, entity) => (
        <Typography.Text>{rbacTypeLabel(entity.entityType)}</Typography.Text>
      ),
    },
    ...operationGroups.map((group) => ({
      key: group.key,
      title: group.title,
      children: group.operations.map((operation) => ({
        key: operation,
        title: group.columnTitle(operation),
        align: 'center' as const,
        // Bulk cells host the 'Keep as is' placeholder input, which needs a
        // stable column width (checkbox-only cells size themselves).
        width: isBulk ? 120 : undefined,
        render: (_value: unknown, entity: (typeof entities)[number]) =>
          renderPermissionCell(entity, operation),
      })),
    })),
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
      onCancel={() => onRequestClose(appliedCellOverrides.size > 0)}
      // Bulk cells render a 'Keep as is' placeholder input per operation
      // column, so the grid needs considerably more room than the
      // checkbox-only single-scope grid. antd's own `max-width:
      // calc(100vw - 32px)` keeps it inside the viewport on small screens.
      width={isBulk ? 900 : 760}
    >
      <Form form={form} component={false}>
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
        open={!_.isEmpty(failedRequests)}
        alertDescription={
          <>
            {t('rbac.PermissionsPartialFailureDescription')}{' '}
            <Typography.Text
              style={{
                color: token.colorTextSecondary,
                fontSize: token.fontSizeSM,
              }}
            >
              {t('rbac.PermissionsPartialFailureCounts', {
                succeeded: succeededRequestCount,
                failed: failedRequests.length,
              })}
            </Typography.Text>
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
              <BAIDoubleTag
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
              const [entityType, operation] = cellKey.split(CELL_KEY_SEPARATOR);
              return (
                <BAIDoubleTag
                  values={[
                    { label: rbacTypeLabel(entityType), color: 'blue' },
                    { label: operationLabel(operation), color: 'default' },
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
