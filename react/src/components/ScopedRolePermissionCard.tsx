/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ScopedRolePermissionCardFragment$key } from '../__generated__/ScopedRolePermissionCardFragment.graphql';
import {
  type EntityFilter,
  RBACElementType,
  ScopedRolePermissionCardQuery,
} from '../__generated__/ScopedRolePermissionCardQuery.graphql';
import {
  computeRBACGrantState,
  type RBACGrantState,
} from '../helper/rbacGrantState';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import { Tag, Tooltip } from 'antd';
import {
  BAICard,
  type BAIColumnsType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAINameActionCell,
  BAITable,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/**
 * Upper bound of permission rows fetched per card for tag computation. The tag
 * state of every visible scope row is computed from this set (filtered by
 * roleId + scopeType), so it must cover the role's grants for the scope type.
 * A role realistically holds far fewer than this; if a role ever exceeds it,
 * tag colors for the overflow could be understated (never overstated). Exact
 * paging is possible on 26.8.0 via `PermissionFilter.scopeId: { in: [...] }`
 * against the visible rows' scope ids, but needs a second data-dependent
 * fetch after the scopes resolve — deferred as a follow-up.
 */
const PERMISSION_FETCH_LIMIT = 100;

/**
 * A scope type's selectable entity types and, for each, the full set of
 * operations the permission matrix defines. Derived from `rbacPermissionMatrix`
 * by the parent tab and handed to each card.
 */
export interface ScopeEntityMatrixEntry {
  entityType: string;
  /** All operations (`requiredPermission`) the matrix lists for this entity. */
  operations: string[];
}

interface ScopeNameRecord {
  scopeType: string;
  scope?: {
    basicInfo?: {
      domainName?: string | null;
      projectName?: string | null;
      email?: string | null;
    } | null;
    vfolderName?: string | null;
    metadata?: {
      sessionName?: string | null;
      deploymentName?: string | null;
    } | null;
    resourceGroupName?: string | null;
    registryName?: string | null;
    project?: string | null;
  } | null;
}

const resolveScopeName = (
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

const GRANT_STATE_TAG_COLOR: Record<RBACGrantState, string | undefined> = {
  full: 'success',
  partial: 'warning',
  none: undefined,
};

export interface ScopedRolePermissionCardProps {
  roleNodeFrgmt: ScopedRolePermissionCardFragment$key;
  scopeType: RBACElementType;
  entityMatrix: ScopeEntityMatrixEntry[];
}

const ScopedRolePermissionCard: React.FC<ScopedRolePermissionCardProps> = ({
  roleNodeFrgmt,
  scopeType,
  entityMatrix,
}) => {
  'use memo';
  const { t } = useTranslation();

  const role = useFragment(
    graphql`
      fragment ScopedRolePermissionCardFragment on Role {
        id
      }
    `,
    roleNodeFrgmt,
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });
  // Scope-id filter built by BAIGraphQLPropertyFilter (server-side,
  // `EntityFilter.scopeId`, 26.8.0). The resolved scope *name* is not
  // searchable — `EntityFilter` exposes no name field.
  const [scopeIdFilter, setScopeIdFilter] = useState<
    EntityFilter | undefined
  >();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables: ScopedRolePermissionCardQuery['variables'] = {
    roleId: toLocalId(role.id),
    scopeFilter: {
      ...scopeIdFilter,
      scopeType: { equals: scopeType },
    } as ScopedRolePermissionCardQuery['variables']['scopeFilter'],
    scopeLimit: baiPaginationOption.limit,
    scopeOffset: baiPaginationOption.offset,
    // The role itself is implicit via the `adminRole.permissions` connection.
    permissionFilter: {
      scopeType: { equals: scopeType },
    } as ScopedRolePermissionCardQuery['variables']['permissionFilter'],
    permissionLimit: PERMISSION_FETCH_LIMIT,
  };

  // Defer the variables / fetchKey so a refresh / page change / search updates
  // the table inline (previous rows stay visible) instead of re-suspending the
  // card.
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<ScopedRolePermissionCardQuery>(
    graphql`
      query ScopedRolePermissionCardQuery(
        $roleId: UUID!
        $scopeFilter: EntityFilter
        $scopeLimit: Int
        $scopeOffset: Int
        $permissionFilter: PermissionFilter
        $permissionLimit: Int
      ) {
        adminRole(id: $roleId) {
          scopes(
            filter: $scopeFilter
            limit: $scopeLimit
            offset: $scopeOffset
          ) {
            count
            edges {
              node {
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
            }
          }
          permissions(filter: $permissionFilter, limit: $permissionLimit) {
            edges {
              node {
                scopeId
                entityType
                operation
              }
            }
          }
        }
      }
    `,
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
  );

  // This card's scope rows — server-filtered by scope type (and the scope-id
  // search when set) and server-paginated by limit/offset.
  const scopeRows = _.compact(
    (data.adminRole?.scopes?.edges ?? []).map((edge) => edge?.node),
  );

  // Granted operations indexed by `${scopeId}|${entityType}` for O(1) lookup
  // per row × entity when computing tag state.
  const grantedByScopeEntity = new Map<string, Set<string>>();
  data.adminRole?.permissions?.edges?.forEach((edge) => {
    const node = edge?.node;
    if (!node) return;
    const key = `${node.scopeId}|${node.entityType}`;
    let operations = grantedByScopeEntity.get(key);
    if (!operations) {
      operations = new Set<string>();
      grantedByScopeEntity.set(key, operations);
    }
    operations.add(node.operation);
  });

  const stateLabel: Record<RBACGrantState, string> = {
    full: t('rbac.FullyAllowed'),
    partial: t('rbac.PartiallyAllowed'),
    none: t('rbac.NotAllowed'),
  };

  const columns: BAIColumnsType<(typeof scopeRows)[number]> = [
    {
      key: 'name',
      title: t('rbac.Name'),
      render: (_value, record) => {
        const displayName = resolveScopeName(record) || record.scopeId || '-';
        // Name column is rendered via BAINameActionCell so the FR-6 edit
        // action (PR 2) can attach here without a structural change.
        return <BAINameActionCell title={displayName} />;
      },
    },
    {
      key: 'scopeId',
      title: t('general.ID'),
      render: (_value, record) => <BAIId uuid={record.scopeId} />,
    },
    {
      key: 'permissions',
      title: t('rbac.Permissions'),
      render: (_value, record) => {
        if (entityMatrix.length === 0) {
          return '-';
        }
        return (
          <BAIFlex gap="xxs" wrap="wrap">
            {entityMatrix.map((entity) => {
              const grantedOperations =
                grantedByScopeEntity.get(
                  `${record.scopeId}|${entity.entityType}`,
                ) ?? new Set<string>();
              const grantState = computeRBACGrantState(
                entity.operations,
                grantedOperations,
              );
              return (
                <Tooltip key={entity.entityType} title={stateLabel[grantState]}>
                  <Tag color={GRANT_STATE_TAG_COLOR[grantState]}>
                    {t(`rbac.types.${entity.entityType}`, {
                      defaultValue: entity.entityType,
                    })}
                  </Tag>
                </Tooltip>
              );
            })}
          </BAIFlex>
        );
      },
    },
  ];

  // The role has no scope of this type — render no card at all (FR-2). When a
  // filter is active, an empty result must keep the card (and its filter UI)
  // visible so the user can clear the filter.
  if (!scopeIdFilter && data.adminRole?.scopes?.count === 0) {
    return null;
  }

  return (
    <BAICard
      title={t(`rbac.types.${scopeType}`, { defaultValue: scopeType })}
      styles={{ body: { paddingTop: 0 } }}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex align="start" justify="between" gap="md" wrap="wrap">
          <BAIGraphQLPropertyFilter<EntityFilter>
            style={{ flex: 1 }}
            value={scopeIdFilter}
            onChange={(value) => {
              setScopeIdFilter(value);
              // The filter narrows the result set — land back on page 1 so the
              // offset stays in range.
              setTablePaginationOption({ current: 1 });
            }}
            filterProperties={[
              {
                key: 'scopeId',
                propertyLabel: t('rbac.ScopeRawId'),
                type: 'string',
              },
            ]}
          />
          <BAIFetchKeyButton
            value={fetchKey}
            onChange={updateFetchKey}
            loading={
              deferredFetchKey !== fetchKey ||
              deferredQueryVariables !== queryVariables
            }
          />
        </BAIFlex>
        <BAITable<(typeof scopeRows)[number]>
          rowKey={(record) => `${record.scopeType}|${record.scopeId}`}
          dataSource={scopeRows}
          columns={columns}
          loading={deferredQueryVariables !== queryVariables}
          size="small"
          scroll={{ x: 'max-content' }}
          pagination={{
            pageSize: tablePaginationOption.pageSize,
            current: tablePaginationOption.current,
            total: data.adminRole?.scopes?.count ?? 0,
            onChange: (current, pageSize) => {
              setTablePaginationOption({ current, pageSize });
            },
          }}
        />
      </BAIFlex>
    </BAICard>
  );
};

export default ScopedRolePermissionCard;
