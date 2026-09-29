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
import './RolePermissionSummaryTable.css';
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
  BAIId,
  BAIListAlert,
  BAITable,
  BAIText,
  INITIAL_FETCH_KEY,
  toLocalId,
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
 * entity × bit grid, so the grid never misses a grant.
 */
const PERMISSION_FETCH_LIMIT = 500;

/** The five `PermissionBit`s, in column order. */
const PERMISSION_BITS: ReadonlyArray<PermissionBit> = [
  'CREATE',
  'READ',
  'UPDATE',
  'SOFT_DELETE',
  'HARD_DELETE',
];

const ENTITY_COLUMN_WIDTH = 300;

/** The bits grouped under the Read / Write column headers. */
const PERMISSION_GROUPS: ReadonlyArray<{
  key: string;
  titleKey: string;
  bits: ReadonlyArray<PermissionBit>;
  /** Fixed width in px; the Write group takes the rest of the row. */
  width?: number;
}> = [
  {
    key: 'read',
    titleKey: 'rbac.PermissionGroupRead',
    bits: ['READ'],
    width: 100,
  },
  {
    key: 'write',
    titleKey: 'rbac.PermissionGroupWrite',
    bits: ['CREATE', 'UPDATE', 'SOFT_DELETE', 'HARD_DELETE'],
  },
];

interface EntityRow {
  entityType: string;
  /** The bits the permission matrix lets this entity take. */
  grantable: ReadonlySet<string>;
  /** Granted bit → permission id, from the role's permission rows. */
  granted: ReadonlyMap<string, string>;
}

/** A cell whose checkbox differs from what the role grants now. */
interface PendingChange {
  row: EntityRow;
  bit: PermissionBit;
  /** `true` when the role grants the bit and the checkbox is off. */
  isRevoke: boolean;
}

interface SaveFailure {
  entityType: string;
  bit: string;
  message: string;
}

/** Checkbox overrides per entity type and bit; absent means "as granted". */
type Draft = Record<string, Partial<Record<PermissionBit, boolean>>>;

export interface RolePermissionSummaryTableProps {
  roleNodeFrgmt: RolePermissionSummaryTableFragment$key;
  /** The role's scope, resolved by the drawer content (it selects `scope`
   *  once for both; a second selection would ride the role list query). */
  scopeName: string | null;
  scopeId: string;
}

/**
 * The Permissions tab of `RoleDetailDrawerV2` (managers >= 26.9.0a4, one
 * scope per role): one row per permission type of that scope and one checkbox
 * column per permission bit, edited in place. Every toggled cell is a pending
 * change until the floating save bar ships them all as the two bulk
 * mutations. Its own query and mutations select the 26.9 fields only; the
 * fragment's `scopeType` carries `@since` because it rides the role list
 * query (ADR 0006).
 */
