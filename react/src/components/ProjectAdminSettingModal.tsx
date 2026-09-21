/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectAdminSettingModalAssignMutation } from '../__generated__/ProjectAdminSettingModalAssignMutation.graphql';
import { ProjectAdminSettingModalQuery } from '../__generated__/ProjectAdminSettingModalQuery.graphql';
import { ProjectAdminSettingModalRevokeMutation } from '../__generated__/ProjectAdminSettingModalRevokeMutation.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { Banner } from '@astryxdesign/core/Banner';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  BAIButton,
  BAIFlex,
  BAIId,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAITable,
  BAIUserSelect,
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ShieldCheckIcon, XIcon } from 'lucide-react';
import { Suspense, useDeferredValue, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  PreloadedQuery,
  usePreloadedQuery,
  UseQueryLoaderLoadQueryOptions,
} from 'react-relay';

// Exported so the opener can `loadQuery` it in the click event. The filter is
// built by `buildProjectAdminRoleFilter`; the nested `users` connection carries
// each role's current assignments.
export const ProjectAdminSettingQuery = graphql`
  query ProjectAdminSettingModalQuery(
    $filter: RoleFilter
    $limit: Int
    $offset: Int
  ) {
    adminRoles(filter: $filter, first: 50) {
      count
      edges {
        node {
          id
          name
          users(limit: $limit, offset: $offset) {
            count
            edges {
              node {
                id
                userId
                user {
                  id
                  basicInfo {
                    email
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Project admin is a permission on this entity type (BA-7796).
const SCOPE_ADMIN_ENTITY_TYPE = 'scope_admin';

type ProjectAdminRoleFilter =
  ProjectAdminSettingModalQuery['variables']['filter'];

type ProjectAdminRole = NonNullable<
  NonNullable<
    NonNullable<
      ProjectAdminSettingModalQuery['response']['adminRoles']
    >['edges'][number]
  >['node']
>;

// 26.9.0+ (`matchesByScopeAdminPermission`): project admin is a `scope_admin`
// permission on any role in the scope; `permissions.some` matches roles
// carrying at least one such entry (backend BA-8077), and the scope type is
// answered in lowercase, hence `iEquals` (ADR 0006). Older managers register
// one SYSTEM role pair per project (`project-<id>-member` / `-admin`) and
// only the name says which is which, so they get the pair and
// `selectProjectAdminRoles` keeps the `-admin` one.
export const buildProjectAdminRoleFilter = (
  projectId: string,
  matchesByScopeAdminPermission: boolean,
): ProjectAdminRoleFilter =>
  matchesByScopeAdminPermission
    ? {
        status: { equals: 'ACTIVE' },
        mappedScope: {
          scopeType: { iEquals: 'project' },
          scopeId: { equals: projectId },
        },
        permissions: {
          some: { entityType: { iEquals: SCOPE_ADMIN_ENTITY_TYPE } },
        },
      }
    : {
        status: { equals: 'ACTIVE' },
        source: { equals: 'SYSTEM' },
        mappedScope: {
          scopeType: { equals: 'PROJECT' },
          scopeId: { equals: projectId },
        },
      };

export const selectProjectAdminRoles = (
  data: ProjectAdminSettingModalQuery['response'] | undefined,
  matchesByScopeAdminPermission: boolean,
): Array<ProjectAdminRole> =>
  _.sortBy(
    filterOutNullAndUndefined(
      _.map(data?.adminRoles?.edges, (edge) => edge?.node),
    ).filter(
      (node) => matchesByScopeAdminPermission || _.endsWith(node.name, 'admin'),
    ),
    // `adminRoles` is unordered, and the modal's RBAC shortcut opens roles[0].
    ['name', 'id'],
  );

export interface ProjectAdminAssignment {
  userId: string;
  email: string | null | undefined;
  /** Every admin role of the project this user holds. */
  roleIds: Array<string>;
}

/**
 * One row per user, carrying all of the project's admin roles they hold — a
 * user granted several of them is one row, and revoking it drops all of them.
 */
export const groupProjectAdminAssignmentsByUser = (
  roles: Array<ProjectAdminRole>,
): Array<ProjectAdminAssignment> =>
  _.map(
    _.groupBy(
      roles.flatMap((role) =>
        filterOutNullAndUndefined(
          _.map(role.users?.edges, (edge) => edge?.node),
        ).map((node) => ({ ...node, roleId: role.id })),
      ),
      'userId',
    ),
    (group) => ({
      userId: group[0].userId,
      email: group[0].user?.basicInfo?.email,
      roleIds: _.uniq(_.map(group, 'roleId')),
    }),
  );

interface ProjectAdminSettingModalProps extends Omit<
  BAIModalProps,
  'children'
> {
  /** Preloaded query reference produced by the opener via `useQueryLoader`. */
  queryRef: PreloadedQuery<ProjectAdminSettingModalQuery>;
  /** Local UUID of the target project (also the role's scope id). */
  projectId: string;
  /**
   * Re-run the query after assign / revoke. Same signature as
   * `useQueryLoader`'s `loadQuery`, so the opener can pass it directly.
   */
  onReload: (
    variables: ProjectAdminSettingModalQuery['variables'],
    options?: UseQueryLoaderLoadQueryOptions,
  ) => void;
}

const ProjectAdminSettingModal = ({
  open,
  queryRef,
  projectId,
  onReload,
  onCancel,
  ...modalProps
}: ProjectAdminSettingModalProps) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { upsertNotification } = useSetBAINotification();
  const webuiNavigate = useWebUINavigate();
  const baiClient = useSuspendedBackendaiClient();
  const matchesByScopeAdminPermission = baiClient.supports(
    'rbac-single-scope-role',
  );
  const formRef = useRef<FormInstance<{ userIds: string[] }>>(null);

  // Keep the previous result visible while a reload is in flight so the table
  // shows an inline loading indicator instead of a Suspense fallback.
  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetchingInTransition = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<ProjectAdminSettingModalQuery>(
    ProjectAdminSettingQuery,
    deferredQueryRef,
  );

  const roles = selectProjectAdminRoles(data, matchesByScopeAdminPermission);
  const assignments = groupProjectAdminAssignmentsByUser(roles);

  const mutateBulkAssignRole =
    useMutationWithPromise<ProjectAdminSettingModalAssignMutation>(graphql`
      mutation ProjectAdminSettingModalAssignMutation(
        $input: BulkAssignRoleInput!
      ) {
        adminBulkAssignRole(input: $input) {
          assigned {
            id
            userId
          }
          failed {
            userId
            message
          }
        }
      }
    `);

  const mutateRevokeRole =
    useMutationWithPromise<ProjectAdminSettingModalRevokeMutation>(graphql`
      mutation ProjectAdminSettingModalRevokeMutation(
        $input: RevokeRoleInput!
      ) {
        adminRevokeRole(input: $input) {
          id
        }
      }
    `);

  const resolveErrorMessage = (error: unknown) => {
    const errorMessage =
      error instanceof Error
        ? error.message
        : _.get(_.castArray(error)[0], 'message');
    return errorMessage || t('general.ErrorOccurred');
  };

  const handleAssign = async () => {
    if (_.isEmpty(roles)) {
      return;
    }
    await formRef.current
      ?.validateFields()
      .then(async (values) => {
        // `allSettled`, not `all`: with several roles one grant can be
        // refused while the rest land, and the table must not be refetched
        // while the others are still in flight.
        const settled = await Promise.allSettled(
          roles.map((adminRole, index) =>
            mutateBulkAssignRole({
              input: {
                roleId: toLocalId(adminRole.id),
                userIds: values.userIds,
                // Passing projectId auto-adds the project to each user's
                // allowed project list — once is enough, and concurrent
                // writes of the same list would race.
                ...(index === 0 ? { projectId } : {}),
              },
            }),
          ),
        );
        const rejected = settled.filter(
          (result) => result.status === 'rejected',
        );
        // Pre-26.9 managers report a refused user here instead of raising;
        // from 26.9 `failed` is always empty.
        const failed = settled.flatMap((result, index) =>
          result.status === 'fulfilled'
            ? (result.value.adminBulkAssignRole?.failed ?? []).map((item) => ({
                ...item,
                roleId: roles[index].id,
              }))
            : [],
        );
        _.forEach(failed, (item) => {
          upsertNotification({
            key: `project-admin-assign-failed-${item.roleId}-${item.userId}`,
            open: true,
            duration: 0,
            type: 'error',
            message: item.message,
          });
        });
        if (rejected.length > 0) {
          _.forEach(rejected, (result) => logger.error(result.reason));
          message.error(resolveErrorMessage(rejected[0].reason));
        } else if (failed.length > 0) {
          message.warning(
            t('rbac.BulkAssignPartialFailure', {
              count: _.uniq(_.map(failed, 'userId')).length,
            }),
          );
        } else {
          message.success(t('rbac.UsersAssigned'));
          formRef.current?.resetFields();
        }
        onReload(queryRef.variables, { fetchPolicy: 'network-only' });
      })
      .catch((error) => {
        // Validation errors are rendered inline on the Form.Item.
        logger.debug(error);
      });
  };

  const handleRevoke = async (userId: string, roleIds: Array<string>) => {
    if (_.isEmpty(roleIds)) {
      return;
    }
    // See `handleAssign`: a partial revoke leaves the user an admin through
    // the roles that survived, so every call has to settle before reloading.
    const settled = await Promise.allSettled(
      roleIds.map((roleId) =>
        mutateRevokeRole({
          input: {
            roleId: toLocalId(roleId),
            userId,
          },
        }),
      ),
    );
    const rejected = settled.filter((result) => result.status === 'rejected');
    if (rejected.length > 0) {
      _.forEach(rejected, (result) => logger.error(result.reason));
      message.error(resolveErrorMessage(rejected[0].reason));
    } else {
      message.success(t('rbac.UserRevoked'));
    }
    onReload(queryRef.variables, { fetchPolicy: 'network-only' });
  };

  return (
    <BAIModal
      title={
        <BAIFlex align="center">
          {t('project.SetProjectAdmin')}
          {/* The RBAC page shows one role at a time, so the shortcut opens the
              first of the project's admin roles by name. */}
          {roles[0] && (
            <Tooltip content={t('project.ViewRBACPermissions')}>
              <BAIButton
                type="text"
                size="small"
                icon={<ShieldCheckIcon />}
                onClick={() => {
                  const searchParams = new URLSearchParams({
                    filter: JSON.stringify({
                      name: { iContains: roles[0].name },
                    }),
                    roleDetail: roles[0].id,
                  });
                  webuiNavigate(`/rbac?${searchParams.toString()}`);
                }}
              />
            </Tooltip>
          )}
        </BAIFlex>
      }
      open={open}
      width={600}
      footer={null}
      onCancel={onCancel}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        {/* antd `Alert` → `Banner` (MAPPING §4): `type` → `status`, `showIcon`
            dropped (Banner always renders its status icon). */}
        <Banner status="info" title={t('project.DescSetProjectAdmin')} />
        <Banner status="warning" title={t('project.DescRevokeProjectAdmin')} />
        <Form ref={formRef}>
          <BAIFlex gap="xs" align="start">
            <Suspense
              fallback={
                <BAISelect mode="multiple" loading style={{ flex: 1 }} />
              }
            >
              <Form.Item
                name="userIds"
                required
                rules={[
                  { required: true, message: t('rbac.PleaseSelectUsers') },
                ]}
                style={{ flex: 1, marginBottom: 0 }}
              >
                <BAIUserSelect
                  multiple
                  valuePropName="id"
                  label={t('rbac.SelectUsers')}
                  isLabelHidden
                  placeholder={t('rbac.SelectUsers')}
                />
              </Form.Item>
            </Suspense>
            <BAIButton type="primary" action={handleAssign}>
              {t('general.Add')}
            </BAIButton>
          </BAIFlex>
        </Form>
        <BAITable
          rowKey="userId"
          size="small"
          dataSource={assignments}
          loading={isRefetchingInTransition}
          columns={[
            {
              key: 'email',
              title: t('general.E-Mail'),
              render: (__, record) => record.email || '-',
            },
            {
              key: 'userId',
              title: t('credential.UserID'),
              render: (__, record) => <BAIId uuid={record.userId} />,
            },
            {
              key: 'control',
              title: t('general.Control'),
              render: (__, record) => (
                <Tooltip content={t('project.RevokeProjectAdmin')}>
                  <BAIButton
                    type="text"
                    size="small"
                    danger
                    icon={<XIcon />}
                    action={() => handleRevoke(record.userId, record.roleIds)}
                  />
                </Tooltip>
              ),
            },
          ]}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default ProjectAdminSettingModal;
