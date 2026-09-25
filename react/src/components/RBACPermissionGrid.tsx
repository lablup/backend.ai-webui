/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RBACPermissionGridMatrixQuery } from '../__generated__/RBACPermissionGridMatrixQuery.graphql';
import { App } from '../app-shim';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import './RBACPermissionGrid.css';
import { Button } from '@lablup/ui-common/Button';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { Text } from '@lablup/ui-common/Text';
import { TextInput } from '@lablup/ui-common/TextInput';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIButton,
  BAICheckbox,
  type BAIColumnsType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIListAlert,
  BAITable,
} from 'backend.ai-ui';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type RBACPermissionBit =
  'CREATE' | 'READ' | 'UPDATE' | 'SOFT_DELETE' | 'HARD_DELETE';

/** The five permission bits, in column order. */
const PERMISSION_BITS: ReadonlyArray<RBACPermissionBit> = [
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
  bits: ReadonlyArray<RBACPermissionBit>;
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

/** One granted permission row; `id` is the row's local id. */
export interface RBACPermissionGrant {
  id: string;
  entityType: string;
  permission: string;
}

export interface RBACPermissionSaveFailure {
  entityType: string;
  bit: string;
  message: string;
}

export interface RBACPermissionChanges {
  toGrant: Array<{ entityType: string; bit: RBACPermissionBit }>;
  /** `id` is the granted row to delete. */
  toRevoke: Array<{ entityType: string; bit: RBACPermissionBit; id: string }>;
}

interface EntityRow {
  entityType: string;
  /** The bits the permission matrix lets this entity take. */
  grantable: ReadonlySet<string>;
  /** Granted bit → permission row id. */
  granted: ReadonlyMap<string, string>;
}

/** Checkbox overrides per entity type and bit; absent means "as granted". */
type Draft = Record<string, Partial<Record<RBACPermissionBit, boolean>>>;

export interface RBACPermissionGridProps {
  scopeType: string;
  /** Rendered before the permission type filter (the scope's name, …). */
  toolbarStart?: React.ReactNode;
  grants: ReadonlyArray<RBACPermissionGrant>;
  /** Changes whenever `grants` is re-read; retires the draft cells it confirms. */
  grantsVersion: unknown;
  loading?: boolean;
  fetchKey: string;
  /** Shows the granted bits as tokens instead of checkboxes. */
  readOnly?: boolean;
  /** Re-reads `grants`; called with no argument after a save. */
  onRefresh: (fetchKey?: string) => void;
  /** Ships the pending changes and resolves with the cells the backend rejected. */
  onSave: (
    changes: RBACPermissionChanges,
  ) => Promise<RBACPermissionSaveFailure[]>;
}

/**
 * One row per permission type of a scope and one checkbox column per
 * permission bit, edited in place. Every toggled cell is a pending change
 * until the floating save bar hands them all to `onSave`. Shared by the role
 * and the role preset drawers.
 */
const RBACPermissionGrid: React.FC<RBACPermissionGridProps> = ({
  scopeType,
  toolbarStart,
  grants,
  grantsVersion,
  loading,
  fetchKey,
  readOnly,
  onRefresh,
  onSave,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  const { rbacPermissionMatrix } =
    useLazyLoadQuery<RBACPermissionGridMatrixQuery>(
      graphql`
        query RBACPermissionGridMatrixQuery {
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

  const grantedByEntity = new Map<string, Map<string, string>>();
  grants.forEach((grant) => {
    let granted = grantedByEntity.get(grant.entityType);
    if (!granted) {
      granted = new Map<string, string>();
      grantedByEntity.set(grant.entityType, granted);
    }
    granted.set(grant.permission, grant.id);
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

  // A re-read of the grants (after a save, or the refresh button) retires
  // every override the backend now reports, so a partially failed save leaves
  // only the rejected cells pending.
  const [draftState, setDraftState] = useState<{
    version: unknown;
    draft: Draft;
  }>({ version: grantsVersion, draft: {} });
  const [failures, setFailures] = useState<RBACPermissionSaveFailure[]>([]);
  let draft = draftState.draft;
  if (draftState.version !== grantsVersion) {
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
    setDraftState({ version: grantsVersion, draft });
  }

  const isChecked = (row: EntityRow, bit: RBACPermissionBit) =>
    draft[row.entityType]?.[bit] ?? row.granted.has(bit);
  const setChecked = (
    row: EntityRow,
    bit: RBACPermissionBit,
    checked: boolean,
  ) =>
    setDraftState((previous) => ({
      ...previous,
      draft: {
        ...previous.draft,
        [row.entityType]: { ...previous.draft[row.entityType], [bit]: checked },
      },
    }));

  const changes = rows.flatMap((row) =>
    PERMISSION_BITS.filter(
      (bit) =>
        row.grantable.has(bit) && isChecked(row, bit) !== row.granted.has(bit),
    ).map((bit) => ({ row, bit, isRevoke: row.granted.has(bit) })),
  );
  const changedEntityTypes = new Set(
    changes.map((change) => change.row.entityType),
  );

  const save = async () => {
    const nextFailures = await onSave({
      toGrant: changes
        .filter((change) => !change.isRevoke)
        .map(({ row, bit }) => ({ entityType: row.entityType, bit })),
      toRevoke: changes
        .filter((change) => change.isRevoke)
        .map(({ row, bit }) => ({
          entityType: row.entityType,
          bit,
          id: row.granted.get(bit) as string,
        })),
    });
    setFailures(nextFailures);
    onRefresh();
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
  const renderBitCheckbox = (row: EntityRow, bit: RBACPermissionBit) => {
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
    render: (_value: unknown, row: EntityRow) => {
      if (readOnly) {
        const grantedBits = group.bits.filter((bit) => row.granted.has(bit));
        return grantedBits.length > 0 ? (
          <BAIFlex gap="xxs" align="center" wrap="wrap">
            {grantedBits.map((bit) => (
              <Token key={bit} color="default" label={bitLabel(bit)} />
            ))}
          </BAIFlex>
        ) : (
          '-'
        );
      }
      return (
        <BAIFlex gap="md" align="center" wrap="nowrap">
          {group.bits.map((bit) => renderBitCheckbox(row, bit))}
        </BAIFlex>
      );
    },
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
          {toolbarStart}
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
          onChange={onRefresh}
          loading={loading}
        />
      </BAIFlex>
      <BAITable<EntityRow>
        rowKey="entityType"
        columns={columns}
        dataSource={visibleRows}
        pagination={false}
        size="small"
        loading={loading}
        onRow={(row) => ({
          className: changedEntityTypes.has(row.entityType)
            ? 'rbac-permission-grid__row--changed'
            : undefined,
        })}
      />
      {!readOnly && changes.length > 0 && (
        // Sticks to the bottom of the drawer's scroll box. Inline because
        // BAIFlex's own inline `position`/`padding` beat CSS; `bottom` equals
        // the drawer body's bottom padding.
        <BAIFlex
          className="rbac-permission-grid__save-bar"
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

export default RBACPermissionGrid;
