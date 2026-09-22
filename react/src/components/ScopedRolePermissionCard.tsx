/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ScopedRolePermissionCardFragment$key } from '../__generated__/ScopedRolePermissionCardFragment.graphql';
import {
  type EntityFilter,
  ScopedRolePermissionCardQuery,
  ScopedRolePermissionCardQuery$data,
} from '../__generated__/ScopedRolePermissionCardQuery.graphql';
import { ScopedRolePermissionCard_rbacPermissionMatrixFragment$key } from '../__generated__/ScopedRolePermissionCard_rbacPermissionMatrixFragment.graphql';
import { rbacTypeI18nKey } from '../helper/rbacElementTypes';
import {
  computeRBACGrantState,
  type RBACGrantState,
} from '../helper/rbacGrantState';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import RoleScopePermissionEditModal from './RoleScopePermissionEditModal';
import { IconButton } from '@astryxdesign/core/IconButton';
import { Token } from '@astryxdesign/core/Token';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAICard,
  type BAIColumnsType,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIId,
  BAINameActionCell,
  BAISelectionLabel,
  BAITable,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  toLocalId,
  useFetchKey,
  tokenColorForStatus,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { SquarePenIcon } from 'lucide-react';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

/**
 * Upper bound of permission rows fetched per card. The tag state of every
 * visible scope row AND the edit modal's grid (via
 * `RoleScopePermissionEditModal_permissionsFragment`) are computed from this
 * set, so it must cover the role's grants for the scope type — in bulk mode
 * the modal reconciles every selected scope against it. The bound is far
 * above what a role can realistically hold (worst case = matrix cells per
 * scope × granted scopes of the type); if it were ever exceeded, tag colors
 * and the modal's initial checks for the overflow could be understated (never
 * overstated).
 */
const PERMISSION_FETCH_LIMIT = 500;

type AdminRole = NonNullable<ScopedRolePermissionCardQuery$data['adminRole']>;

/**
 * One scope row of the card's table: the role's one scope on managers
 * >= 26.9.0, one `scopes` edge node before. Both select the same name fields
 * on the resolved `scope` entity.
 */
type ScopeRow = NonNullable<AdminRole['scopes']>['edges'][number]['node'];

/**
 * Resolve a scope row's human-readable name from its resolved `scope`
 * entity, per scope type. Null-ish when the type is unknown or the entity
 * carries no name — callers fall back to the raw scope id.
 */
