/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  AdminUserManagementQuery,
  AdminUserManagementQuery$data,
  UserV2OrderBy,
} from '../__generated__/AdminUserManagementQuery.graphql';
import { AdminUserManagementUpdateUserMutation } from '../__generated__/AdminUserManagementUpdateUserMutation.graphql';
import { convertToOrderBy } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTOTPSupported } from '../hooks/backendai';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCSVExport } from '../hooks/useCSVExport';
import BAIRadioGroup from './BAIRadioGroup';
import BulkCreateUserFromCSVModal from './BulkCreateUserFromCSVModal';
import PurgeUsersModal from './PurgeUsersModal';
import UpdateUsersModal from './UpdateUsersModal';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import {
  DeleteFilled,
  EllipsisOutlined,
  InfoCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Dropdown, Space, theme } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  toLocalId,
  BAIFlex,
  BAIGraphQLFilterProperty,
  BAIGraphQLPropertyFilter,
  GraphQLFilter,
  useBAILogger,
  BAIFetchKeyButton,
  BAIAdminUserV2Table,
  UserV2InList,
  availableUserV2SorterValues,
  BAIButton,
  BAISelectionLabel,
  BAINameActionCell,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { BanIcon, EditIcon, PlusIcon, UndoIcon } from 'lucide-react';
