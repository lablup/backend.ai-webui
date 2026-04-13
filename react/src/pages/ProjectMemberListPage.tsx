/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectMemberListPageFallbackQuery } from '../__generated__/ProjectMemberListPageFallbackQuery.graphql';
import type { ProjectMemberListPageQuery } from '../__generated__/ProjectMemberListPageQuery.graphql';
import BAIErrorBoundary from '../components/BAIErrorBoundary';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Skeleton, Tag, theme } from 'antd';
import {
  BAICard,
  BAIFetchKeyButton,
  BAIFlex,
  BAIPropertyFilter,
  BAITable,
  useUpdatableState,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import React, { Suspense, useDeferredValue, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Regex matching the backend's auto-generated project-admin role name.
 * Example: `role_project_abcd1234_admin`
 */
const PROJECT_ADMIN_ROLE_NAME_RE = /^role_project_[0-9a-f]{8}_admin$/i;

type MemberRow = {
  key: string;
  userId: string;
  email: string;
  fullName: string | null;
  role: 'admin' | 'member';
};

interface ProjectMemberTableProps {
  rows: MemberRow[];
  loading: boolean;
  total: number;
  current: number;
  pageSize: number;
  onPageChange: (current: number, pageSize: number) => void;
}

const ProjectMemberTable: React.FC<ProjectMemberTableProps> = ({
  rows,
  loading,
  total,
  current,
  pageSize,
  onPageChange,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAITable
      rowKey="key"
      size="small"
      loading={loading}
      dataSource={rows}
      pagination={{
        current,
        pageSize,
        total,
        onChange: onPageChange,
      }}
      columns={[
        {
          key: 'fullName',
          title: t('projectMembers.Name'),
          dataIndex: 'fullName',
          render: (_val, record) => record.fullName || '-',
        },
        {
          key: 'email',
          title: t('projectMembers.Email'),
          dataIndex: 'email',
          render: (_val, record) => record.email || '-',
        },
        {
          key: 'role',
          title: t('projectMembers.Role'),
          dataIndex: 'role',
          render: (_val, record) =>
            record.role === 'admin' ? (
              <Tag color={token.colorPrimary}>
                {t('projectMembers.RoleAdmin')}
              </Tag>
            ) : (
              <Tag>{t('projectMembers.RoleMember')}</Tag>
            ),
        },
      ]}
    />
  );
};

interface ProjectMemberListContentProps {
  projectId: string;
}

/**
 * Derive member rows from the primary `projectRoles(projectId)` query result.
 * Each role's `users` connection is flattened and deduped by user id. Users in
 * a role whose permissions include PROJECT_ADMIN_PAGE (or whose role name
 * matches the `role_project_<8hex>_admin` pattern) are labeled `admin`;
 * everyone else is a `member`.
 *
 * Returns `null` when the primary query is unavailable or empty (falls back
 * to the secondary adminUsersV2 query).
 */
const deriveRowsFromProjectRoles = (
  data: ProjectMemberListPageQuery['response'],
): MemberRow[] | null => {
  const rolesResult = data.projectRolesResult;
  if (!rolesResult || rolesResult.ok !== true) {
    return null;
  }
  const edges = rolesResult.value?.edges ?? [];
  if (edges.length === 0) {
    return null;
  }

  const rowsByUserId = new Map<string, MemberRow>();
  for (const roleEdge of edges) {
    const role = roleEdge?.node;
    if (!role) continue;

    const permissionEdges = role.permissions?.edges ?? [];
    const roleGrantsAdmin =
      permissionEdges.some(
        (pEdge) =>
          pEdge?.node?.scopeType === 'PROJECT' &&
          pEdge?.node?.entityType === 'PROJECT_ADMIN_PAGE',
      ) || (role.name ? PROJECT_ADMIN_ROLE_NAME_RE.test(role.name) : false);

    const userEdges = role.users?.edges ?? [];
    for (const userEdge of userEdges) {
      const assignment = userEdge?.node;
      const user = assignment?.user;
      if (!user?.id) continue;

      const existing = rowsByUserId.get(user.id);
      const nextRole: 'admin' | 'member' =
        existing?.role === 'admin' || roleGrantsAdmin ? 'admin' : 'member';
      rowsByUserId.set(user.id, {
        key: user.id,
        userId: user.id,
        email: user.basicInfo?.email ?? '',
        fullName: user.basicInfo?.fullName ?? null,
        role: nextRole,
      });
    }
  }

  if (rowsByUserId.size === 0) return null;
  return Array.from(rowsByUserId.values());
};

/**
 * Fallback: query users within the current project via `projectUsersV2`. This
 * endpoint accepts a project UUID scope and only requires project membership
 * (or higher privileges), so it is reachable by project admins — unlike
 * `adminUsersV2`, which is superadmin-only.
 *
 * Without per-role data we cannot determine admin vs member reliably, so every
 * row is surfaced as `member`. This is a graceful degradation for older cores
 * where `projectRoles` is unavailable or returns an empty stack.
 */
const ProjectMemberListFallback: React.FC<{
  projectId: string;
  first: number;
  offset: number;
  emailFilter?: string;
  current: number;
  onPageChange: (current: number, pageSize: number) => void;
}> = ({ projectId, first, offset, emailFilter, current, onPageChange }) => {
  'use memo';

  const variables = useMemo(
    () => ({
      projectId,
      filter: emailFilter ? { email: { iContains: emailFilter } } : null,
      first,
      offset,
    }),
    [projectId, first, offset, emailFilter],
  );
  const deferred = useDeferredValue(variables);

  const data = useLazyLoadQuery<ProjectMemberListPageFallbackQuery>(
    graphql`
      query ProjectMemberListPageFallbackQuery(
        $projectId: UUID!
        $filter: UserV2Filter
        $first: Int
        $offset: Int
      ) {
        projectUsersV2(
          scope: { projectId: $projectId }
          filter: $filter
          first: $first
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              basicInfo {
                email
                fullName
              }
            }
          }
        }
      }
    `,
    deferred,
    { fetchPolicy: 'store-and-network' },
  );

  const rows: MemberRow[] = (data.projectUsersV2?.edges ?? [])
    .map((edge) => edge?.node)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .map((n) => ({
      key: n.id,
      userId: n.id,
      email: n.basicInfo?.email ?? '',
      fullName: n.basicInfo?.fullName ?? null,
      role: 'member' as const,
    }));

  const total = data.projectUsersV2?.count ?? rows.length;

  return (
    <ProjectMemberTable
      rows={rows}
      loading={deferred !== variables}
      total={total}
      current={current}
      pageSize={first}
      onPageChange={onPageChange}
    />
  );
};

const ProjectMemberListContent: React.FC<ProjectMemberListContentProps> = ({
  projectId,
}) => {
  'use memo';
  const { t } = useTranslation();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(20),
      filter: parseAsString,
    },
    {
      history: 'replace',
    },
  );

  const [fetchKey, updateFetchKey] = useUpdatableState('initial-fetch');

  const first = queryParams.pageSize;
  const offset =
    queryParams.current > 1 ? (queryParams.current - 1) * first : 0;

  const data = useLazyLoadQuery<ProjectMemberListPageQuery>(
    graphql`
      query ProjectMemberListPageQuery($projectId: UUID!) {
        projectRolesResult: projectRoles(projectId: $projectId, first: 100)
          @catch(to: RESULT) {
          edges {
            node {
              id
              name
              permissions(first: 100) {
                edges {
                  node {
                    id
                    scopeType
                    entityType
                  }
                }
              }
              users(first: 500) {
                edges {
                  node {
                    id
                    user {
                      id
                      basicInfo {
                        email
                        fullName
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    { projectId },
    {
      fetchPolicy:
        fetchKey === 'initial-fetch' ? 'store-and-network' : 'network-only',
      fetchKey: fetchKey === 'initial-fetch' ? undefined : fetchKey,
    },
  );

  const primaryRows = deriveRowsFromProjectRoles(data);

  // Apply client-side email filter for the primary path (projectRoles doesn't
  // support a server-side email filter directly on the role→users edge today).
  const emailFilter = queryParams.filter?.trim() || undefined;
  const filteredPrimaryRows = useMemo(() => {
    if (!primaryRows) return null;
    if (!emailFilter) return primaryRows;
    const needle = emailFilter.toLowerCase();
    return primaryRows.filter(
      (r) =>
        r.email.toLowerCase().includes(needle) ||
        (r.fullName ?? '').toLowerCase().includes(needle),
    );
  }, [primaryRows, emailFilter]);

  const totalPrimary = filteredPrimaryRows?.length ?? 0;
  const pagedPrimaryRows = useMemo(() => {
    if (!filteredPrimaryRows) return null;
    return filteredPrimaryRows.slice(offset, offset + first);
  }, [filteredPrimaryRows, offset, first]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="between" wrap="wrap" gap="sm">
        <BAIFlex gap="sm" align="start" wrap="wrap" style={{ flexShrink: 1 }}>
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'email',
                type: 'string',
                propertyLabel: t('projectMembers.Email'),
              },
              {
                key: 'name',
                type: 'string',
                propertyLabel: t('projectMembers.Name'),
              },
            ]}
            value={queryParams.filter || undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null, current: 1 });
            }}
          />
        </BAIFlex>
        <BAIFetchKeyButton
          value={fetchKey}
          onChange={(next) => updateFetchKey(next)}
          autoUpdateDelay={15_000}
        />
      </BAIFlex>
      {pagedPrimaryRows ? (
        <ProjectMemberTable
          rows={pagedPrimaryRows}
          loading={false}
          total={totalPrimary}
          current={queryParams.current}
          pageSize={first}
          onPageChange={(current, pageSize) => {
            setQueryParams({ current, pageSize });
          }}
        />
      ) : (
        <Suspense fallback={<Skeleton active />}>
          <ProjectMemberListFallback
            projectId={projectId}
            first={first}
            offset={offset}
            emailFilter={emailFilter}
            current={queryParams.current}
            onPageChange={(current, pageSize) => {
              setQueryParams({ current, pageSize });
            }}
          />
        </Suspense>
      )}
    </BAIFlex>
  );
};

const ProjectMemberListPage: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();

  return (
    <BAICard
      variant="borderless"
      title={t('webui.menu.ProjectMembers')}
      styles={{
        header: { borderBottom: 'none' },
        body: { paddingTop: 0 },
      }}
    >
      <BAIErrorBoundary>
        <Suspense fallback={<Skeleton active />}>
          {currentProject.id ? (
            <ProjectMemberListContent projectId={currentProject.id} />
          ) : (
            <Skeleton active />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAICard>
  );
};

export default ProjectMemberListPage;
