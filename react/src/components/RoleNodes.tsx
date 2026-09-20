/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  RoleNodesFragment$data,
  RoleNodesFragment$key,
} from '../__generated__/RoleNodesFragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import { useSuspendedBackendaiClient } from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import { Badge } from '@astryxdesign/core/Badge';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import {
  BAIColumnType,
  BAIDoubleToken,
  BAIFlex,
  BAIId,
  BAITable,
  BAITableProps,
  badgeVariantForTagColor,
  filterOutEmpty,
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
        scopes(first: 3) @deprecatedSince(version: "26.9.0") {
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
        scopeType @since(version: "26.9.0")
        scopeId @since(version: "26.9.0")
        scope @since(version: "26.9.0") {
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
    `,
    rolesFrgmt,
  );

  // Managers >= 26.9.0 answer the one scope a role belongs to; older ones
  // answer a scopes connection, of which the first is shown and the rest counted.
  const readRoleScope = (
    record: RoleNodeInList,
  ): {
    scopeType?: string | null;
    scopeId?: string | null;
    scope?: RoleNodeInList['scope'];
    extraCount: number;
  } => {
    if (record.scopeType) {
      return {
        scopeType: record.scopeType,
        scopeId: record.scopeId,
        scope: record.scope,
        extraCount: 0,
      };
    }
    const first = record.scopes?.edges?.[0]?.node;
    return {
      scopeType: first?.scopeType,
      scopeId: first?.scopeId,
      scope: first?.scope,
      extraCount: Math.max((record.scopes?.count ?? 0) - 1, 0),
    };
  };

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
        const { scopeType, scopeId, scope, extraCount } = readRoleScope(record);
        if (!scopeType) return '-';
        const scopeTypeLabel = t(rbacTypeI18nKey(scopeType), {
          defaultValue: scopeType,
        });
        const scopeName =
          scope?.basicInfo?.projectName ??
          scope?.basicInfo?.domainName ??
          scope?.basicInfo?.userEmail ??
          scopeId ??
          '-';
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIDoubleToken
              values={[
                { label: scopeTypeLabel, color: 'blue' },
                { label: scopeName, color: 'default' },
              ]}
            />
            {extraCount > 0 && (
              <Badge
                variant={badgeVariantForTagColor('default')}
                label={`+${extraCount}`}
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
        const { scopeId, extraCount } = readRoleScope(record);
        if (!scopeId) return '-';
        return (
          <BAIFlex gap="xxs" wrap="wrap" align="center">
            <BAIId uuid={scopeId} />
            {extraCount > 0 && (
              <Badge
                variant={badgeVariantForTagColor('default')}
                label={`+${extraCount}`}
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
      render: (source: string) => {
        return (
          <Token
            color={tokenColorForStatus('role', source)}
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
  ]);

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