import { parseAsJson, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useState, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface AdminUserManagementProps {}

type UserNode = NonNullable<
  NonNullable<AdminUserManagementQuery$data['adminUsersV2']>['edges']
>[number];

const AdminUserManagement: React.FC<AdminUserManagementProps> = () => {
  'use memo';

  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const bailClient = useSuspendedBackendaiClient();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      filter: parseAsJson<GraphQLFilter>((value) => value as GraphQLFilter),
      order: parseAsStringLiteral(availableUserV2SorterValues),
      status: parseAsStringLiteral(['ACTIVE', 'INACTIVE']).withDefault(
        'ACTIVE',
      ),
    },
    {
      history: 'replace',
    },
  );
  const { message } = App.useApp();

  const [selectedUserForInfoModal, setSelectedUserForInfoModal] = useState<
    UserNode['node'] | null
  >(null);
  const [selectedUserForSettingModal, setSelectedUserForSettingModal] =
    useState<UserNode['node'] | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openBulkCreateModal, setOpenBulkCreateModal] =
    useState<boolean>(false);
  const [openBulkCreateCSVModal, setOpenBulkCreateCSVModal] =
    useState<boolean>(false);
  const [selectedUserList, setSelectedUserList] = useState<UserNode[]>([]);
  const [openPurgeUsersModal, { toggle: togglePurgeUsersModal }] =
    useToggle(false);
  const [purgeTargetId, setPurgeTargetId] = useState<string | null>(null);
  const [openUpdateUsersModal, { toggle: toggleUpdateUsersModal }] =
    useToggle(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const { isTOTPSupported } = useTOTPSupported();

  const statusFilter =
    queryParams.status === 'ACTIVE'
      ? ({ equals: 'ACTIVE' } as const)
      : ({ notEquals: 'ACTIVE' } as const);

  const queryVariables = {
    filter: {
      ...(queryParams.filter ?? {}),
      status: statusFilter,
    },
    orderBy: convertToOrderBy<Required<UserV2OrderBy>>(queryParams.order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    isNotSupportTotp: !isTOTPSupported,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.AdminUserManagement',
  );

  const { supportedFields, exportCSV } = useCSVExport('users');

  const { adminUsersV2 } = useLazyLoadQuery<AdminUserManagementQuery>(
    graphql`
      query AdminUserManagementQuery(
        $filter: UserV2Filter
        $orderBy: [UserV2OrderBy!]
        $limit: Int
        $offset: Int
        $isNotSupportTotp: Boolean!
      ) {
        adminUsersV2(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          count
          edges {
            node {
              id
              basicInfo {
                email
              }
              ...BAIAdminUserV2TableFragment
              ...PurgeUsersModalFragment
              ...UpdateUsersModalFragment
              ...UserInfoModalFragment
              ...UserSettingModalFragment
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

  // >= 26.4.0: adminUpdateUserV2 — status toggle keyed by userId.
  const [commitUpdateUserV2] =
    useMutation<AdminUserManagementUpdateUserMutation>(graphql`
      mutation AdminUserManagementUpdateUserMutation(
        $userId: UUID!
        $input: UpdateUserV2Input!
      ) {
        adminUpdateUserV2(userId: $userId, input: $input) {
          user {
            id
          }
        }
      }
    `);

  // v2 UserV2 fragment refs driving the Update / Purge modals.
  const selectedUserFragmentRefs = filterOutNullAndUndefined(
    selectedUserList.map((user) => user?.node),
  );

  // Resolve the full user node (carrying the modal fragment refs) for a row id.
  // The detail / edit modals are driven by the presence of this fragment rather
  // than by an id, so `open` follows whether a user is selected.
  const findUserNode = (id: string) =>
    adminUsersV2?.edges?.find((edge) => edge?.node?.id === id)?.node ?? null;

  const renderEmailWithActions = (__: unknown, record: UserV2InList) => {
    const email = record.basicInfo?.email ?? '';
    const isActive = record.status?.status === 'ACTIVE';
    return (
      <BAINameActionCell
        title={email}
        showActions="always"
        actions={filterOutEmpty([
          {
            key: 'info',
            title: t('credential.UserDetail'),
            icon: <InfoCircleOutlined />,
            onClick: () => {
              setSelectedUserForInfoModal(findUserNode(record.id));
            },
          },
          {
            key: 'edit',
            title: t('button.Edit'),
            icon: <SettingOutlined />,
            onClick: () => {
              setSelectedUserForSettingModal(findUserNode(record.id));
            },
          },
          {
            key: 'toggle-status',
            title: isActive
              ? t('credential.Deactivate')
              : t('credential.Activate'),
            icon: isActive ? <BanIcon /> : <UndoIcon />,
            type: isActive ? ('danger' as const) : ('default' as const),
            popConfirm: {
              title: isActive
                ? t('credential.DeactivateUser')
                : t('credential.ActivateUser'),
              description: email,
              okText: isActive
                ? t('credential.Deactivate')
                : t('credential.Activate'),
              cancelText: t('button.Cancel'),
              okButtonProps: isActive ? { danger: true } : undefined,
              onConfirm: () => {
                const handleStatusUpdated = () => {
                  message.success(t('credential.StatusUpdatedSuccessfully'));
                  setSelectedUserList((prev) =>
                    prev.filter((user) => user?.node?.id !== record?.id),
                  );
                  updateFetchKey();
                };

                if (record?.id) {
                  return new Promise<void>((resolve) => {
                    commitUpdateUserV2({
                      variables: {
                        userId: toLocalId(record.id),
                        input: { status: isActive ? 'INACTIVE' : 'ACTIVE' },
                      },
                      onCompleted: (_res, errors) => {
                        if (errors?.[0]) {
                          message.error(
                            errors[0].message || t('error.UnknownError'),
                          );
                          logger.error(errors);
                          resolve();
                          return;
                        }
                        handleStatusUpdated();
                        resolve();
                      },
                      onError: (error) => {
                        message.error(error?.message);
                        logger.error(error);
                        resolve();
                      },
                    });
                  });
                }
              },
            },
          },
          !isActive && {
            key: 'purge',
            title: t('credential.PermanentlyDelete'),
            icon: <DeleteFilled />,
            type: 'danger' as const,
            onClick: () => {
              if (record?.id) {
                setPurgeTargetId(record.id);
              }
            },
          },
        ])}
      />
    );
  };

  // Container UID/GID filters map to a raw GraphQL Int; reject non-integer
  // input before BAIGraphQLPropertyFilter coerces it via Number(...), which
  // would otherwise produce NaN / invalid Int variables.
  const integerRule = {
    message: t('error.OnlyIntegersAreAllowed'),
    validate: (value: string) => /^-?\d+$/.test(String(value).trim()),
  };

  // Filters only supported by the v2 user search API from 26.4.4 (backend
  // BA-6247 / BA-6249). Included only when the connected manager advertises
  // the capability, so the UI never offers filters it cannot evaluate.
  const extendedFilterProperties: Array<BAIGraphQLFilterProperty> = [
    {
      key: 'fullName',
      propertyLabel: t('credential.FullName'),
      type: 'string',
    },
    {
      key: 'resourcePolicy',
      propertyLabel: t('credential.ResourcePolicy'),
      type: 'string',
    },
    {
      key: 'description',
      propertyLabel: t('credential.Description'),
      type: 'string',
    },
    {
      key: 'statusInfo',
      propertyLabel: t('credential.StatusInfo'),
      type: 'string',
    },
    {
      key: 'needPasswordChange',
      propertyLabel: t('credential.DescRequirePasswordChange'),
      type: 'boolean',
    },
    {
      key: 'totpActivated',
      propertyLabel: t('credential.2FAEnabled'),
      type: 'boolean',
    },
    {
      key: 'sudoSessionEnabled',
      propertyLabel: t('credential.EnableSudoSession'),
      type: 'boolean',
    },
    {
      key: 'containerUid',
      propertyLabel: t('credential.ContainerUID'),
      type: 'number',
      rule: integerRule,
    },
    {
      key: 'containerMainGid',
      propertyLabel: t('credential.ContainerGID'),
      type: 'number',
      rule: integerRule,
    },
    {
      // IntArrayFilter: only single-GID membership (`contains`) is exposed
      // since BAIGraphQLPropertyFilter has no array-operator input for
      // `containsAny` / `containsAll`.
      key: 'containerGids',
      propertyLabel: t('credential.ContainerSupplementaryGIDs'),
      type: 'number',
      fixedOperator: 'contains',
      rule: integerRule,
    },
  ];

  const filterProperties: Array<BAIGraphQLFilterProperty> = filterOutEmpty([
    {
      key: 'email',
      propertyLabel: t('general.E-Mail'),
      type: 'string',
    },
    {
      key: 'uuid',
      propertyLabel: 'ID',
      type: 'uuid',
    },
    {
      key: 'username',
      propertyLabel: t('credential.Name'),
      type: 'string',
    },
    {
      key: 'project.name',
      propertyLabel: t('general.Project'),
      type: 'string',
    },
    {
      key: 'role',
      propertyLabel: t('credential.Role'),
      type: 'enum',
      strictSelection: true,
      options: [
        {
          label: 'superadmin',
          value: 'SUPERADMIN',
        },
        {
          label: 'user',
          value: 'USER',
        },
      ],
    },
    ...(bailClient.supports('user-v2-extended-filter')
      ? extendedFilterProperties
      : []),
  ]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
        <BAIFlex direction="row" gap={'sm'} align="start" wrap="wrap">
          <BAIRadioGroup
            value={queryParams.status}
            onChange={(e) => {
              setQueryParams({ status: e.target.value });
              setTablePaginationOption({
                current: 1,
              });
              setSelectedUserList([]);
            }}
            optionType="button"
            options={[
              {
                label: t('general.Active'),
                value: 'ACTIVE',
              },
              {
                label: t('general.Inactive'),
                value: 'INACTIVE',
              },
            ]}
          />
          <BAIGraphQLPropertyFilter
            filterProperties={filterProperties}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setTablePaginationOption({ current: 1 });
              setSelectedUserList([]);
            }}
          />
        </BAIFlex>
        <BAIFlex gap="xs">
          {selectedUserList.length > 0 && (
            <BAIFlex gap="xs">
              <BAISelectionLabel
                count={selectedUserList.length}
                onClearSelection={() => setSelectedUserList([])}
              />
              <BAIButton
                icon={<EditIcon style={{ color: token.colorInfo }} />}
                style={{
                  backgroundColor: token.colorInfoBg,
                }}
                onClick={toggleUpdateUsersModal}
              />
              {queryParams.status === 'INACTIVE' && (
                <BAIButton
                  icon={<DeleteFilled />}
                  style={{
                    color: token.colorError,
                    background: token.colorErrorBg,
                  }}
                  onClick={togglePurgeUsersModal}
                />
              )}
            </BAIFlex>
          )}
          <BAIFetchKeyButton
            loading={deferredFetchKey !== fetchKey}
            value={fetchKey}
            onChange={updateFetchKey}
          />
          <Space.Compact>
            <BAIButton
              type="primary"
              icon={<PlusIcon />}
              onClick={() => {
                setOpenCreateModal(true);
              }}
            >
              {t('credential.CreateUser')}
            </BAIButton>
            {bailClient.supports('bulk-create-user') && (
              <Dropdown
                trigger={['click']}
                menu={{
                  items: [
                    {
                      key: 'bulk-create',
                      label: t('credential.BulkCreateUser'),
                      onClick: () => {
                        setOpenBulkCreateModal(true);
                      },
                    },
                    {
                      key: 'bulk-create-csv',
                      label: t('credential.BulkCreateUserFromCSV'),
                      onClick: () => {
                        setOpenBulkCreateCSVModal(true);
                      },
                    },
                  ],
                }}
                placement="bottomRight"
              >
                <Button type="primary" icon={<EllipsisOutlined />} />
              </Dropdown>
            )}
          </Space.Compact>
        </BAIFlex>
      </BAIFlex>
      <BAIAdminUserV2Table
        usersFrgmt={filterOutNullAndUndefined(
          _.map(adminUsersV2?.edges, 'node'),
        )}
        customizeColumns={(baseColumns) => {
          // The TOTP columns are meaningless when the manager has no TOTP
          // plugin (their data is skipped via @skipOnClient), so hide them.
          const columns = isTOTPSupported
            ? baseColumns
            : baseColumns.filter(
                (column) =>
                  column.key !== 'totp_activated' &&
                  column.key !== 'totp_activated_at',
              );
          return [
            {
              ...columns[0],
              render: renderEmailWithActions,
            },
            ...columns.slice(1),
          ];
        }}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: adminUsersV2?.count || 0,
          current: tablePaginationOption.current,
          style: { marginRight: token.marginXS },
          onChange: (current, pageSize) => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
              setSelectedUserList([]);
            }
          },
        }}
        rowSelection={{
          type: 'checkbox',
          onChange: (keys) => {
            const userNodes = _.compact(adminUsersV2?.edges);
            setSelectedUserList(() => {
              return userNodes.filter(
                (edge) => edge.node && keys.includes(edge?.node.id),
              );
            });
          },
          selectedRowKeys: _.compact(
            selectedUserList.map((user) => user?.node?.id),
          ),
        }}
        onChangeOrder={(nextOrder) => {
          setQueryParams({ order: nextOrder });
          setSelectedUserList([]);
        }}
        order={queryParams.order}
        loading={
          deferredQueryVariables !== queryVariables ||
          deferredFetchKey !== fetchKey
        }
        tableSettings={{
          columnOverrides: columnOverrides,
          onColumnOverridesChange: setColumnOverrides,
        }}
        exportSettings={
          !_.isEmpty(supportedFields)
            ? {
                supportedFields,
                onExport: async (selectedExportKeys) => {
                  await exportCSV(selectedExportKeys, {
                    status: [_.toLower(queryParams.status)],
                  }).catch((err) => {
                    message.error(t('general.ErrorOccurred'));
                    logger.error(err);
                  });
                },
              }
            : undefined
        }
      />
      <BAIUnmountAfterClose>
        <UserInfoModal
          userInfoFrgmt={selectedUserForInfoModal}
          open={!!selectedUserForInfoModal}
          onRequestClose={() => setSelectedUserForInfoModal(null)}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <UserSettingModal
          userSettingFrgmt={selectedUserForSettingModal}
          open={!!selectedUserForSettingModal}
          onRequestClose={(success) => {
            setSelectedUserForSettingModal(null);
            if (success) {
              updateFetchKey();
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <UserSettingModal
          userSettingFrgmt={null}
          open={openCreateModal || openBulkCreateModal}
          bulkCreate={openBulkCreateModal}
          onRequestClose={(success) => {
            setOpenCreateModal(false);
            setOpenBulkCreateModal(false);
            if (success) {
              updateFetchKey();
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <BulkCreateUserFromCSVModal
          open={openBulkCreateCSVModal}
          onRequestClose={(success) => {
            setOpenBulkCreateCSVModal(false);
            if (success) {
              updateFetchKey();
            }
          }}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <PurgeUsersModal
          open={openPurgeUsersModal}
          onOk={() => {
            togglePurgeUsersModal();
            setSelectedUserList([]);
            // updateFetchKey();
          }}
          onCancel={() => {
            togglePurgeUsersModal();
          }}
          usersFrgmt={selectedUserFragmentRefs}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <PurgeUsersModal
          open={!!purgeTargetId}
          onOk={() => {
            setSelectedUserList((prev) =>
              prev.filter((user) => user?.node?.id !== purgeTargetId),
            );
            setPurgeTargetId(null);
            updateFetchKey();
          }}
          onCancel={() => {
            setPurgeTargetId(null);
          }}
          usersFrgmt={filterOutNullAndUndefined(
            adminUsersV2?.edges
              ?.filter((edge) => edge?.node?.id === purgeTargetId)
              .map((edge) => edge?.node),
          )}
        />
      </BAIUnmountAfterClose>
      <BAIUnmountAfterClose>
        <UpdateUsersModal
          open={openUpdateUsersModal}
          onOk={() => {
            toggleUpdateUsersModal();
            setSelectedUserList([]);
            updateFetchKey();
          }}
          onCancel={() => {
            toggleUpdateUsersModal();
          }}
          usersFrgmt={selectedUserFragmentRefs}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default AdminUserManagement;
