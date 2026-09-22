/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RolePermissionSummaryTableFragment$key } from '../__generated__/RolePermissionSummaryTableFragment.graphql';
import {
  type PermissionBit,
  RolePermissionSummaryTableGrantMutation,
} from '../__generated__/RolePermissionSummaryTableGrantMutation.graphql';
import { RolePermissionSummaryTableMatrixQuery } from '../__generated__/RolePermissionSummaryTableMatrixQuery.graphql';
import { RolePermissionSummaryTableQuery } from '../__generated__/RolePermissionSummaryTableQuery.graphql';
import { RolePermissionSummaryTableRevokeMutation } from '../__generated__/RolePermissionSummaryTableRevokeMutation.graphql';
import { App } from '../app-shim';
import { reasonMessage } from '../helper/mutationError';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import {
  computeRBACGrantState,
  type RBACGrantState,
} from '../helper/rbacGrantState';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Token } from '@astryxdesign/core/Token';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIButton,
  BAICheckbox,
  type BAIColumnsType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIListAlert,
  BAITable,
  INITIAL_FETCH_KEY,
  toLocalId,
  tokenColorForStatus,
  useBAILogger,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Search } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/**
 * Upper bound of permission rows fetched for the role — far above one scope's
 * entity × bit grid, so the summary and the row editors never miss a grant.
 */
const PERMISSION_FETCH_LIMIT = 500;

/** The five `PermissionBit`s, in display order. */
const PERMISSION_BITS: ReadonlyArray<PermissionBit> = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

interface EntityRow {
  entityType: string;
  /** The bits the permission matrix lets this entity take. */
  grantable: ReadonlySet<string>;
  /** Granted bit → permission id, from the role's permission rows. */
  granted: ReadonlyMap<string, string>;
}

interface RolePermissionRowEditorProps {
  roleId: string;
  row: EntityRow;
  /** After a save reached the backend; `done` when every request succeeded. */
  onSaved: (done: boolean) => void;
  onCancel: () => void;
}

/**
 * The expanded row: one checkbox per permission bit, saved straight against
 * the role. Grants and revokes ship as the two bulk mutations; a request the
 * backend rejects stays listed above the checkboxes for a retry (FR-3334).
 */