const RolePermissionSummaryTable: React.FC<RolePermissionSummaryTableProps> = ({
  roleNodeFrgmt,
  scopeName,
  scopeId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();

  const role = useFragment(
    graphql`
      fragment RolePermissionSummaryTableFragment on Role {
        id
        scopeType @since(version: "26.9.0a4")
      }
    `,
    roleNodeFrgmt,
  );
  const roleId = toLocalId(role.id);
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

  // The intended state of every toggled cell, kept with the fetch key it was
  // made against. A refetch (after a save, or the refresh button) retires
  // every override the backend now reports, so a partially failed save leaves
  // only the rejected cells pending.
  const [draftState, setDraftState] = useState<{
    fetchKey: typeof deferredFetchKey;
    draft: Draft;
  }>({ fetchKey: deferredFetchKey, draft: {} });
  const [failures, setFailures] = useState<SaveFailure[]>([]);
  let draft = draftState.draft;
  if (draftState.fetchKey !== deferredFetchKey) {
    draft = {};
    Object.entries(draftState.draft).forEach(([entityType, bits]) => {
      const granted = grantedByEntity.get(entityType);
      const kept = Object.fromEntries(
        Object.entries(bits).filter(
          ([bit, checked]) => checked !== (granted?.has(bit) ?? false),
        ),
      );
      if (Object.keys(kept).length > 0) draft[entityType] = kept;
    });
    setDraftState({ fetchKey: deferredFetchKey, draft });
  }

  const isChecked = (row: EntityRow, bit: PermissionBit) =>
    draft[row.entityType]?.[bit] ?? row.granted.has(bit);
  const setChecked = (row: EntityRow, bit: PermissionBit, checked: boolean) =>
    setDraftState((previous) => ({
      ...previous,
      draft: {
        ...previous.draft,
        [row.entityType]: { ...previous.draft[row.entityType], [bit]: checked },
      },
    }));

  const changes: PendingChange[] = rows.flatMap((row) =>
    PERMISSION_BITS.filter(
      (bit) =>
        row.grantable.has(bit) && isChecked(row, bit) !== row.granted.has(bit),
    ).map((bit) => ({ row, bit, isRevoke: row.granted.has(bit) })),
  );
  const changedEntityTypes = new Set(
    changes.map((change) => change.row.entityType),
  );

  const save = async () => {
    const toGrant = changes.filter((change) => !change.isRevoke);
    const toRevoke = changes.filter((change) => change.isRevoke);
    const [grantResult, revokeResult] = await Promise.allSettled([
      toGrant.length > 0
        ? grantPermissions({
            input: {
              permissions: toGrant.map(({ row, bit }) => ({
                roleId,
                entityType: row.entityType,
                permission: bit,
              })),
            },
          })
        : Promise.resolve(null),
      toRevoke.length > 0
        ? revokePermissions({
            input: {
              permissionIds: toRevoke.map(
                ({ row, bit }) => row.granted.get(bit) as string,
              ),
            },
          })
        : Promise.resolve(null),
    ]);

    const nextFailures: SaveFailure[] = [];
    if (grantResult.status === 'fulfilled') {
      grantResult.value?.adminBulkAddRolePermissions?.failed.forEach(
        (failure) => {
          logger.error('Failed to grant permission', failure.message);
          nextFailures.push({
            entityType: failure.entityType ?? '',
            bit: failure.permission ?? '',
            message: failure.message,
          });
        },
      );
    } else {
      logger.error('Failed to grant permissions', grantResult.reason);
      toGrant.forEach(({ row, bit }) =>
        nextFailures.push({
          entityType: row.entityType,
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
      toRevoke.forEach(({ row, bit }) => {
        const failureMessage = failedById.get(String(row.granted.get(bit)));
        if (failureMessage !== undefined) {
          logger.error('Failed to revoke permission', failureMessage);
          nextFailures.push({
            entityType: row.entityType,
            bit,
            message: failureMessage,
          });
        }
      });
    } else {
      logger.error('Failed to revoke permissions', revokeResult.reason);
      toRevoke.forEach(({ row, bit }) =>
        nextFailures.push({
          entityType: row.entityType,
          bit,
          message: reasonMessage(revokeResult.reason),
        }),
      );
    }

    setFailures(nextFailures);
    // Re-read the grants so the grid reflects what the backend accepted; the
    // draft effect then retires every override the refetch confirms.
    updateFetchKey();
    if (nextFailures.length === 0) {
      message.success(t('rbac.PermissionsSaved'));
      return;
    }
    message.error(t('rbac.PermissionsPartialFailureDescription'));
  };

  const discard = () => {
    setDraftState((previous) => ({ ...previous, draft: {} }));
    setFailures([]);
  };

  const [filterText, setFilterText] = useState('');
  const keyword = filterText.trim().toLowerCase();
  const visibleRows = keyword
    ? rows.filter(
        (row) =>
          row.entityType.toLowerCase().includes(keyword) ||
          rbacTypeLabel(row.entityType).toLowerCase().includes(keyword),
      )
    : rows;

  // The bit's name follows its checkbox ("☐ Update"), so a row reads on its own
  // once the header has scrolled away.
  const renderBitCheckbox = (row: EntityRow, bit: PermissionBit) => {
    const isGrantable = row.grantable.has(bit);
    const item = (
      <BAIFlex key={bit} gap="xxs" align="center" wrap="nowrap">
        <BAICheckbox
          label={bitLabel(bit)}
          isLabelHidden
          size="sm"
          checked={isChecked(row, bit)}
          disabled={!isGrantable}
          onChange={(next) => setChecked(row, bit, next)}
        />
        <Text color={isGrantable ? undefined : 'disabled'}>
          {bitLabel(bit)}
        </Text>
      </BAIFlex>
    );
    return isGrantable ? (
      item
    ) : (
      <Tooltip key={bit} content={t('rbac.PermissionNotEditable')}>
        {item}
      </Tooltip>
    );
  };

  const groupColumns = PERMISSION_GROUPS.map((group) => ({
    key: group.key,
    title: t(group.titleKey),
    width: group.width,
    render: (_value: unknown, row: EntityRow) => (
      <BAIFlex gap="md" align="center" wrap="nowrap">
        {group.bits.map((bit) => renderBitCheckbox(row, bit))}
      </BAIFlex>
    ),
  }));

  const columns: BAIColumnsType<EntityRow> = [
    {
      key: 'entityType',
      title: t('rbac.PermissionType'),
      // Pixel widths on every column but Write: proportional widths split the
      // row equally, which starves Write and wraps its checkboxes.
      width: ENTITY_COLUMN_WIDTH,
      render: (_value, row) => <Text>{rbacTypeLabel(row.entityType)}</Text>,
    },
    ...groupColumns,
  ];

  if (rows.length === 0) {
    return <EmptyState title={t('rbac.NoPermissionsToDisplay')} />;
  }

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="center" gap="sm" wrap="wrap">
        <BAIFlex gap="sm" align="center" wrap="wrap">
          <BAIFlex gap="xs" align="center">
            {scopeName ? (
              <BAIText strong>{scopeName}</BAIText>
            ) : (
              <BAIId uuid={scopeId} style={{ maxWidth: 160 }} />
            )}
            <Token color="blue" label={rbacTypeLabel(scopeType)} />
          </BAIFlex>
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
        </BAIFlex>
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
        onRow={(row) => ({
          className: changedEntityTypes.has(row.entityType)
            ? 'role-permission-summary-table__row--changed'
            : undefined,
        })}
      />
      {changes.length > 0 && (
        // Sticks to the bottom of the drawer's scroll box, so the save
        // controls stay in reach however far down the grid the user is.
        // Inline because BAIFlex's own inline `position`/`padding` beat CSS.
        // `bottom` equals the drawer body's bottom padding, so the bar does
        // not shift when the scroll reaches the end.
        <BAIFlex
          className="role-permission-summary-table__save-bar"
          direction="column"
          align="stretch"
          gap="sm"
          style={{
            position: 'sticky',
            bottom: 'var(--spacing-6)',
            padding: 'var(--spacing-3) var(--spacing-4)',
          }}
        >
          {failures.length > 0 && (
            <BAIListAlert
              type="error"
              showIcon
              title={t('rbac.PermissionsPartialFailureDescription')}
              maxHeight={160}
              items={failures.map((failure, index) => ({
                key: `${failure.entityType}-${failure.bit}-${index}`,
                content: (
                  <BAIFlex gap="xs" align="center" wrap="wrap">
                    <Token
                      color="default"
                      label={rbacTypeLabel(failure.entityType)}
                    />
                    <Token color="default" label={bitLabel(failure.bit)} />
                    <Text>{failure.message}</Text>
                  </BAIFlex>
                ),
              }))}
            />
          )}
          <BAIFlex justify="between" align="center" gap="md" wrap="wrap">
            <Text>
              {t('rbac.UnsavedPermissionChanges', { count: changes.length })}
            </Text>
            <BAIFlex gap="xs" align="center">
              <Button label={t('button.Cancel')} onClick={discard} />
              <BAIButton type="primary" action={save}>
                {t('button.Save')}
              </BAIButton>
            </BAIFlex>
          </BAIFlex>
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default RolePermissionSummaryTable;
