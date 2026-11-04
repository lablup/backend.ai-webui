/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectAdminSettingModalAssignMutation } from '../../../__generated__/ProjectAdminSettingModalAssignMutation.graphql';
import { ProjectAdminSettingModalQuery } from '../../../__generated__/ProjectAdminSettingModalQuery.graphql';
import { ProjectAdminSettingModalRevokeMutation } from '../../../__generated__/ProjectAdminSettingModalRevokeMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import { reasonMessage } from '../../../helper/mutationError';
import { useWebUINavigate, useCurrentDomain } from '../../../hooks';
import { isAlreadyAssignedFailure } from '../../RBACManagementPage/helper/roleAssignment';
import { Banner } from '@lablup/ui-common/Banner';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIBulkErrorModal,
  BAIButton,
  BAIFlex,
  BAIId,
  BAIModal,
  BAIModalProps,
  BAISelect,
  BAITable,
  BAIScopedUserSelect,
  filterOutNullAndUndefined,
  useBAILogger,
  useMutationWithPromise,
  type BAIColumnsType,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ShieldCheckIcon, XIcon } from 'lucide-react';
import { Suspense, useDeferredValue, useRef, useState } from 'react';
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
          entityId
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

// Project admin is a `scope_admin` permission on any role in the scope;
// `permissions.some` matches roles carrying at least one such entry (backend
// BA-8077), and the scope type is answered in lowercase, hence `iEquals`.
export const buildProjectAdminRoleFilter = (
  projectId: string,
): ProjectAdminRoleFilter => ({
  status: { equals: 'ACTIVE' },
  mappedScope: {
    scopeType: { iEquals: 'project' },
    scopeId: { equals: projectId },
  },
  permissions: {
    some: { entityType: { iEquals: SCOPE_ADMIN_ENTITY_TYPE } },
  },
});

export const selectProjectAdminRoles = (
  data: ProjectAdminSettingModalQuery['response'] | undefined,
): Array<ProjectAdminRole> =>
  _.sortBy(
    filterOutNullAndUndefined(
      _.map(data?.adminRoles?.edges, (edge) => edge?.node),
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
        ).map((node) => ({ ...node, roleId: role.entityId })),
      ),
      'userId',
    ),
    (group) => ({
      userId: group[0].userId,
      email: group[0].user?.basicInfo?.email,
      roleIds: _.uniq(_.map(group, 'roleId')),
    }),
  );

/** One role grant of an Add: the users it was sent for and how it settled. */
export interface ProjectAdminGrant {
  userIds: Array<string>;
  result: PromiseSettledResult<
    ProjectAdminSettingModalAssignMutation['response']
  >;
}

export interface ProjectAdminGrantFailure {
  userId: string;
  message: string;
}

export interface ProjectAdminGrantOutcome {
  /** At least one role was newly granted to at least one user. */
  hasAssigned: boolean;
  /** Users who already held every admin role of the project. */
  skippedUserIds: Array<string>;
  /** Users refused at least one role, with every distinct reason. */
  failures: Array<ProjectAdminGrantFailure>;
}

/**
 * Folds the per-role grants of one Add into per-user outcomes. A rejected
 * grant counts every user it was sent for as failed; "already holds the role"
 * is a skip, and only a user skipped by every grant sent for them is reported so.
 */
export const classifyProjectAdminGrants = (
  grants: Array<ProjectAdminGrant>,
  userIds: Array<string>,
): ProjectAdminGrantOutcome => {
  const messagesByUser = new Map<string, Array<string>>();
  const grantCountByUser = new Map<string, number>();
  const skipCountByUser = new Map<string, number>();
  const addFailure = (userId: string, message: string) =>
    messagesByUser.set(userId, [
      ...(messagesByUser.get(userId) ?? []),
      message,
    ]);
  let hasAssigned = false;
  grants.forEach(({ userIds: requested, result }) => {
    requested.forEach((userId) =>
      grantCountByUser.set(userId, (grantCountByUser.get(userId) ?? 0) + 1),
    );
    if (result.status === 'rejected') {
      const message = reasonMessage(result.reason);
      requested.forEach((userId) => addFailure(userId, message));
      return;
    }
    const { assigned, failed } = result.value.partialBulkAssignRoles;
    hasAssigned ||= !_.isEmpty(assigned);
    failed.forEach((failure) => {
      if (isAlreadyAssignedFailure(failure)) {
        skipCountByUser.set(
          failure.userId,
          (skipCountByUser.get(failure.userId) ?? 0) + 1,
        );
      } else {
        addFailure(failure.userId, failure.message);
      }
    });
  });
  return {
    hasAssigned,
    skippedUserIds: userIds.filter(
      (userId) =>
        !messagesByUser.has(userId) &&
        skipCountByUser.get(userId) === grantCountByUser.get(userId),
    ),
    // Requested order first; an entry for any other id is still a failure.
    failures: _.uniq([...userIds, ...messagesByUser.keys()])
      .filter((userId) => messagesByUser.has(userId))
      .map((userId) => ({
        userId,
        message: _.uniq(messagesByUser.get(userId)).join('\n'),
      })),
  };
};

