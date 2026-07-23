/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectAdminSettingModalAssignMutation } from '../__generated__/ProjectAdminSettingModalAssignMutation.graphql';
import { ProjectAdminSettingModalQuery } from '../__generated__/ProjectAdminSettingModalQuery.graphql';
import { ProjectAdminSettingModalRevokeMutation } from '../__generated__/ProjectAdminSettingModalRevokeMutation.graphql';
import { useWebUINavigate } from '../hooks';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { Alert, App, Form, FormInstance, Tooltip } from 'antd';
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

// Exported so the opener can `loadQuery` it in the click event. The backend
// registers a pair of SYSTEM-source roles on each project scope
// (`project-<id>-member` / `project-<id>-admin`); the filter looks them up by
// the project's scope id, the admin one is picked by its name suffix, and the
// nested `users` connection carries its current assignments.
export const ProjectAdminSettingQuery = graphql`
  query ProjectAdminSettingModalQuery(
    $filter: RoleFilter
    $limit: Int
    $offset: Int
  ) {
    adminRoles(filter: $filter, first: 10) {
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
  const formRef = useRef<FormInstance<{ userIds: string[] }>>(null);

  // Keep the previous result visible while a reload is in flight so the table
  // shows an inline loading indicator instead of a Suspense fallback.
  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetchingInTransition = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<ProjectAdminSettingModalQuery>(
    ProjectAdminSettingQuery,
    deferredQueryRef,
  );

  const role =
    _.find(data.adminRoles?.edges, (edge) =>
      _.endsWith(edge?.node?.name, 'admin'),
    )?.node ?? null;
  const assignments = filterOutNullAndUndefined(
    role?.users?.edges?.map((edge) => edge?.node) ?? [],
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
    if (!role) {
      return;
    }
    await formRef.current
      ?.validateFields()
      .then(async (values) => {
        try {
          const result = await mutateBulkAssignRole({
            input: {
              roleId: toLocalId(role.id),
              userIds: values.userIds,
              // Passing projectId auto-adds the project to each user's allowed
              // project list.
              projectId,
            },
          });
          const failed = result.adminBulkAssignRole?.failed ?? [];
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
        }
      })
      .catch((error) => {
        // Validation errors are rendered inline on the Form.Item.
        logger.debug(error);
      });
  };

  const handleRevoke = async (userId: string) => {
    if (!role) {
      return;
    }
    try {
      await mutateRevokeRole({
        input: {
          roleId: toLocalId(role.id),
          userId,
        },
      });
      message.success(t('rbac.UserRevoked'));
      onReload(queryRef.variables, { fetchPolicy: 'network-only' });
    } catch (error) {
      logger.error(error);
      message.error(resolveErrorMessage(error));
    }
  };

  return (
    <BAIModal
      title={
        <BAIFlex align="center">
          {t('project.SetProjectAdmin')}
          {role && (
            <Tooltip title={t('project.ViewRBACPermissions')}>
              <BAIButton
                type="text"
                size="small"
                icon={<ShieldCheckIcon />}
                onClick={() => {
                  const searchParams = new URLSearchParams({
                    filter: JSON.stringify({
                      name: { iContains: role.name },
                    }),
                    roleDetail: role.id,
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
        <Alert type="info" showIcon title={t('project.DescSetProjectAdmin')} />
        <Alert
          type="warning"
          showIcon
          title={t('project.DescRevokeProjectAdmin')}
        />
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
                  mode="multiple"
                  valuePropName="id"
                  maxTagCount="responsive"
                  style={{ width: '100%' }}
                  placeholder={t('rbac.SelectUsers')}
                  aria-label={t('rbac.SelectUsers')}
                />
              </Form.Item>
            </Suspense>
            <BAIButton type="primary" action={handleAssign}>
              {t('general.Add')}
            </BAIButton>
          </BAIFlex>
        </Form>
        <BAITable
          rowKey="id"
          size="small"
          dataSource={assignments}
          loading={isRefetchingInTransition}
          columns={[
            {
              key: 'email',
              title: t('general.E-Mail'),
              render: (__, record) => record.user?.basicInfo?.email || '-',
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
                <Tooltip title={t('project.RevokeProjectAdmin')}>
                  <BAIButton
                    type="text"
                    size="small"
                    danger
                    icon={<XIcon />}
                    action={() => handleRevoke(record.userId)}
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
