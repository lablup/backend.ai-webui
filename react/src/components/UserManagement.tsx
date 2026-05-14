/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserManagementModifyMutation } from '../__generated__/UserManagementModifyMutation.graphql';
import {
  UserManagementQuery,
  UserManagementQuery$data,
} from '../__generated__/UserManagementQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from '../hooks/useBAISetting';
import { useCSVExport } from '../hooks/useCSVExport';
import BAIRadioGroup from './BAIRadioGroup';
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
  BAIFlex,
  BAIPropertyFilter,
  mergeFilterValues,
  useBAILogger,
  UserNodeInList,
  BAIFetchKeyButton,
  isValidUUID,
  BAIUserNodes,
  BAIButton,
  BAISelectionLabel,
  BAINameActionCell,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { BanIcon, EditIcon, PlusIcon, UndoIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useState, useTransition, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface UserManagementProps {}

type UserNode = NonNullable<
  NonNullable<UserManagementQuery$data['user_nodes']>['edges']
>[number];

const UserManagement: React.FC<UserManagementProps> = () => {
  'use memo';

  const { logger } = useBAILogger();
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useFetchKey();

  const bailClient = useSuspendedBackendaiClient();

  const [queryParams, setQueryParams] = useQueryStates({
    filter: parseAsString.withDefault(''),
    order: parseAsString, // the default order is handled in the queryVariables because to support ['ascend', 'descend', undefined] cycle
    status: parseAsStringLiteral(['active', 'inactive']).withDefault('active'),
  });
  const { message } = App.useApp();

  const [emailForInfoModal, setEmailForInfoModal] = useState<string | null>(
    null,
  );
  const [isPendingInfoModalOpen, startInfoModalOpenTransition] =
    useTransition();
  const [isPendingSettingModalOpen, startSettingModalOpenTransition] =
    useTransition();
  const [emailForSettingModal, setEmailForSettingModal] = useState<
    string | null
  >(null);
  const [openCreateModal, setOpenCreateModal] = useState<boolean>(false);
  const [openBulkCreateModal, setOpenBulkCreateModal] =
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

  const statusFilter =
    queryParams.status === 'active'
      ? 'status == "active"'
      : 'status != "active"';

  const queryVariables = {
    first: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    filter: mergeFilterValues([queryParams.filter, statusFilter]),
    order: queryParams.order || '-created_at',
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.UserManagement',
  );

  const { supportedFields, exportCSV } = useCSVExport('users');

  const { user_nodes } = useLazyLoadQuery<UserManagementQuery>(
    graphql`
      query UserManagementQuery(
        $first: Int
        $offset: Int
        $filter: String
        $order: String
      ) {
        user_nodes(
          first: $first
          offset: $offset
          filter: $filter
          order: $order
        ) {
          count
          edges {
            node {
              id @required(action: THROW)
              email @required(action: THROW)
              ...BAIUserNodesFragment
              ...PurgeUsersModalFragment
              ...UpdateUsersModalFragment
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

  const [commitModifyUser] = useMutation<UserManagementModifyMutation>(graphql`
    mutation UserManagementModifyMutation(
      $email: String!
      $props: ModifyUserInput!
    ) {
      modify_user(email: $email, props: $props) {
        ok
        msg
      }
    }
  `);

  const renderEmailWithActions = (__: unknown, record: UserNodeInList) => {
    const isActive = record?.status === 'active';
    return (
      <BAINameActionCell
        title={record.email}
        showActions="always"
        actions={filterOutEmpty([
          {
            key: 'info',
            title: t('credential.UserDetail'),
            icon: <InfoCircleOutlined />,
            onClick: () => {
              startInfoModalOpenTransition(() => {
                setEmailForInfoModal(record?.email || null);
              });
            },
          },
          {
            key: 'edit',
            title: t('button.Edit'),
            icon: <SettingOutlined />,
            onClick: () => {
              startSettingModalOpenTransition(() => {
                setEmailForSettingModal(record?.email || null);
              });
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
              description: record.email,
              okText: isActive
                ? t('credential.Deactivate')
                : t('credential.Activate'),
              cancelText: t('button.Cancel'),
              okButtonProps: isActive ? { danger: true } : undefined,
              onConfirm: () => {
                return new Promise<void>((resolve) => {
                  commitModifyUser({
                    variables: {
                      email: record?.email || '',
                      props: {
                        status: isActive ? 'inactive' : 'active',
                      },
                    },
                    onCompleted: (res, errors) => {
                      const errorMessage = errors?.[0]?.message;
                      const notOkMessage =
                        res?.modify_user?.ok === false
                          ? res.modify_user.msg
                          : undefined;
                      if (res.modify_user?.ok === false || errors?.[0]) {
                        message.error(
                          notOkMessage ||
                            errorMessage ||
                            t('error.UnknownError'),
                        );
                        logger.error(res.modify_user?.msg, errorMessage);
                        resolve();
                        return;
                      }
                      message.success(
                        t('credential.StatusUpdatedSuccessfully'),
                      );
                      setSelectedUserList((prev) => {
                        return prev.filter(
                          (user) => user?.node?.id !== record?.id,
                        );
                      });
                      updateFetchKey();
                      resolve();
                    },
                    onError: (error) => {
                      message.error(error?.message);
                      logger.error(error);
                      resolve();
                    },
                  });
                });
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
                value: 'active',
              },
              {
                label: t('general.Inactive'),
                value: 'inactive',
              },
            ]}
          />
          <BAIPropertyFilter
            filterProperties={filterOutEmpty([
              {
                key: 'email',
                propertyLabel: t('general.E-Mail'),
                type: 'string',
              },
              {
                key: 'uuid',
                propertyLabel: 'ID',
                type: 'string',
                defaultOperator: '==',
                rule: {
                  message: 'Invalid UUID.',
                  validate: (value) => isValidUUID(value),
                },
              },
              {
                key: 'username',
                propertyLabel: t('credential.Name'),
                type: 'string',
              },
              {
                key: 'full_name',
                propertyLabel: t('credential.FullName'),
                type: 'string',
              },
              bailClient.supports('user-node-query-project-filter') && {
                key: 'project_name',
                propertyLabel: t('general.Project'),
                type: 'string',
              },
              {
                key: 'role',
                propertyLabel: t('credential.Role'),
                type: 'string',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  {
                    label: 'superadmin',
                    value: 'superadmin',
                  },
                  {
                    label: 'user',
                    value: 'user',
                  },
                ],
              },
              {
                key: 'resource_policy',
                propertyLabel: t('credential.ResourcePolicy'),
                type: 'string',
              },
              {
                key: 'description',
                propertyLabel: t('credential.Description'),
                type: 'string',
              },
              {
                key: 'status_info',
                propertyLabel: t('credential.StatusInfo'),
                type: 'string',
              },
              {
                key: 'need_password_change',
                propertyLabel: t('credential.DescRequirePasswordChange'),
                type: 'boolean',
              },
              {
                key: 'totp_activated',
                propertyLabel: t('credential.2FAEnabled'),
                type: 'boolean',
              },
              {
                key: 'sudo_session_enabled',
                propertyLabel: t('credential.EnableSudoSession'),
                type: 'boolean',
              },
            ])}
            value={queryParams.filter || undefined}
            onChange={(value) => {
              setQueryParams({ filter: value || '' });
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
              {queryParams.status === 'inactive' && (
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
            <Button
              type="primary"
              icon={<PlusIcon />}
              onClick={() => {
                setOpenCreateModal(true);
              }}
            >
              {t('credential.CreateUser')}
            </Button>
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
      <BAIUserNodes
        usersFrgmt={filterOutNullAndUndefined(_.map(user_nodes?.edges, 'node'))}
        customizeColumns={(baseColumns) => [
          {
            ...baseColumns[0],
            render: renderEmailWithActions,
          },
          ...baseColumns.slice(1),
        ]}
        scroll={{ x: 'max-content' }}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: user_nodes?.count || 0,
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
            const userNodes = _.compact(user_nodes?.edges);
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
                    status: [queryParams.status],
                  }).catch((err) => {
                    message.error(t('general.ErrorOccurred'));
                    logger.error(err);
                  });
                },
              }
            : undefined
        }
      />
      <UserInfoModal
        userEmail={emailForInfoModal || ''}
        open={!!emailForInfoModal || isPendingInfoModalOpen}
        loading={isPendingInfoModalOpen}
        onRequestClose={() => {
          setEmailForInfoModal(null);
        }}
      />
      <UserSettingModal
        userEmail={emailForSettingModal}
        open={
          !!emailForSettingModal ||
          isPendingSettingModalOpen ||
          openCreateModal ||
          openBulkCreateModal
        }
        bulkCreate={openBulkCreateModal}
        loading={isPendingSettingModalOpen}
        onRequestClose={(success) => {
          setEmailForSettingModal(null);
          setOpenCreateModal(false);
          setOpenBulkCreateModal(false);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <BAIUnmountAfterClose>
        <PurgeUsersModal
          open={openPurgeUsersModal}
          onOk={() => {
            togglePurgeUsersModal();
            setSelectedUserList([]);
            updateFetchKey();
          }}
          onCancel={() => {
            togglePurgeUsersModal();
          }}
          usersFrgmt={_.compact(selectedUserList.map((user) => user?.node))}
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
          usersFrgmt={_.compact(
            user_nodes?.edges
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
          userFrgmt={_.compact(selectedUserList.map((user) => user?.node))}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default UserManagement;
