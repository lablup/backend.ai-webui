/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { UserResourcePolicyListMutation } from '../__generated__/UserResourcePolicyListMutation.graphql';
import {
  UserResourcePolicyListQuery,
  UserResourcePolicyListQuery$data,
} from '../__generated__/UserResourcePolicyListQuery.graphql';
import { UserResourcePolicySettingModalFragment$key } from '../__generated__/UserResourcePolicySettingModalFragment.graphql';
import {
  bytesToGB,
  localeCompare,
  numberSorterWithInfinityValue,
} from '../helper';
import { exportCSVWithFormattingRules } from '../helper/csv-util';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import UserResourcePolicySettingModal from './UserResourcePolicySettingModal';
import {
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import { App, Button, Dropdown, Popconfirm, theme, Tooltip } from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  useUpdatableState,
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { EllipsisIcon } from 'lucide-react';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type UserResourcePolicies = NonNullable<
  NonNullable<
    UserResourcePolicyListQuery$data['user_resource_policies']
  >[number]
>;

interface UserResourcePolicyListProps {}

const UserResourcePolicyList: React.FC<UserResourcePolicyListProps> = () => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { message } = App.useApp();

  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [userResourcePolicyFetchKey, updateUserResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [inFlightResourcePolicyName, setInFlightResourcePolicyName] =
    useState<string>();
  const [editingUserResourcePolicy, setEditingUserResourcePolicy] =
    useState<UserResourcePolicySettingModalFragment$key | null>();

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

  const columns = filterOutEmpty<ColumnType<UserResourcePolicies>>([
    {
      title: t('resourcePolicy.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
    },
    {
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
    {
      title: t('resourcePolicy.MaxSessionCountPerModelSession'),
      dataIndex: 'max_session_count_per_model_session',
      key: 'max_session_count_per_model_session',
      sorter: (a, b) =>
        (a?.max_session_count_per_model_session ?? 0) -
        (b?.max_session_count_per_model_session ?? 0),
    },
    {
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
    {
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
      render: (_text: any, row: UserResourcePolicies) => (
        <BAIFlex direction="row" align="stretch">
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
                        message.error(error);
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
        </BAIFlex>
      ),
    },
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'UserResourcePolicyList',
  );

  const handleExportCSV = () => {
    if (
      !user_resource_policies ||
      user_resource_policies.length === hiddenColumnKeys?.length
    ) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }

    const columnKeys = _.without(
      _.map(columns, (column) => _.toString(column.key)),
      'control',
    );
    const responseData = _.map(user_resource_policies, (policy) => {
      return _.pick(
        policy,
        columnKeys.map((key) => key as keyof UserResourcePolicies),
      );
    });

    exportCSVWithFormattingRules(
      responseData as UserResourcePolicies[],
      'user-resource-policies',
      {
        max_vfolder_count: (text) => (_.toNumber(text) === 0 ? '-' : text),
        max_quota_scope_size: (text) => (text === -1 ? '-' : bytesToGB(text)),
      },
    );
  };

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" justify="end" wrap="wrap" gap={'xs'}>
        <BAIFlex
          direction="row"
          gap={'xs'}
          wrap="wrap"
          style={{ flexShrink: 1 }}
        >
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
            trigger={['click']}
          >
            <Button icon={<EllipsisIcon />} />
          </Dropdown>
          <BAIFlex gap={'xs'}>
            <Tooltip title={t('button.Refresh')}>
              <Button
                icon={<ReloadOutlined />}
                loading={isRefetchPending}
                onClick={() => {
                  startRefetchTransition(() =>
                    updateUserResourcePolicyFetchKey(),
                  );
                }}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setIsCreatingPolicySetting(true);
              }}
            >
              {t('button.Create')}
            </Button>
          </BAIFlex>
        </BAIFlex>
      </BAIFlex>
      <BAITable
        rowKey="id"
        showSorterTooltip={false}
        columns={_.filter(
          columns,
          (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
        )}
        dataSource={filterOutNullAndUndefined(user_resource_policies)}
        scroll={{ x: 'max-content' }}
        pagination={{
          extraContent: (
            <Button
              type="text"
              icon={<SettingOutlined />}
              onClick={() => {
                toggleColumnSettingModal();
              }}
            />
          ),
        }}
      />
      <TableColumnsSettingModal
        open={visibleColumnSettingModal}
        onRequestClose={(values) => {
          values?.selectedColumnKeys &&
            setHiddenColumnKeys(
              _.difference(
                columns.map((column) => _.toString(column.key)),
                values?.selectedColumnKeys,
              ),
            );
          toggleColumnSettingModal();
        }}
        columns={columns}
        hiddenColumnKeys={hiddenColumnKeys}
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
    </BAIFlex>
  );
};

export default UserResourcePolicyList;
