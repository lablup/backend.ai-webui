import {
  bytesToGB,
  exportCSVWithFormattingRules,
  filterEmptyItem,
  localeCompare,
  numberSorterWithInfinityValue,
} from '../helper';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import Flex from './Flex';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import UserResourcePolicySettingModal from './UserResourcePolicySettingModal';
import { UserResourcePolicyListMutation } from './__generated__/UserResourcePolicyListMutation.graphql';
import {
  UserResourcePolicyListQuery,
  UserResourcePolicyListQuery$data,
} from './__generated__/UserResourcePolicyListQuery.graphql';
import { UserResourcePolicySettingModalFragment$key } from './__generated__/UserResourcePolicySettingModalFragment.graphql';
import {
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useLocalStorageState } from 'ahooks';
import { App, Button, Dropdown, Popconfirm, Space, Table, theme } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnType } from 'antd/es/table';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

type UserResourcePolicies = NonNullable<
  UserResourcePolicyListQuery$data['user_resource_policies']
>[number];

interface UserResourcePolicyListProps {}

const UserResourcePolicyList: React.FC<UserResourcePolicyListProps> = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [userResourcePolicyFetchKey, updateUserResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [isOpenColumnsSetting, setIsOpenColumnsSetting] = useState(false);
  const [inFlightResourcePolicyName, setInFlightResourcePolicyName] =
    useState<string>();
  const [editingUserResourcePolicy, setEditingUserResourcePolicy] =
    useState<UserResourcePolicySettingModalFragment$key | null>();

  const baiClient = useSuspendedBackendaiClient();
  const supportMaxVfolderCount = baiClient?.supports(
    'max-vfolder-count-in-user-and-project-resource-policy',
  );
  const supportMaxQuotaScopeSize = baiClient?.supports('max-quota-scope-size');
  const supportMaxSessionCountPerModelSession = baiClient?.supports(
    'max-session-count-per-model-session',
  );
  const supportMaxCustomizedImageCount = baiClient?.supports(
    'max-customized-image-count',
  );

  const { user_resource_policies } =
    useLazyLoadQuery<UserResourcePolicyListQuery>(
      graphql`
        query UserResourcePolicyListQuery {
          user_resource_policies {
            id
            name
            created_at
            # follows version of https://github.com/lablup/backend.ai/pull/1993
            # --------------- START --------------------
            max_vfolder_count @since(version: "23.09.6")
            max_session_count_per_model_session @since(version: "23.09.10")
            max_quota_scope_size @since(version: "23.09.2")
            # ---------------- END ---------------------
            max_customized_image_count @since(version: "24.03.0")
            ...UserResourcePolicySettingModalFragment
          }
        }
      `,
      {},
      {
        fetchPolicy:
          userResourcePolicyFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey: userResourcePolicyFetchKey,
      },
    );
  const [commitDelete, isInflightDelete] =
    useMutation<UserResourcePolicyListMutation>(graphql`
      mutation UserResourcePolicyListMutation($name: String!) {
        delete_user_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns = filterEmptyItem<ColumnType<UserResourcePolicies>>([
    {
      title: t('resourcePolicy.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
    },
    supportMaxVfolderCount && {
      title: t('resourcePolicy.MaxVFolderCount'),
      dataIndex: 'max_vfolder_count',
      key: 'max_vfolder_count',
      render: (text) => (_.toNumber(text) === 0 ? '∞' : text),
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_vfolder_count,
          b?.max_vfolder_count,
          0,
        ),
    },
    supportMaxSessionCountPerModelSession && {
      title: t('resourcePolicy.MaxSessionCountPerModelSession'),
      dataIndex: 'max_session_count_per_model_session',
      key: 'max_session_count_per_model_session',
      sorter: (a, b) =>
        (a?.max_session_count_per_model_session ?? 0) -
        (b?.max_session_count_per_model_session ?? 0),
    },
    supportMaxQuotaScopeSize && {
      title: t('resourcePolicy.MaxQuotaScopeSize'),
      dataIndex: 'max_quota_scope_size',
      key: 'max_quota_scope_size',
      render: (text) => (text === -1 ? '∞' : bytesToGB(text)),
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_quota_scope_size,
          b?.max_quota_scope_size,
          -1,
        ),
    },
    supportMaxCustomizedImageCount && {
      title: t('resourcePolicy.MaxCustomizedImageCount'),
      key: 'max_customized_image_count',
      dataIndex: 'max_customized_image_count',
      sorter: (a, b) =>
        (a?.max_customized_image_count ?? 0) -
        (b?.max_customized_image_count ?? 0),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => localeCompare(a?.id, b?.id),
    },
    {
      title: t('resourcePolicy.CreatedAt'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => dayjs(text).format('lll'),
      sorter: (a, b) => localeCompare(a?.created_at, b?.created_at),
    },
    {
      title: t('general.Control'),
      fixed: 'right',
      key: 'control',
      render: (text: any, row: UserResourcePolicies) => (
        <Flex direction="row" align="stretch">
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{
              color: token.colorInfo,
            }}
            onClick={() => {
              setEditingUserResourcePolicy(row);
            }}
          />
          <Popconfirm
            title={t('dialog.ask.DoYouWantToProceed')}
            description={t('dialog.warning.CannotBeUndone')}
            okType="danger"
            okText={t('button.Delete')}
            onConfirm={() => {
              if (row?.name) {
                setInFlightResourcePolicyName(
                  row.name + userResourcePolicyFetchKey,
                );
                commitDelete({
                  variables: {
                    name: row.name,
                  },
                  onCompleted: (res, errors) => {
                    if (!res?.delete_user_resource_policy?.ok) {
                      message.error(res?.delete_user_resource_policy?.msg);
                      return;
                    }
                    if (errors && errors.length > 0) {
                      const errorMsgList = errors.map((error) => error.message);
                      for (const error of errorMsgList) {
                        message.error(error, 2.5);
                      }
                      return;
                    }
                    startRefetchTransition(() =>
                      updateUserResourcePolicyFetchKey(),
                    );
                    message.success(t('resourcePolicy.SuccessfullyDeleted'));
                  },
                  onError(err) {
                    message.error(err?.message);
                  },
                });
              }
            }}
          >
            <Button
              type="text"
              icon={
                <DeleteOutlined
                  style={{
                    color: token.colorError,
                  }}
                />
              }
              loading={
                isInflightDelete &&
                inFlightResourcePolicyName ===
                  row?.name + userResourcePolicyFetchKey
              }
              disabled={
                isInflightDelete &&
                inFlightResourcePolicyName !==
                  row?.name + userResourcePolicyFetchKey
              }
            />
          </Popconfirm>
        </Flex>
      ),
    },
  ]);

  const [displayedColumnKeys, setDisplayedColumnKeys] = useLocalStorageState(
    'backendaiwebui.UserResourcePolicyList.displayedColumnKeys',
    {
      defaultValue: columns.map((column) => _.toString(column.key)),
    },
  );

  const handleExportCSV = () => {
    if (!user_resource_policies || !displayedColumnKeys) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }

    const columnKeys = _.without(displayedColumnKeys, 'control');
    const responseData = _.map(user_resource_policies, (policy) => {
      return _.pick(
        policy,
        columnKeys.map((key) => key as keyof UserResourcePolicies),
      );
    });

    exportCSVWithFormattingRules(
      responseData as UserResourcePolicies[],
      {
        max_vfolder_count: (text) => (_.toNumber(text) === 0 ? '-' : text),
        max_quota_scope_size: (text) => (text === -1 ? '-' : bytesToGB(text)),
      },
      'user-resource-policies',
    );
  };

  return (
    <Flex direction="column" align="stretch">
      <Flex
        direction="row"
        justify="between"
        wrap="wrap"
        gap={'xs'}
        style={{
          padding: token.paddingContentVertical,
          paddingLeft: token.paddingContentHorizontalSM,
          paddingRight: token.paddingContentHorizontalSM,
        }}
      >
        <Flex direction="column" align="start">
          <Dropdown
            menu={{
              items: [
                {
                  key: 'exportCSV',
                  label: t('resourcePolicy.ExportCSV'),
                  onClick: () => {
                    handleExportCSV();
                  },
                },
              ],
            }}
          >
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={(e) => e.preventDefault()}
            >
              <Space style={{ color: token.colorLinkHover }}>
                {t('resourcePolicy.Tools')}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
        </Flex>
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefetchPending}
              onClick={() => {
                startRefetchTransition(() =>
                  updateUserResourcePolicyFetchKey(),
                );
              }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsCreatingPolicySetting(true);
              }}
            >
              {t('button.Create')}
            </Button>
          </Flex>
        </Flex>
      </Flex>
      <Table
        rowKey="id"
        showSorterTooltip={false}
        columns={
          _.filter(columns, (column) =>
            displayedColumnKeys?.includes(_.toString(column.key)),
          ) as ColumnType<AnyObject>[]
        }
        dataSource={user_resource_policies as readonly AnyObject[] | undefined}
        scroll={{ x: 'max-content' }}
        pagination={false}
      />
      <Flex
        justify="end"
        style={{
          padding: token.paddingXXS,
        }}
      >
        <Button
          type="text"
          icon={<SettingOutlined />}
          onClick={() => {
            setIsOpenColumnsSetting(true);
          }}
        />
      </Flex>
      <TableColumnsSettingModal
        open={isOpenColumnsSetting}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setDisplayedColumnKeys(values?.selectedColumnKeys);
          setIsOpenColumnsSetting(false);
        }}
        columns={columns}
        displayedColumnKeys={displayedColumnKeys ? displayedColumnKeys : []}
      />
      <UserResourcePolicySettingModal
        existingPolicyNames={_.map(user_resource_policies, 'name')}
        open={!!editingUserResourcePolicy || isCreatingPolicySetting}
        userResourcePolicyFrgmt={editingUserResourcePolicy || null}
        onRequestClose={(success) => {
          if (success) {
            startRefetchTransition(() => updateUserResourcePolicyFetchKey());
          }
          setEditingUserResourcePolicy(null);
          setIsCreatingPolicySetting(false);
        }}
      />
    </Flex>
  );
};

export default UserResourcePolicyList;