const resolveScopeName = (record: ScopeRow): string | null | undefined => {
  const scope = record.scope;
  if (!scope) return null;
  // 26.8 answers the enum spelling (`PROJECT`), 26.9 the lowercase name.
  switch (record.scopeType.toUpperCase()) {
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

export interface ScopedRolePermissionCardProps {
  roleNodeFrgmt: ScopedRolePermissionCardFragment$key;
  rbacPermissionMatrixFrgmt: ScopedRolePermissionCard_rbacPermissionMatrixFragment$key;
  /** The scope type this card covers, spelled as the manager answered it. */
  scopeType: string;
}

const ScopedRolePermissionCard: React.FC<ScopedRolePermissionCardProps> = ({
  roleNodeFrgmt,
  rbacPermissionMatrixFrgmt,
  scopeType,
}) => {
  'use memo';
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  // A manager >= 26.9.0 answers the role's one scope and every permission
  // follows it, so the scopes connection and the per-type permission filter
  // (an `RBACElementType` enum, which rejects the 26.9 lowercase names) are
  // not sent; `graphql-transformer.ts` drops the `@deprecatedSince` fields and
  // the variables only they use (ADR 0006).
  const isSingleScopeRole = baiClient.supports('rbac-single-scope-role');

  const role = useFragment(
    graphql`
      fragment ScopedRolePermissionCardFragment on Role {
        id
        ...RoleScopePermissionEditModalFragment
      }
    `,
    roleNodeFrgmt,
  );

  const rbacPermissionMatrix = useFragment(
    graphql`
      fragment ScopedRolePermissionCard_rbacPermissionMatrixFragment on ScopeEntityOperationCombination
      @relay(plural: true) {
        scopeType
        entities {
          entityType
          actions {
            requiredPermission
          }
        }
        ...RoleScopePermissionEditModal_rbacPermissionMatrixFragment
      }
    `,
    rbacPermissionMatrixFrgmt,
  );

  // This card's configurable entity × permission set — the tag columns and
  // the full-grant baseline the grant-state colors compare against.
  const entityMatrix = (
    rbacPermissionMatrix.find(
      (combination) =>
        combination.scopeType.toUpperCase() === scopeType.toUpperCase(),
    )?.entities ?? []
  )
    .filter((entity) => entity.actions.length > 0)
    .map((entity) => ({
      entityType: entity.entityType,
      operations: _.uniq(
        entity.actions.map((action) => action.requiredPermission as string),
      ),
    }));

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
  // Selected scope row nodes, straight from `rowSelection.onChange`.
  // `preserveSelectedRowKeys` keeps off-page selections in `rows`. Doubles as
  // the edit modal's target list when the modal is opened from the selection.
  const [selectedScopes, setSelectedScopes] = useState<ScopeRow[]>([]);
  // The single scope row being edited via its inline Edit action; `null`
  // while that path is closed. Kept apart from the selection so an inline
  // edit never disturbs it.
  const [inlineEditingScope, setInlineEditingScope] = useState<ScopeRow | null>(
    null,
  );
  // Whether the modal is open for the current row selection (bulk when 2+
  // scopes are selected). A successful selection-originated save clears the
  // selection; an inline edit leaves it untouched.
  const [isSelectionEditOpen, setIsSelectionEditOpen] = useState(false);

  // The modal's target scopes: the live selection when opened from it, the
  // inline row otherwise. The modal captures the list at mount and the mask
  // blocks selection changes while it is open.
  const editingScopes = isSelectionEditOpen
    ? selectedScopes
    : inlineEditingScope
      ? [inlineEditingScope]
      : [];

  const queryVariables: ScopedRolePermissionCardQuery['variables'] = {
    roleId: toLocalId(role.id),
    permissionLimit: PERMISSION_FETCH_LIMIT,
    ...(isSingleScopeRole
      ? {}
      : {
          scopeFilter: {
            ...scopeIdFilter,
            scopeType: { equals: scopeType },
          },
          scopeLimit: baiPaginationOption.limit,
          scopeOffset: baiPaginationOption.offset,
          // The role itself is implicit via the `adminRole.permissions`
          // connection.
          permissionFilter: {
            scopeType: { equals: scopeType },
          } as ScopedRolePermissionCardQuery['variables']['permissionFilter'],
        }),
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
          scopeType @since(version: "26.9.0a4")
          scopeId @since(version: "26.9.0a4")
          scope @since(version: "26.9.0a4") {
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
          scopes(
            filter: $scopeFilter
            limit: $scopeLimit
            offset: $scopeOffset
          ) @deprecatedSince(version: "26.9.0a4") {
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
                scopeId @deprecatedSince(version: "26.9.0a4")
                operation @deprecatedSince(version: "26.9.0a4")
                entityType
                permission @since(version: "26.9.0a4")
                ...RoleScopePermissionEditModal_permissionsFragment
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

  const adminRole = data.adminRole;

  // The role's one scope on managers >= 26.9.0; otherwise this card's scope
  // rows, server-filtered by scope type (and the scope-id search when set)
  // and server-paginated by limit/offset.
  const scopeRows: ScopeRow[] = adminRole?.scopeType
    ? [
        {
          scopeType: adminRole.scopeType,
          scopeId: adminRole.scopeId,
          scope: adminRole.scope,
        },
      ]
    : _.compact((adminRole?.scopes?.edges ?? []).map((edge) => edge?.node));
  const scopeCount = adminRole?.scopeType
    ? scopeRows.length
    : (adminRole?.scopes?.count ?? 0);

  // The role's permission rows for this scope type — tag state is computed
  // from them here, and the edit modal reads them via its fragment to pre-check
  // its grid, so both views always agree.
  const permissionNodes = _.compact(
    (adminRole?.permissions?.edges ?? []).map((edge) => edge?.node),
  );

  // Granted permissions indexed by `${scopeId}|${entityType}` for O(1) lookup
  // per row × entity when computing tag state. A manager >= 26.9.0 answers a
  // `permission` bit and no scope (every permission follows the role's one
  // scope); an older one answers an `operation` and the `scopeId`.
  const grantedByScopeEntity = new Map<string, Set<string>>();
  permissionNodes.forEach((node) => {
    const granted = node.permission ?? node.operation;
    const permissionScopeId = node.scopeId ?? adminRole?.scopeId;
    if (!granted || !permissionScopeId) return;
    const key = `${permissionScopeId}|${node.entityType}`;
    let operations = grantedByScopeEntity.get(key);
    if (!operations) {
      operations = new Set<string>();
      grantedByScopeEntity.set(key, operations);
    }
    operations.add(granted);
  });

  const stateLabel: Record<RBACGrantState, string> = {
    full: t('rbac.FullyAllowed'),
    partial: t('rbac.PartiallyAllowed'),
    none: t('rbac.NotAllowed'),
  };

  const columns: BAIColumnsType<ScopeRow> = [
    {
      key: 'name',
      title: t('rbac.Name'),
      width: 150,
      render: (_value, record) => {
        const scopeName = resolveScopeName(record);
        const displayName = scopeName || record.scopeId || '-';
        // The edit action opens the scope-level permission edit modal for
        // this single scope row.
        return (
          <BAINameActionCell
            title={displayName}
            // Edit is the row's only action, so keep it visible (not
            // hover-only) for discoverability.
            showActions="always"
            actions={[
              {
                key: 'edit',
                title: t('button.Edit'),
                icon: <SquarePenIcon />,
                onClick: () => setInlineEditingScope(record),
              },
            ]}
            style={{ maxWidth: 150 }}
          />
        );
      },
    },
    {
      key: 'scopeId',
      title: t('general.ID'),
      width: 100,
      render: (_value, record) => (
        <BAIId uuid={record.scopeId} style={{ maxWidth: 100 }} />
      ),
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
                <Tooltip
                  key={entity.entityType}
                  content={stateLabel[grantState]}
                >
                  <Token
                    color={tokenColorForStatus('grantState', grantState)}
                    label={t(rbacTypeI18nKey(entity.entityType), {
                      defaultValue: entity.entityType,
                    })}
                  />
                </Tooltip>
              );
            })}
          </BAIFlex>
        );
      },
    },
  ];

  // The role has no scope of this type — render no card at all. When a
  // filter is active, an empty result must keep the card (and its filter UI)
  // visible so the user can clear the filter.
  if (!scopeIdFilter && scopeCount === 0) {
    return null;
  }

  return (
    <BAICard title={t(rbacTypeI18nKey(scopeType), { defaultValue: scopeType })}>
      <BAIFlex direction="column" align="stretch" gap="sm">
        <BAIFlex
          align="start"
          justify={isSingleScopeRole ? 'end' : 'between'}
          gap="md"
          wrap="wrap"
        >
          {/* One scope per role on managers >= 26.9.0: nothing to search or
              bulk-select. */}
          {!isSingleScopeRole && (
            <BAIGraphQLPropertyFilter<EntityFilter>
              style={{ flex: 1 }}
              value={scopeIdFilter}
              onChange={(value) => {
                setScopeIdFilter(value);
                // The filter narrows the result set — land back on page 1 so
                // the offset stays in range.
                setTablePaginationOption({ current: 1 });
                // Drop the selection so stale, now-hidden rows can't survive
                // a filter change and get bulk-edited unintentionally.
                setSelectedScopes([]);
              }}
              filterProperties={[
                {
                  key: 'scopeId',
                  propertyLabel: t('rbac.ScopeRawId'),
                  type: 'string',
                },
              ]}
            />
          )}
          <BAIFlex gap="xs" align="center">
            {selectedScopes.length > 0 && (
              <>
                <BAISelectionLabel
                  count={selectedScopes.length}
                  onClearSelection={() => setSelectedScopes([])}
                />
                {/* Icon-only: the row already hosts the filter. The glyph
                    takes the action accent, see
                    `packages/backend.ai-ui/src/styles/actionAccent.css`. */}
                <IconButton
                  className="bai-action-accent"
                  icon={<SquarePenIcon aria-hidden />}
                  label={t('rbac.EditScopePermissions')}
                  tooltip={t('rbac.EditScopePermissions')}
                  onClick={() => setIsSelectionEditOpen(true)}
                />
              </>
            )}
            <BAIFetchKeyButton
              value={fetchKey}
              onChange={updateFetchKey}
              loading={
                deferredFetchKey !== fetchKey ||
                deferredQueryVariables !== queryVariables
              }
            />
          </BAIFlex>
        </BAIFlex>
        <BAITable<ScopeRow>
          scroll={{ x: 'max-content' }}
          rowKey="scopeId"
          dataSource={scopeRows}
          columns={columns}
          loading={deferredQueryVariables !== queryVariables}
          size="small"
          rowSelection={
            isSingleScopeRole
              ? undefined
              : {
                  type: 'checkbox',
                  selectedRowKeys: selectedScopes.map((scope) => scope.scopeId),
                  onChange: (_keys, rows) => setSelectedScopes(_.compact(rows)),
                  // Keep selections made on other pages: antd caches their
                  // records and keeps handing them back through `onChange`'s
                  // `rows`.
                  preserveSelectedRowKeys: true,
                }
          }
          pagination={
            isSingleScopeRole
              ? false
              : {
                  pageSize: tablePaginationOption.pageSize,
                  current: tablePaginationOption.current,
                  total: scopeCount,
                  onChange: (current, pageSize) => {
                    setTablePaginationOption({ current, pageSize });
                  },
                }
          }
        />
      </BAIFlex>
      {/* Unmount per close so the modal's checked-state re-initializes from
          the currently-granted permissions on every open. */}
      <BAIUnmountAfterClose>
        <RoleScopePermissionEditModal
          open={editingScopes.length > 0}
          roleNodeFrgmt={role}
          rbacPermissionMatrixFrgmt={rbacPermissionMatrix}
          permissionsFrgmt={permissionNodes}
          scopeType={scopeType}
          scopes={editingScopes.map((scope) => ({
            scopeId: scope.scopeId,
            scopeName: resolveScopeName(scope),
          }))}
          onRequestClose={(success) => {
            const wasFromSelection = isSelectionEditOpen;
            setIsSelectionEditOpen(false);
            setInlineEditingScope(null);
            if (success) {
              // Recompute tag colors from the true post-save permission state.
              updateFetchKey();
              // A selection-originated edit consumed the selection; clear it
              // on success. Inline edits leave the selection untouched.
              if (wasFromSelection) {
                setSelectedScopes([]);
              }
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAICard>
  );
};

export default ScopedRolePermissionCard;