const RolePermissionRowEditor: React.FC<RolePermissionRowEditorProps> = ({
  roleId,
  row,
  onSaved,
  onCancel,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

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

  // The intended state per bit, seeded from what the role grants now. It
  // outlives a partial-failure refetch so a retry re-submits only what is
  // still different.
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      PERMISSION_BITS.map((bit) => [bit, row.granted.has(bit)]),
    ),
  );
  const [failures, setFailures] = useState<
    Array<{ bit: string; message: string }>
  >([]);

  const bitLabel = (bit: string) =>
    t(`rbac.operations.${bit}`, { defaultValue: bit });

  const toGrant = PERMISSION_BITS.filter(
    (bit) => checked[bit] && !row.granted.has(bit),
  );
  const toRevoke = PERMISSION_BITS.filter(
    (bit) => !checked[bit] && row.granted.has(bit),
  );
  const isDirty = toGrant.length > 0 || toRevoke.length > 0;

  const save = async () => {
    const [grantResult, revokeResult] = await Promise.allSettled([
      toGrant.length > 0
        ? grantPermissions({
            input: {
              permissions: toGrant.map((permission) => ({
                roleId,
                entityType: row.entityType,
                permission,
              })),
            },
          })
        : Promise.resolve(null),
      toRevoke.length > 0
        ? revokePermissions({
            input: {
              permissionIds: toRevoke.map(
                (bit) => row.granted.get(bit) as string,
              ),
            },
          })
        : Promise.resolve(null),
    ]);

    const nextFailures: Array<{ bit: string; message: string }> = [];
    if (grantResult.status === 'fulfilled') {
      grantResult.value?.adminBulkAddRolePermissions?.failed.forEach(
        (failure) => {
          logger.error('Failed to grant permission', failure.message);
          nextFailures.push({
            bit: failure.permission ?? '',
            message: failure.message,
          });
        },
      );
    } else {
      logger.error('Failed to grant permissions', grantResult.reason);
      toGrant.forEach((bit) =>
        nextFailures.push({ bit, message: reasonMessage(grantResult.reason) }),
      );
    }
    if (revokeResult.status === 'fulfilled') {
      const failedById = new Map(
        (revokeResult.value?.adminBulkRemoveRolePermissions?.failed ?? []).map(
          (failure) => [String(failure.permissionId), failure.message],
        ),
      );
      toRevoke.forEach((bit) => {
        const failureMessage = failedById.get(String(row.granted.get(bit)));
        if (failureMessage !== undefined) {
          logger.error('Failed to revoke permission', failureMessage);
          nextFailures.push({ bit, message: failureMessage });
        }
      });
    } else {
      logger.error('Failed to revoke permissions', revokeResult.reason);
      toRevoke.forEach((bit) =>
        nextFailures.push({
          bit,
          message: reasonMessage(revokeResult.reason),
        }),
      );
    }

    setFailures(nextFailures);
    if (nextFailures.length === 0) {
      message.success(t('rbac.PermissionsSaved'));
      onSaved(true);
      return;
    }
    message.error(t('rbac.PermissionsPartialFailureDescription'));
    onSaved(false);
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      {failures.length > 0 && (
        <BAIListAlert
          type="error"
          showIcon
          title={t('rbac.PermissionsPartialFailureDescription')}
          items={failures.map((failure, index) => ({
            key: `${failure.bit}-${index}`,
            content: (
              <BAIFlex gap="xs" align="center" wrap="wrap">
                <Token color="default" label={bitLabel(failure.bit)} />
                <Text>{failure.message}</Text>
              </BAIFlex>
            ),
          }))}
        />
      )}
      <BAIFlex gap="lg" wrap="wrap" align="center">
        {PERMISSION_BITS.map((bit) => {
          const isGrantable = row.grantable.has(bit);
          const checkbox = (
            <BAICheckbox
              checked={checked[bit]}
              disabled={!isGrantable}
              onChange={(next) =>
                setChecked((previous) => ({ ...previous, [bit]: next }))
              }
            >
              {bitLabel(bit)}
            </BAICheckbox>
          );
          return isGrantable ? (
            <React.Fragment key={bit}>{checkbox}</React.Fragment>
          ) : (
            <Tooltip key={bit} content={t('rbac.PermissionNotAssignable')}>
              {checkbox}
            </Tooltip>
          );
        })}
      </BAIFlex>
      <BAIFlex gap="xs" justify="end">
        <Button label={t('button.Cancel')} onClick={onCancel} />
        <BAIButton type="primary" disabled={!isDirty} action={save}>
          {t('button.Save')}
        </BAIButton>
      </BAIFlex>
    </BAIFlex>
  );
};

export interface RolePermissionSummaryTableProps {
  roleNodeFrgmt: RolePermissionSummaryTableFragment$key;
}

/**
 * The Permissions tab of `RoleDetailDrawerV2` (managers >= 26.9.0a4, one
 * scope per role): one row per permission type of that scope, with the access
 * level and the granted bits, and an expandable editor per row. Its own query
 * and mutations select the 26.9 fields only; the fragment's `scopeType` carries
 * `@since` because it rides the role list query (ADR 0006).
 */