const MAX_SKIPPED_NAMES = 3;

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
  const { id: currentDomainId } = useCurrentDomain();
  const domainScope = { domain: [{ value: currentDomainId }] };
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const webuiNavigate = useWebUINavigate();
  const formRef = useRef<FormInstance<{ userIds: string[] }>>(null);
  // The error modal is open while non-empty.
  const [failedGrants, setFailedGrants] = useState<
    Array<ProjectAdminGrantFailure>
  >([]);
  // Emails of every user picked so far: the select's options only hold the
  // current search results when a failure arrives.
  const userLabelsRef = useRef(new Map<string, string>());
  const userLabelOf = (userId: string) =>
    userLabelsRef.current.get(userId) ?? userId;

  // Keep the previous result visible while a reload is in flight so the table
  // shows an inline loading indicator instead of a Suspense fallback.
  const deferredQueryRef = useDeferredValue(queryRef);
  const isRefetchingInTransition = deferredQueryRef !== queryRef;

  const data = usePreloadedQuery<ProjectAdminSettingModalQuery>(
    ProjectAdminSettingQuery,
    deferredQueryRef,
  );

  const roles = selectProjectAdminRoles(data);
  const assignments = groupProjectAdminAssignmentsByUser(roles);

  const mutateBulkAssignRole =
    useMutationWithPromise<ProjectAdminSettingModalAssignMutation>(graphql`
      mutation ProjectAdminSettingModalAssignMutation(
        $input: BulkAssignRoleInput!
      ) {
        partialBulkAssignRoles(input: $input) {
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
        revokeRole(input: $input) {
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
    const values = await formRef.current?.validateFields().catch((error) => {
      // Validation errors are rendered inline on the Form.Item.
      logger.debug(error);
      return undefined;
    });
    if (!values) {
      return;
    }
    const grant = async (
      roleId: string,
      userIds: Array<string>,
      withProject: boolean,
    ): Promise<ProjectAdminGrant> => ({
      userIds,
      result: (
        await Promise.allSettled([
          mutateBulkAssignRole({
            input: {
              roleId,
              userIds,
              ...(withProject ? { projectId } : {}),
            },
          }),
        ])
      )[0],
    });
    // Only the first role carries projectId, which adds the project to each
    // user's allowed list; the other roles go to the users it did not refuse,
    // so a refused join grants no admin role at all.
    const [firstRole, ...otherRoles] = roles;
    const first = await grant(firstRole.entityId, values.userIds, true);
    const joinedUserIds =
      first.result.status === 'fulfilled'
        ? _.difference(
            values.userIds,
            first.result.value.partialBulkAssignRoles.failed
              .filter((failure) => !isAlreadyAssignedFailure(failure))
              .map((failure) => failure.userId),
          )
        : [];
    // Settle every grant before the refetch below.
    const others = _.isEmpty(joinedUserIds)
      ? []
      : await Promise.all(
          otherRoles.map((role) => grant(role.entityId, joinedUserIds, false)),
        );
    const { hasAssigned, skippedUserIds, failures } =
      classifyProjectAdminGrants([first, ...others], values.userIds);
    if (!_.isEmpty(skippedUserIds)) {
      const labels = skippedUserIds.map(userLabelOf);
      const shown = labels.slice(0, MAX_SKIPPED_NAMES).join(', ');
      const rest = labels.length - MAX_SKIPPED_NAMES;
      message.info(
        t('rbac.UsersAlreadyAssignedSkipped', {
          count: labels.length,
          names: rest > 0 ? `${shown} +${rest}` : shown,
        }),
      );
    }
    if (_.isEmpty(failures)) {
      if (hasAssigned) {
        message.success(t('rbac.UsersAssigned'));
      }
      formRef.current?.resetFields();
    } else {
      failures.forEach((failure) =>
        logger.error('Failed to assign project admin', failure.message),
      );
      // Keep only the failed users selected so the next Add retries them;
      // the empty error gives the red border, details are in the modal.
      const failedIds = failures.map((failure) => failure.userId);
      formRef.current?.setFieldsValue({ userIds: failedIds });
      formRef.current?.setFields([{ name: 'userIds', errors: [''] }]);
      message.error(t('rbac.UserAssignmentsPartialFailureDescription'));
      setFailedGrants(failures);
    }
    onReload(queryRef.variables, { fetchPolicy: 'network-only' });
  };

  const failureColumns: BAIColumnsType<ProjectAdminGrantFailure> = [
    {
      key: 'user',
      title: t('general.E-Mail'),
      render: (__, record) => userLabelOf(record.userId),
    },
    {
      key: 'message',
      title: t('rbac.ErrorMessage'),
      dataIndex: 'message',
    },
  ];

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
            roleId,
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
        <Banner
          role="status"
          status="info"
          title={t('project.DescSetProjectAdmin')}
        />
        <Banner
          role="alert"
          status="warning"
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
                // minWidth 0: a long selection must not push Add out of the row.
                style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
              >
                <BAIScopedUserSelect
                  scope={domainScope}
                  multiple
                  valuePropName="id"
                  label={t('rbac.SelectUsers')}
                  isLabelHidden
                  placeholder={t('rbac.SelectUsers')}
                  onChange={(__, option) => {
                    _.castArray(option ?? []).forEach((o) => {
                      const label = String(o.label ?? o.value);
                      // An unresolved option echoes its id; keep a known email.
                      if (
                        label !== String(o.value) ||
                        !userLabelsRef.current.has(String(o.value))
                      ) {
                        userLabelsRef.current.set(String(o.value), label);
                      }
                    });
                  }}
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
      <BAIBulkErrorModal<ProjectAdminGrantFailure>
        open={!_.isEmpty(failedGrants)}
        alertDescription={t('rbac.UserAssignmentsPartialFailureDescription')}
        columns={failureColumns}
        dataSource={failedGrants}
        idKey="userId"
        onRequestClose={() => setFailedGrants([])}
      />
    </BAIModal>
  );
};

export default ProjectAdminSettingModal;
