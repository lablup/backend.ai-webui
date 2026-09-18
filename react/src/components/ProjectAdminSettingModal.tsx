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

/**
 * Entity type whose permissions a project-admin role carries after the
 * single-scope RBAC migration (manager 26.9.0, BA-7796). Matched
 * case-insensitively because the entity type is a free-form string on
 * `PermissionNestedFilter` and managers differ on its casing.
 */
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

/**
 * Filter that selects the roles granting project admin on `projectId`.
 *
 * Single-scope managers (26.9.0+) carry that grant as a `scope_admin`
 * permission on any number of roles in the scope, so the lookup asks for the
 * permission. Older managers register one SYSTEM role pair per project
 * (`project-<id>-member` / `project-<id>-admin`) and only the name says which
 * is which.
 */
export const buildProjectAdminRoleFilter = (
  projectId: string,
  matchesByScopeAdminPermission: boolean,
): ProjectAdminRoleFilter => ({
  status: { equals: 'ACTIVE' },
  mappedScope: {
    scopeType: { equals: 'PROJECT' },
    scopeId: { equals: projectId },
  },
  ...(matchesByScopeAdminPermission
    ? { permission: { entityType: { iEquals: SCOPE_ADMIN_ENTITY_TYPE } } }
    : { source: { equals: 'SYSTEM' } }),
});

/**
 * The roles `buildProjectAdminRoleFilter` asked for. The permission filter has
 * already narrowed the connection, so every returned role counts; the legacy
 * filter returns the SYSTEM pair, of which only the `-admin` one does.
 */
export const selectProjectAdminRoles = (
  data: ProjectAdminSettingModalQuery['response'] | undefined,
  matchesByScopeAdminPermission: boolean,
): Array<ProjectAdminRole> =>
  filterOutNullAndUndefined(
    _.map(data?.adminRoles?.edges, (edge) => edge?.node),
  ).filter(
    (node) => matchesByScopeAdminPermission || _.endsWith(node.name, 'admin'),
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
  // A user holding several of the project's admin roles is one row; revoking
  // it has to drop every one of them.
  const assignments = _.map(
    _.groupBy(
      roles.flatMap((adminRole) =>
        filterOutNullAndUndefined(
          _.map(adminRole.users?.edges, (edge) => edge?.node),
        ).map((node) => ({ ...node, roleId: adminRole.id })),
      ),
      'userId',
    ),
    (group) => ({
      userId: group[0].userId,
      email: group[0].user?.basicInfo?.email,
      roleIds: _.map(group, 'roleId'),
    }),
  );

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
        try {
          const results = await Promise.all(
            roles.map((adminRole) =>
              mutateBulkAssignRole({
                input: {
                  roleId: toLocalId(adminRole.id),
                  userIds: values.userIds,
                  // Passing projectId auto-adds the project to each user's
                  // allowed project list.
                  projectId,
                },
              }),
            ),
          );
          const failed = results.flatMap(
            (result) => result.adminBulkAssignRole?.failed ?? [],
          );
          if (failed.length > 0) {
            message.warning(
              t('rbac.BulkAssignPartialFailure', { count: failed.length }),
            );
            _.forEach(failed, (item) => {
              upsertNotification({
                key: `project-admin-assign-failed-${projectId}-${item.userId}`,
                open: true,
                duration: 0,
                type: 'error',
                message: item.message,
              });
            });
          } else {
            message.success(t('rbac.UsersAssigned'));
          }
          formRef.current?.resetFields();
          onReload(queryRef.variables, { fetchPolicy: 'network-only' });
        } catch (error) {
          logger.error(error);
          message.error(resolveErrorMessage(error));
          // One role of several may already have been granted.
          onReload(queryRef.variables, { fetchPolicy: 'network-only' });
        }
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
    try {
      await Promise.all(
        roleIds.map((roleId) =>
          mutateRevokeRole({
            input: {
              roleId: toLocalId(roleId),
              userId,
            },
          }),
        ),
      );
      message.success(t('rbac.UserRevoked'));
      onReload(queryRef.variables, { fetchPolicy: 'network-only' });
    } catch (error) {
      logger.error(error);
      message.error(resolveErrorMessage(error));
      // One role of several may already have been revoked.
      onReload(queryRef.variables, { fetchPolicy: 'network-only' });
    }
  };

  return (
    <BAIModal
      title={
        <BAIFlex align="center">
          {t('project.SetProjectAdmin')}
          {/* The RBAC page shows one role at a time, so the shortcut opens the
              first of the project's admin roles. */}
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
