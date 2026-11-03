/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RoleNodesFragment$data,
  RoleNodesFragment$key,
} from '../__generated__/RoleNodesFragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { resolveRBACScopeName } from '../helper/rbacScopeName';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import { Token } from '@lablup/ui-common/Token';
import {
  type BAIEntityLabel,
  BAIColumnType,
  BAIDoubleToken,
  BAIEntityLabelTargetCell,
  BAIFlex,
  BAIId,
  BAITable,
  BAITableProps,
  useIsLabelableEntityType,
  useToggle,
  tokenColorForTagColor,
  tokenColorForStatus,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RoleNodeInList = NonNullable<RoleNodesFragment$data[number]>;

// The camelCase spellings the columns' `dataIndex` already emits;
// `convertToOrderBy` snake-cases + uppercases them into RoleOrderField.
const availableRoleSorterKeys = ['name', 'createdAt', 'updatedAt'] as const;

export const availableRoleSorterValues = [
  ...availableRoleSorterKeys,
  ...availableRoleSorterKeys.map((key) => `-${key}` as const),
] as const;

interface RoleNodesProps extends Omit<
  BAITableProps<RoleNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  rolesFrgmt: RoleNodesFragment$key;
  customizeColumns?: (
    baseColumns: BAIColumnType<RoleNodeInList>[],
  ) => BAIColumnType<RoleNodeInList>[];
  onChangeOrder?: (
    order: (typeof availableRoleSorterValues)[number] | null,
  ) => void;
  /** Fired when a label token is clicked; the surface filters its list by it. */
  onLabelClick?: (label: BAIEntityLabel) => void;
}

const RoleNodes: React.FC<RoleNodesProps> = ({
  rolesFrgmt,
  customizeColumns,
  onChangeOrder,
  onLabelClick,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const isLabelable = useIsLabelableEntityType('role');
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('RoleList');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const roles = useFragment(
    graphql`
      fragment RoleNodesFragment on Role @relay(plural: true) {
        id @required(action: NONE)
        entityId
        name @required(action: NONE)
        description
        source
        status
        autoAssign
        createdAt
        updatedAt
        scopeType
        scopeId
        rolePresetId
        rolePreset {
          name
        }
        scope {
          ... on ProjectV2 {
            basicInfo {
              projectName: name
            }
          }
          ... on DomainV2 {
            basicInfo {
              domainName: name
            }
          }
          ... on UserV2 {
            basicInfo {
              userEmail: email
            }
          }
          ... on VFolder {
            metadata {
              name
            }
          }
          ... on SessionV2 {
            metadata {
              sessionName: name
            }
          }
          ... on ModelDeployment {
            metadata {
              name
            }
          }
          ... on ResourceGroup {
            name
          }
          ... on ContainerRegistryV2 {
            registryName
            project
          }
        }
      }
    `,
    rolesFrgmt,
  );

  const columns: BAIColumnType<RoleNodeInList>[] = [
    {
      key: 'name',
      title: t('rbac.RoleName'),
      dataIndex: 'name',
      sorter: true,
      fixed: 'left' as const,
    },
    {
      key: 'description',
      title: t('rbac.RoleDescription'),
      dataIndex: 'description',
      // MAPPING §3.4: `ellipsis` + a manual hover Tooltip collapses into
      // `maxLines` + `hasTruncateTooltip` — Astryx shows the tooltip only
      // when the text is actually clamped, which is what the antd pair was
      // approximating. The 200px cap moves to the cell wrapper.
      render: (description: string) => (
        <Text maxLines={1} hasTruncateTooltip style={{ maxWidth: 200 }}>
          {description ?? '-'}
        </Text>
      ),
    },
    {
      key: 'scope',
      title: t('rbac.ScopeType'),
      render: (_, { scopeType, scopeId, scope }: RoleNodeInList) => {
        if (!scopeType) return '-';
        const scopeTypeLabel = t(rbacTypeI18nKey(scopeType), {
          defaultValue: scopeType,
        });
        const scopeName =
          resolveRBACScopeName({ scopeType, scope }) ?? scopeId ?? '-';
        return (
          <BAIDoubleToken
            values={[
              { label: scopeTypeLabel, color: 'blue' },
              { label: scopeName, color: 'default' },
            ]}
          />
        );
      },
    },
    {
      key: 'scopeId',
      title: t('rbac.ScopeRawId'),
      render: (_, { scopeId }: RoleNodeInList) =>
        scopeId ? <BAIId uuid={scopeId} /> : '-',
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
      key: 'source',
      title: t('rbac.Source'),
      dataIndex: 'source',
      render: (source: string) => {
        return (
          <Token
            color={tokenColorForStatus('role', source)}
            label={source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          />
        );
      },
    },
    {
      key: 'rolePreset',
      title: t('rbac.RolePreset'),
      render: (_, record: RoleNodeInList) => {
        if (!record.rolePresetId) return '-';
        return (
          <BAIFlex gap="xxs" align="center" wrap="nowrap">
            {record.rolePreset?.name && <Text>{record.rolePreset.name}</Text>}
            <BAIFlex align="center" wrap="nowrap">
              <Text>(</Text>
              <BAIId uuid={record.rolePresetId} />
              <Text>)</Text>
            </BAIFlex>
          </BAIFlex>
        );
      },
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
    // Role carries no entityLabels field, so each row loads its own.
    ...(isLabelable
      ? [
          {
            key: 'labels',
            title: t('entityLabel.Labels'),
            render: (_value: unknown, record: RoleNodeInList) => (
              <BAIEntityLabelTargetCell
                entityType="role"
                entityId={record.entityId}
                name={record.name}
                onLabelClick={onLabelClick}
              />
            ),
          },
        ]
      : []),
  ];

  const allColumns = customizeColumns ? customizeColumns(columns) : columns;
  const displayedColumns = _.filter(
    allColumns,
    (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
  );

  const { pagination, ...restTableProps } = tableProps;

  return (
    <>
      <BAITable<RoleNodeInList>
        scroll={{ x: 'max-content' }}
        rowKey="id"
        dataSource={roles as RoleNodeInList[]}
        columns={displayedColumns}
        {...restTableProps}
        pagination={
          pagination
            ? {
                ...pagination,
                // MAPPING §3.3: icon-only, no children -> `IconButton`, whose
                // required `label` finally gives this control an accessible
                // name (antd allowed none).
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
            (order as (typeof availableRoleSorterValues)[number]) || null,
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

export default RoleNodes;
