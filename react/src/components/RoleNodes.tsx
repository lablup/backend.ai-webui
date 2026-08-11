/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RoleNodesFragment$data,
  RoleNodesFragment$key,
} from '../__generated__/RoleNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIColumnType,
  BAIDoubleTag,
  BAIFlex,
  BAIId,
  BAITableAstryx,
  BAITableProps,
  badgeVariantForStatus,
  badgeVariantForTagColor,
  filterOutEmpty,
  useToggle,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { Settings } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type RoleNodeInList = NonNullable<RoleNodesFragment$data[number]>;

const availableRoleSorterKeys = ['name', 'created_at', 'updated_at'] as const;

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
}

const RoleNodes: React.FC<RoleNodesProps> = ({
  rolesFrgmt,
  customizeColumns,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // Auto-assign is only supported on managers >= 26.4.4.
  const supportsAutoAssign = baiClient.supports('role-auto-assign');
  const [hiddenColumnKeys, setHiddenColumnKeys] =
    useHiddenColumnKeysSetting('RoleList');
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();

  const roles = useFragment(
    graphql`
      fragment RoleNodesFragment on Role @relay(plural: true) {
        id @required(action: NONE)
        name @required(action: NONE)
        description
        source
        status
        autoAssign @since(version: "26.4.4")
        createdAt
        updatedAt
        scopes(first: 3) {
          count
          edges {
            node {
              scopeType
              scopeId
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
              }
            }
          }
        }
      }
    `,
    rolesFrgmt,
  );

  const columns: BAIColumnType<RoleNodeInList>[] = filterOutEmpty([
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
      render: (_, record: RoleNodeInList) => {
        const scopeNodes =
          record.scopes?.edges?.map((edge) => edge?.node).filter(Boolean) ?? [];
        const totalCount = record.scopes?.count ?? 0;
        if (scopeNodes.length === 0) return '-';
        const first = scopeNodes[0];
        const scopeTypeLabel = t(`rbac.types.${first?.scopeType}`, {
          defaultValue: first?.scopeType,
        });
        const scopeName =
          first?.scope?.basicInfo?.projectName ??
          first?.scope?.basicInfo?.domainName ??
          first?.scope?.basicInfo?.userEmail ??
          first?.scopeId;
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIDoubleTag
              values={[
                { label: scopeTypeLabel, color: 'blue' },
                { label: scopeName, color: 'default' },
              ]}
            />
            {totalCount > 1 && (
              <Badge
                variant={badgeVariantForTagColor('default')}
                label={`+${totalCount - 1}`}
              />
            )}
          </BAIFlex>
        );
      },
    },
    {
      key: 'scopeId',
      title: t('rbac.ScopeRawId'),
      render: (_, record: RoleNodeInList) => {
        const scopeNodes =
          record.scopes?.edges?.map((edge) => edge?.node).filter(Boolean) ?? [];
        const totalCount = record.scopes?.count ?? 0;
        if (scopeNodes.length === 0) return '-';
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIId uuid={scopeNodes[0]?.scopeId} />
            {totalCount > 1 && (
              <Badge
                variant={badgeVariantForTagColor('default')}
                label={`+${totalCount - 1}`}
              />
            )}
          </BAIFlex>
        );
      },
    },
    {
      key: 'source',
      title: t('rbac.Source'),
      dataIndex: 'source',
      // BUI `BAITag` DISSOLVES into Astryx `Badge` at the call site
      // (MAPPING §8); the variant comes from the repo-global ticket-13 lookup.
      render: (source: string) => {
        return (
          <Badge
            variant={badgeVariantForStatus('role', source)}
            label={source === 'SYSTEM' ? t('rbac.System') : t('rbac.Custom')}
          />
        );
      },
    },
    supportsAutoAssign && {
      key: 'autoAssign',
      title: t('rbac.AutoAssign'),
      dataIndex: 'autoAssign',
      render: (autoAssign: boolean) => (
        <Badge
          variant={badgeVariantForTagColor(autoAssign ? 'green' : 'default')}
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
  ]);

  const allColumns = customizeColumns ? customizeColumns(columns) : columns;
  const displayedColumns = _.filter(
    allColumns,
    (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
  );

  const { pagination, ...restTableProps } = tableProps;

  return (
    <>
      <BAITableAstryx<RoleNodeInList>
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
