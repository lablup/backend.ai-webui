import { KeypairResourcePolicyListMutation } from '../__generated__/KeypairResourcePolicyListMutation.graphql';
import {
  KeypairResourcePolicyListQuery,
  KeypairResourcePolicyListQuery$data,
} from '../__generated__/KeypairResourcePolicyListQuery.graphql';
import { KeypairResourcePolicySettingModalFragment$key } from '../__generated__/KeypairResourcePolicySettingModalFragment.graphql';
import {
  localeCompare,
  numberSorterWithInfinityValue,
  filterEmptyItem,
} from '../helper';
import { SIGNED_32BIT_MAX_INT } from '../helper/const-vars';
import { exportCSVWithFormattingRules } from '../helper/csv-util';
import { useSuspendedBackendaiClient, useUpdatableState } from '../hooks';
import { useHiddenColumnKeysSetting } from '../hooks/useHiddenColumnKeysSetting';
import Flex from './Flex';
import KeypairResourcePolicySettingModal from './KeypairResourcePolicySettingModal';
import ResourceNumber from './ResourceNumber';
import TableColumnsSettingModal from './TableColumnsSettingModal';
import {
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useToggle } from 'ahooks';
import {
  App,
  Button,
  Dropdown,
  Space,
  Table,
  Tag,
  theme,
  Typography,
} from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType, ColumnType } from 'antd/es/table';
import _ from 'lodash';
import React, { Suspense, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type KeypairResourcePolicies = NonNullable<
  KeypairResourcePolicyListQuery$data['keypair_resource_policies']
>[number];

interface KeypairResourcePolicyListProps {}

const KeypairResourcePolicyList: React.FC<KeypairResourcePolicyListProps> = (
  props,
) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  const { message, modal } = App.useApp();

  const [keypairResourcePolicyFetchKey, updateKeypairResourcePolicyFetchKey] =
    useUpdatableState('initial-fetch');
  const [isRefetchPending, startRefetchTransition] = useTransition();
  const [visibleColumnSettingModal, { toggle: toggleColumnSettingModal }] =
    useToggle();
  const [isCreatingPolicySetting, setIsCreatingPolicySetting] = useState(false);
  const [inFlightResourcePolicyName, setInFlightResourcePolicyName] =
    useState<string>();
  const [editingKeypairResourcePolicy, setEditingKeypairResourcePolicy] =
    useState<KeypairResourcePolicySettingModalFragment$key | null>();

  const baiClient = useSuspendedBackendaiClient();

  const { keypair_resource_policies } =
    useLazyLoadQuery<KeypairResourcePolicyListQuery>(
      graphql`
        query KeypairResourcePolicyListQuery {
          keypair_resource_policies {
            name
            total_resource_slots
            max_session_lifetime
            max_concurrent_sessions
            max_containers_per_session
            idle_timeout
            allowed_vfolder_hosts
            max_pending_session_count @since(version: "24.03.4")
            max_concurrent_sftp_sessions @since(version: "24.03.4")
            ...KeypairResourcePolicySettingModalFragment
          }
        }
      `,
      {},
      {
        fetchPolicy:
          keypairResourcePolicyFetchKey === 'initial-fetch'
            ? 'store-and-network'
            : 'network-only',
        fetchKey: keypairResourcePolicyFetchKey,
      },
    );

  const [commitDelete, isInflightDelete] =
    useMutation<KeypairResourcePolicyListMutation>(graphql`
      mutation KeypairResourcePolicyListMutation($name: String!) {
        delete_keypair_resource_policy(name: $name) {
          ok
          msg
        }
      }
    `);

  const columns: ColumnsType<KeypairResourcePolicies> = filterEmptyItem([
    {
      title: t('resourcePolicy.Name'),
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      sorter: (a, b) => localeCompare(a?.name, b?.name),
    },
    {
      title: t('resourcePolicy.Resources'),
      dataIndex: 'total_resource_slots',
      key: 'total_resource_slots',
      render: (text, row) => (
        <Flex gap={'xxs'}>
          {!_.isEmpty(JSON.parse(row?.total_resource_slots || '{}'))
            ? _.map(
                JSON.parse(row?.total_resource_slots || '{}'),
                (value, type) => {
                  return (
                    <ResourceNumber
                      key={type}
                      // @ts-ignore
                      type={type}
                      value={_.toString(value)}
                    />
                  );
                },
              )
            : '-'}
        </Flex>
      ),
    },
    {
      title: t('resourcePolicy.Concurrency'),
      dataIndex: 'max_concurrent_sessions',
      key: 'max_concurrent_sessions',
      sorter: (a, b) =>
        a?.max_concurrent_sessions && b?.max_concurrent_sessions
          ? a.max_concurrent_sessions - b.max_concurrent_sessions
          : 1,
      render: (text) => (text ? text : '∞'),
    },
    {
      title: t('resourcePolicy.ClusterSize'),
      dataIndex: 'max_containers_per_session',
      key: 'max_containers_per_session',
      sorter: (a, b) =>
        a?.max_containers_per_session && b?.max_containers_per_session
          ? a.max_containers_per_session - b.max_containers_per_session
          : 1,
      render: (text) => (text === SIGNED_32BIT_MAX_INT ? '∞' : text),
    },
    {
      title: t('resourcePolicy.IdleTimeout'),
      dataIndex: 'idle_timeout',
      key: 'idle_timeout',
      sorter: (a, b) =>
        a?.idle_timeout && b?.idle_timeout
          ? a.idle_timeout - b.idle_timeout
          : 1,
      render: (text) => (text ? text : '∞'),
    },
    {
      title: t('session.MaxSessionLifetime'),
      dataIndex: 'max_session_lifetime',
      key: 'max_session_lifetime',
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_session_lifetime,
          b?.max_session_lifetime,
          0,
        ),
      render: (text) => (text ? text : '∞'),
    },
    {
      title: t('resourcePolicy.StorageNodes'),
      dataIndex: 'allowed_vfolder_hosts',
      key: 'allowed_vfolder_hosts',
      render: (text, row) => {
        const allowedVFolderHosts = baiClient?.supports(
          'fine-grained-storage-permissions',
        )
          ? _.keys(JSON.parse(row?.allowed_vfolder_hosts || '{}'))
          : JSON.parse(row?.allowed_vfolder_hosts || '{}');
        return (
          <>
            {_.map(allowedVFolderHosts, (host) => (
              <Tag key={host}>{host}</Tag>
            ))}
          </>
        );
      },
    },
    baiClient?.supports('max-pending-session-count') && {
      title: t('resourcePolicy.MaxPendingSessionCount'),
      dataIndex: 'max_pending_session_count',
      key: 'max_pending_session_count',
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_pending_session_count,
          b?.max_pending_session_count,
          0,
        ),
      render: (text) => (text ? text : '∞'),
    },
    baiClient?.supports('max-concurrent-sftp-sessions') && {
      title: t('resourcePolicy.MaxConcurrentSFTPSessions'),
      dataIndex: 'max_concurrent_sftp_sessions',
      key: 'max_concurrent_sftp_sessions',
      sorter: (a, b) =>
        numberSorterWithInfinityValue(
          a?.max_concurrent_sftp_sessions,
          b?.max_concurrent_sftp_sessions,
          0,
        ),
      render: (text) => (text ? text : '∞'),
    },
    {
      title: t('general.Control'),
      key: 'control',
      fixed: 'right',
      render: (text, row) => (
        <Flex direction="row" align="stretch">
          <Button
            type="text"
            size="large"
            icon={<SettingOutlined />}
            style={{
              color: token.colorInfo,
            }}
            onClick={() => {
              setEditingKeypairResourcePolicy(row);
            }}
          />
          <Button
            type="text"
            size="large"
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
                row?.name + keypairResourcePolicyFetchKey
            }
            disabled={
              isInflightDelete &&
              inFlightResourcePolicyName !==
                row?.name + keypairResourcePolicyFetchKey
            }
            onClick={() => {
              modal.confirm({
                title: t('resourcePolicy.DeletePolicy'),
                content: (
                  <Flex direction="column" align="stretch">
                    <Flex gap={'xxs'}>
                      <Typography.Text>
                        {t('resourcePolicy.DeletePolicyDescription')}
                      </Typography.Text>
                      <Typography.Text strong>{row?.name}</Typography.Text>
                    </Flex>
                    <br />
                    <Typography.Text type="danger">
                      {t('dialog.warning.CannotBeUndone')}
                    </Typography.Text>
                  </Flex>
                ),
                okButtonProps: {
                  danger: true,
                },
                okText: t('button.Delete'),
                onOk: () => {
                  if (row?.name) {
                    setInFlightResourcePolicyName(
                      row.name + keypairResourcePolicyFetchKey,
                    );
                    commitDelete({
                      variables: {
                        name: row.name,
                      },
                      onCompleted: (res, errors) => {
                        if (!res?.delete_keypair_resource_policy?.ok) {
                          message.error(
                            res?.delete_keypair_resource_policy?.msg,
                          );
                          return;
                        }
                        if (errors && errors?.length > 0) {
                          const errorMsgList = _.map(
                            errors,
                            (error) => error.message,
                          );
                          for (const error of errorMsgList) {
                            message.error(error);
                          }
                        } else {
                          startRefetchTransition(() =>
                            updateKeypairResourcePolicyFetchKey(),
                          );
                          message.success(
                            t('resourcePolicy.SuccessfullyDeleted'),
                          );
                        }
                      },
                      onError(err) {
                        message.error(err?.message);
                      },
                    });
                  }
                },
              });
            }}
          />
        </Flex>
      ),
    },
  ]);

  const [hiddenColumnKeys, setHiddenColumnKeys] = useHiddenColumnKeysSetting(
    'KeypairResourcePolicyList',
  );

  const handleExportCSV = () => {
    if (!keypair_resource_policies) {
      message.error(t('resourcePolicy.NoDataToExport'));
      return;
    }

    const columnKeys = _.without(
      _.map(columns, (column) => _.toString(column.key)),
      'control',
    );
    const responseData = _.map(keypair_resource_policies, (policy) => {
      return _.pick(
        policy,
        columnKeys.map((key) => key as keyof KeypairResourcePolicies),
      );
    });

    exportCSVWithFormattingRules(
      responseData as KeypairResourcePolicies[],
      'keypair_resource_policies',
      {
        total_resource_slots: (text) =>
          _.isEmpty(text) ? '-' : JSON.stringify(text),
        max_concurrent_sessions: (text) => (text ? text : '-'),
        max_containers_per_session: (text) =>
          text === SIGNED_32BIT_MAX_INT ? '∞' : text,
        idle_timeout: (text) => (text ? text : '-'),
        max_session_lifetime: (text) => (text ? text : '-'),
        allowed_vfolder_hosts: (text) =>
          _.isEmpty(text) ? '-' : _.keys(JSON.parse(text)).join(', '),
      },
    );
  };

  return (
    <Flex direction="column" align="stretch" {...props}>
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
                  updateKeypairResourcePolicyFetchKey(),
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
        columns={
          _.filter(
            columns,
            (column) => !_.includes(hiddenColumnKeys, _.toString(column?.key)),
          ) as ColumnType<AnyObject>[]
        }
        dataSource={
          keypair_resource_policies as readonly AnyObject[] | undefined
        }
        rowKey="name"
        scroll={{ x: 'max-content' }}
        pagination={false}
        showSorterTooltip={false}
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
            toggleColumnSettingModal();
          }}
        />
      </Flex>
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
      <Suspense>
        <KeypairResourcePolicySettingModal
          existingPolicyNames={_.map(
            keypair_resource_policies,
            (policy) => policy?.name || '',
          )}
          open={!!editingKeypairResourcePolicy || isCreatingPolicySetting}
          keypairResourcePolicyFrgmt={editingKeypairResourcePolicy || null}
          onRequestClose={(success) => {
            setEditingKeypairResourcePolicy(null);
            setIsCreatingPolicySetting(false);
            if (success) {
              startRefetchTransition(() => {
                updateKeypairResourcePolicyFetchKey();
              });
            }
          }}
        />
      </Suspense>
    </Flex>
  );
};

export default KeypairResourcePolicyList;
