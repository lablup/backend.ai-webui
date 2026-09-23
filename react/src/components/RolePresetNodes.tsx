/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RolePresetNodesFragment$data,
  RolePresetNodesFragment$key,
} from '../__generated__/RolePresetNodesFragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Token } from '@astryxdesign/core/Token';
import {
  BAIColumnType,
  BAITable,
  BAITableProps,
  tokenColorForTagColor,
  useToggle,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RolePresetNodeInList = NonNullable<
  RolePresetNodesFragment$data[number]
>;

// `convertToOrderBy` snake-cases + uppercases these into RolePresetOrderField.
const availableRolePresetSorterKeys = [
  'name',
  'scopeType',
  'createdAt',
  'updatedAt',
] as const;

export const availableRolePresetSorterValues = [
  ...availableRolePresetSorterKeys,
  ...availableRolePresetSorterKeys.map((key) => `-${key}` as const),
] as const;

interface RolePresetNodesProps extends Omit<
  BAITableProps<RolePresetNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  rolePresetsFrgmt: RolePresetNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<RolePresetNodeInList>[],
  ) => BAIColumnType<RolePresetNodeInList>[];
  onChangeOrder?: (
    order: (typeof availableRolePresetSorterValues)[number] | null,
  ) => void;
}

const RolePresetNodes: React.FC<RolePresetNodesProps> = ({
  rolePresetsFrgmt,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('RolePresetList');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const rolePresets = useFragment(
    graphql`
      fragment RolePresetNodesFragment on RolePreset @relay(plural: true) {
        id
        name
        scopeType
        autoAssign
        createdAt
        updatedAt
        permissionPresets {
          count
        }
      }
    `,
    rolePresetsFrgmt,
  );

  const columns: BAIColumnType<RolePresetNodeInList>[] = [
    {
      key: 'name',
      title: t('rbac.PresetName'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
    },
    {
      key: 'scopeType',
      title: t('rbac.ScopeType'),
      dataIndex: 'scopeType',
      sorter: true,
      render: (scopeType: string) => (
        <Token
          color={tokenColorForTagColor('blue')}
          label={t(rbacTypeI18nKey(scopeType), { defaultValue: scopeType })}
        />
      ),
    },
    {
      key: 'permissions',
      title: t('rbac.Permissions'),
      render: (_value, record: RolePresetNodeInList) =>
        record.permissionPresets?.count ?? '-',
    },
    {
      key: 'autoAssign',
      title: t('rbac.AutoAssign'),
      dataIndex: 'autoAssign',
      render: (autoAssign: boolean) => (
        <Token
          color={tokenColorForTagColor(autoAssign ? 'green' : 'default')}
          label={autoAssign ? t('general.Active') : t('general.Inactive')}
        />
      ),
    },
    {
      key: 'createdAt',
      title: t('general.CreatedAt'),
      dataIndex: 'createdAt',
      sorter: true,
      render: (createdAt: string) =>
        createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      key: 'updatedAt',
      title: t('general.UpdatedAt'),
      dataIndex: 'updatedAt',
      sorter: true,
      render: (updatedAt: string) =>
        updatedAt ? dayjs(updatedAt).format('YYYY-MM-DD HH:mm') : '-',
    },
  ];

  const allColumns = customizeColumns ? customizeColumns(columns) : columns;
  const displayedColumns = _.filter(
    allColumns,
    (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
  );

  const { pagination, ...restTableProps } = tableProps;

  return (
    <>
      <BAITable<RolePresetNodeInList>
        scroll={{ x: 'max-content' }}
        rowKey="id"
        dataSource={rolePresets as RolePresetNodeInList[]}
        columns={displayedColumns}
        {...restTableProps}
        pagination={
          pagination
            ? {
                ...pagination,
                extraContent: (
                  <IconButton
                    variant="ghost"
                    icon={<Settings size="1em" />}
                    label={t('table.SettingTable')}
                    onClick={() => toggleColumnSettingModal()}
                  />
                ),
              }
            : pagination
        }
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableRolePresetSorterValues)[number]) || null,
          );
        }}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                allColumns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={allColumns}
        hiddenColumnKeys={hiddenColumnKeys}
      />
    </>
  );
};

export default RolePresetNodes;
