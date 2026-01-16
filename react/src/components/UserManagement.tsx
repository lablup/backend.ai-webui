import { UserManagementModifyMutation } from '../__generated__/UserManagementModifyMutation.graphql';
import { UserManagementQuery } from '../__generated__/UserManagementQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIRadioGroup from './BAIRadioGroup';
import UserInfoModal from './UserInfoModal';
import UserSettingModal from './UserSettingModal';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, theme, Popconfirm, App } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIFlex,
  BAIPropertyFilter,
  mergeFilterValues,
  useBAILogger,
  BAIColumnType,
  UserNodeInList,
  BAIFetchKeyButton,
  isValidUUID,
  BAIUserNodes,
  useFetchKey,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import _ from 'lodash';
import { BanIcon, EditIcon, PlusIcon, UndoIcon } from 'lucide-react';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import React, { useState, useTransition, useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useBAIPaginationOptionStateOnSearchParam } from 'src/hooks/reactPaginationQueryOptions';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

interface UserManagementProps {}

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

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 10,
  });

  const [pendingUserId, setPendingUserId] = useState<string>();

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

  const [commitModifyUser, isInFlightCommitModifyUser] =
    useMutation<UserManagementModifyMutation>(graphql`
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

  const controlColumn: BAIColumnType<UserNodeInList> = {
    key: 'control',
    title: t('general.Control'),
    fixed: true,
    required: true,
    render: (__, record) => {
      const isActive = record?.status === 'active';
      return (
        <BAIFlex gap={token.marginXXS}>
          <Button
            type="text"
            title={t('credential.UserDetail')}
            icon={<InfoCircleOutlined style={{ color: token.colorInfo }} />}
            onClick={() => {
              startInfoModalOpenTransition(() => {
                setEmailForInfoModal(record?.email || null);
              });
            }}
          />
          <Button
            type="text"
            title={t('button.Edit')}
            icon={<EditIcon style={{ color: token.colorInfo }} />}
            onClick={() => {
              startSettingModalOpenTransition(() => {
                setEmailForSettingModal(record?.email || null);
              });
            }}
          />
          <Popconfirm
            title={
              isActive
                ? t('credential.DeactivateUser')
                : t('credential.ActivateUser')
            }
            placement="left"
            okType={isActive ? 'danger' : 'primary'}
            okText={
              isActive ? t('credential.Deactivate') : t('credential.Activate')
            }
            description={record?.email}
            onConfirm={() => {
              setPendingUserId(record?.id || '');
              commitModifyUser({
                variables: {
                  email: record?.email || '',
                  props: {
                    status: isActive ? 'inactive' : 'active',
                  },
                },
                onCompleted: () => {
                  message.success(t('credential.StatusUpdatedSuccessfully'));
                  updateFetchKey();
                },
                onError: (error) => {
                  message.error(error?.message);
                  logger.error(error);
                },
              });
            }}
          >
            <Button
              title={
                isActive ? t('credential.Deactivate') : t('credential.Activate')
              }
              type="text"
              danger={isActive}
              icon={isActive ? <BanIcon /> : <UndoIcon />}
              disabled={
                isInFlightCommitModifyUser && pendingUserId !== record?.id
              }
              loading={
                isInFlightCommitModifyUser && pendingUserId === record?.id
              }
            />
          </Popconfirm>
        </BAIFlex>
      );
    },
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
          <BAIFetchKeyButton
            loading={deferredFetchKey !== fetchKey}
            value={fetchKey}
            onChange={updateFetchKey}
          />
          <Button
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setOpenCreateModal(true);
            }}
          >
            {t('credential.CreateUser')}
          </Button>
        </BAIFlex>
      </BAIFlex>
      <BAIUserNodes
        usersFrgmt={filterOutNullAndUndefined(_.map(user_nodes?.edges, 'node'))}
        customizeColumns={(baseColumns) => [
          baseColumns[0],
          controlColumn,
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
            }
          },
        }}
        onChangeOrder={(nextOrder) => {
          setQueryParams({ order: nextOrder });
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
          !!emailForSettingModal || isPendingSettingModalOpen || openCreateModal
        }
        loading={isPendingSettingModalOpen}
        onRequestClose={(success) => {
          setEmailForSettingModal(null);
          setOpenCreateModal(false);
          if (success) {
            updateFetchKey();
          }
        }}
      />
    </BAIFlex>
  );
};

export default UserManagement;