const RolePermissionSummaryTable: React.FC<RolePermissionSummaryTableProps> = ({
  roleNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();

  const role = useFragment(
    graphql`
      fragment RolePermissionSummaryTableFragment on Role {
        id
        scopeType @since(version: "26.9.0a4")
      }
    `,
    roleNodeFrgmt,
  );
  const scopeType = role.scopeType ?? '';

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<RolePermissionSummaryTableMatrixQuery>(
      graphql`
        query RolePermissionSummaryTableMatrixQuery {
          rbacPermissionMatrix {
            scopeType
            entities {
              entityType
              actions {
                requiredPermission
              }
            }
          }
        }
      `,
      {},
      { fetchPolicy: 'store-and-network' },
    );

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
    { roleId: toLocalId(role.id), permissionLimit: PERMISSION_FETCH_LIMIT },
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  const grantedByEntity = new Map<string, Map<string, string>>();
  _.compact(
    (data.adminRole?.permissions?.edges ?? []).map((edge) => edge?.node),
  ).forEach((node) => {
    let granted = grantedByEntity.get(node.entityType);
    if (!granted) {
      granted = new Map<string, string>();
      grantedByEntity.set(node.entityType, granted);
    }
    granted.set(node.permission, toLocalId(node.id));
  });

  const rbacTypeLabel = (type: string) =>
    t(rbacTypeI18nKey(type), { defaultValue: type });
  const bitLabel = (bit: string) =>
    t(`rbac.operations.${bit}`, { defaultValue: bit });

  const rows: EntityRow[] = (
    (rbacPermissionMatrix ?? []).find(
      (combination) =>
        combination.scopeType.toUpperCase() === scopeType.toUpperCase(),
    )?.entities ?? []
  )
    .filter((entity) => entity.actions.length > 0)
    .map((entity) => ({
      entityType: entity.entityType,
      grantable: new Set<string>(
        entity.actions.map((action) => action.requiredPermission),
      ),
      granted: grantedByEntity.get(entity.entityType) ?? new Map(),
    }));

  const [filterText, setFilterText] = useState('');
  const keyword = filterText.trim().toLowerCase();
  const visibleRows = keyword
    ? rows.filter(
        (row) =>
          row.entityType.toLowerCase().includes(keyword) ||
          rbacTypeLabel(row.entityType).toLowerCase().includes(keyword),
      )
    : rows;

  const [expandedKeys, setExpandedKeys] = useState<ReadonlyArray<React.Key>>(
    [],
  );
  const collapse = (entityType: string) =>
    setExpandedKeys((keys) => keys.filter((key) => key !== entityType));

  const stateLabel: Record<RBACGrantState, string> = {
    full: t('rbac.FullyAllowed'),
    partial: t('rbac.PartiallyAllowed'),
    none: t('rbac.NotAllowed'),
  };

  const columns: BAIColumnsType<EntityRow> = [
    {
      key: 'entityType',
      title: t('rbac.PermissionType'),
      width: 220,
      render: (_value, row) => <Text>{rbacTypeLabel(row.entityType)}</Text>,
    },
    {
      key: 'accessLevel',
      title: t('rbac.AccessLevel'),
      width: 160,
      render: (_value, row) => {
        const grantState = computeRBACGrantState(
          [...row.grantable],
          new Set(row.granted.keys()),
        );
        return (
          <Token
            color={tokenColorForStatus('grantState', grantState)}
            label={stateLabel[grantState]}
          />
        );
      },
    },
    {
      key: 'permissions',
      title: t('rbac.Permissions'),
      render: (_value, row) => {
        const grantedBits = PERMISSION_BITS.filter((bit) =>
          row.granted.has(bit),
        );
        return grantedBits.length > 0 ? (
          <Text>{grantedBits.map(bitLabel).join(', ')}</Text>
        ) : (
          <Text color="secondary">-</Text>
        );
      },
    },
  ];

  if (rows.length === 0) {
    return <EmptyState title={t('rbac.NoPermissionsToDisplay')} />;
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="center" gap="sm" wrap="wrap">
        <TextInput
          label={t('rbac.FilterByPermissionType')}
          isLabelHidden
          value={filterText}
          hasClear
          startIcon={Search}
          placeholder={t('rbac.FilterByPermissionType')}
          onChange={setFilterText}
          width={260}
        />
        <BAIFetchKeyButton
          value={fetchKey}
          onChange={updateFetchKey}
          loading={deferredFetchKey !== fetchKey}
        />
      </BAIFlex>
      <BAITable<EntityRow>
        rowKey="entityType"
        columns={columns}
        dataSource={visibleRows}
        pagination={false}
        size="small"
        loading={deferredFetchKey !== fetchKey}
        expandable={{
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: setExpandedKeys,
          expandedRowRender: (row) => (
            <RolePermissionRowEditor
              roleId={toLocalId(role.id)}
              row={row}
              onCancel={() => collapse(row.entityType)}
              onSaved={(done) => {
                // Re-read the grants so the summary row and the editor's
                // baseline reflect what the backend accepted.
                updateFetchKey();
                if (done) collapse(row.entityType);
              }}
            />
          ),
        }}
      />
    </BAIFlex>
  );
};

export default RolePermissionSummaryTable;
