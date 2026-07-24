/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AdminUserCredentialListDeleteMutation } from '../__generated__/AdminUserCredentialListDeleteMutation.graphql';
import { AdminUserCredentialListModifyMutation } from '../__generated__/AdminUserCredentialListModifyMutation.graphql';
import {
  AdminUserCredentialListQuery,
  AdminUserCredentialListQuery$data,
  AdminUserCredentialListQuery$variables,
} from '../__generated__/AdminUserCredentialListQuery.graphql';
import { KeypairSettingModalFragment$key } from '../__generated__/KeypairSettingModalFragment.graphql';
import { useBAIPaginationOptionStateOnSearchParam } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import KeypairInfoModal from './KeypairInfoModal';
import KeypairSettingModal from './KeypairSettingModal';
import {
  DeleteFilled,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { App, Button, Tag, Tooltip, Typography, theme } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIButton,
  BAITable,
  BAIFlex,
  BAIPropertyFilter,
  BAINameActionCell,
  BAIDeleteConfirmModal,
  BAISelectionLabel,
  useBAILogger,
  useUpdatableState,
  BAIText,
  INITIAL_FETCH_KEY,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { BanIcon, PlusIcon, SquarePenIcon, UndoIcon } from 'lucide-react';
import { parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { useDeferredValue, useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

type Keypair = NonNullable<
  NonNullable<
    AdminUserCredentialListQuery$data['keypair_list']
  >['items'][number]
>;

const AdminUserCredentialList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();

  const [action, setAction] = useQueryState('action', parseAsString);

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [queryParams, setQueryParams] = useQueryStates(
    {
      activeType: parseAsString.withDefault('active'),
      order: parseAsString,
      filter: parseAsString,
    },
    { history: 'replace' },
  );

  const [keypairSettingModalFrgmt, setKeypairSettingModalFrgmt] =
    useState<KeypairSettingModalFragment$key | null>(null);
  const [openUserKeypairSettingModal, setOpenUserKeypairSettingModal] =
    useState(false);
  const [keypairInfoModalFrgmt, setKeypairInfoModalFrgmt] = useState<any>(null);
  const [isPendingInfoModalOpen, startInfoModalOpenTransition] =
    useTransition();
  const [isPendingSettingModalOpen, startSettingModalOpenTransition] =
    useTransition();
  const [deletingKeypair, setDeletingKeypair] = useState<Keypair | null>(null);
  const [selectedKeypairs, setSelectedKeypairs] = useState<Keypair[]>([]);
  const [isBulkDeactivating, setIsBulkDeactivating] = useState(false);

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParam({
    current: 1,
    pageSize: 20,
  });

  const queryVariables: AdminUserCredentialListQuery$variables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    is_active: queryParams.activeType === 'active',
    filter: queryParams.filter,
    order: queryParams.order,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { keypair_list } = useLazyLoadQuery<AdminUserCredentialListQuery>(
    graphql`
      query AdminUserCredentialListQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $order: String
        $domain_name: String
        $email: String
        $is_active: Boolean
      ) {
        keypair_list(
          limit: $limit
          offset: $offset
          filter: $filter
          order: $order
          domain_name: $domain_name
          email: $email
          is_active: $is_active
        ) {
          items {
            id
            user_id
            access_key
            is_admin
            resource_policy
            created_at
            rate_limit
            num_queries
            concurrency_used @since(version: "24.09.0")

            ...KeypairSettingModalFragment
            ...KeypairInfoModalFragment
          }
          total_count
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

  const [commitModifyKeypair] =
    useMutation<AdminUserCredentialListModifyMutation>(graphql`
      mutation AdminUserCredentialListModifyMutation(
        $access_key: String!
        $props: ModifyKeyPairInput!
      ) {
        modify_keypair(access_key: $access_key, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitDeleteKeypair] =
    useMutation<AdminUserCredentialListDeleteMutation>(graphql`
      mutation AdminUserCredentialListDeleteMutation($access_key: String!) {
        delete_keypair(access_key: $access_key) {
          ok
          msg
        }
      }
    `);

  const handleBulkDeactivate = () => {
    modal.confirm({
      title: t('credential.BulkDeactivateCredentials'),
      content: t('credential.BulkDeactivateCredentialsDescription', {
        count: selectedKeypairs.length,
      }),
      okButtonProps: {
        danger: true,
      },
      okText: t('credential.Deactivate'),
      cancelText: t('button.Cancel'),
      onOk: async () => {
        setIsBulkDeactivating(true);
        const results = await Promise.allSettled(
          selectedKeypairs.map(
            (keypair) =>
              new Promise<void>((resolve, reject) => {
                commitModifyKeypair({
                  variables: {
                    access_key: keypair.access_key ?? '',
                    props: {
                      is_active: false,
                    },
                  },
                  onCompleted: (res, errors) => {
                    if (!res?.modify_keypair?.ok || errors) {
                      reject(new Error(res?.modify_keypair?.msg ?? ''));
                      return;
                    }
                    resolve();
                  },
                  onError: (error) => {
                    logger.error(error);
                    reject(error);
                  },
                });
              }),
          ),
        );
        setIsBulkDeactivating(false);
        const failedCount = results.filter(
          (r) => r.status === 'rejected',
        ).length;
        const successCount = results.length - failedCount;
        if (failedCount > 0) {
          message.error(
            t('credential.BulkDeactivatePartialFailure', {
              successCount,
              failCount: failedCount,
            }),
          );
        } else {
          message.success(
            t('credential.BulkDeactivateSuccess', { count: successCount }),
          );
        }
        setSelectedKeypairs([]);
        updateFetchKey();
      },
    });
  };

  useEffect(() => {
    if (action === 'add') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenUserKeypairSettingModal(true);

      setAction(null);
    }
  }, [action, setAction]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
        <BAIFlex gap={'sm'} align="start">
          <BAIRadioGroup
            value={queryParams.activeType}
            onChange={(value) => {
              setQueryParams({ activeType: value.target.value });
              setTablePaginationOption({
                current: 1,
                pageSize: tablePaginationOption.pageSize,
              });
              setSelectedKeypairs([]);
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
            filterProperties={[
              {
                key: 'email',
                propertyLabel: t('credential.UserID'),
                type: 'string',
              },
              {
                key: 'access_key',
                propertyLabel: t('credential.AccessKey'),
                type: 'string',
              },
              {
                key: 'is_admin',
                propertyLabel: t('credential.Permission'),
                type: 'boolean',
                strictSelection: true,
                defaultOperator: '==',
                options: [
                  {
                    label: 'admin',
                    value: 'true',
                  },
                  {
                    label: 'user',
                    value: 'false',
                  },
                ],
              },
              {
                key: 'resource_policy',
                propertyLabel: t('credential.ResourcePolicy'),
                type: 'string',
              },
            ]}
            value={queryParams.filter ?? undefined}
            onChange={(value) => {
              setQueryParams({ filter: value ?? null });
              setSelectedKeypairs([]);
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          {selectedKeypairs.length > 0 && (
            <BAIFlex gap="xs">
              <BAISelectionLabel
                count={selectedKeypairs.length}
                onClearSelection={() => setSelectedKeypairs([])}
              />
              <Tooltip title={t('credential.BulkDeactivateCredentials')}>
                <BAIButton
                  icon={<BanIcon />}
                  style={{
                    color: token.colorError,
                    background: token.colorErrorBg,
                  }}
                  loading={isBulkDeactivating}
                  onClick={handleBulkDeactivate}
                />
              </Tooltip>
            </BAIFlex>
          )}
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={deferredFetchKey !== fetchKey}
              onClick={() => {
                updateFetchKey();
              }}
              icon={<ReloadOutlined />}
            />
          </Tooltip>
          <BAIButton
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setOpenUserKeypairSettingModal(true);
            }}
          >
            {t('credential.AddCredential')}
          </BAIButton>
        </BAIFlex>
      </BAIFlex>
      <BAITable<Keypair>
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        loading={deferredQueryVariables !== queryVariables}
        dataSource={filterOutNullAndUndefined(keypair_list?.items)}
        rowSelection={
          queryParams.activeType === 'active'
            ? {
                type: 'checkbox',
                selectedRowKeys: _.compact(
                  selectedKeypairs.map((keypair) => keypair.id),
                ),
                onChange: (keys) => {
                  const items = filterOutNullAndUndefined(keypair_list?.items);
                  setSelectedKeypairs(
                    items.filter(
                      (keypair) => keypair.id && keys.includes(keypair.id),
                    ),
                  );
                },
              }
            : undefined
        }
        columns={filterOutEmpty([
          {
            key: 'accessKey',
            title: t('credential.AccessKey'),
            sorter: true,
            render: (_value, record) => {
              return <BAIText monospace>{record.access_key}</BAIText>;
            },
          },
          {
            key: 'userID',
            title: t('credential.UserID'),
            dataIndex: 'email',
            fixed: 'left',
            sorter: true,
            // TODO: user_id field in keypair_list is used as user's email, but sorting is done by email field
            render: (_value, record) => {
              const actions = [
                {
                  key: 'info',
                  title: t('button.Info'),
                  icon: <InfoCircleOutlined />,
                  onClick: () => {
                    startInfoModalOpenTransition(() => {
                      setKeypairInfoModalFrgmt(record);
                    });
                  },
                },
                {
                  key: 'edit',
                  title: t('button.Edit'),
                  icon: <SquarePenIcon />,
                  onClick: () => {
                    startSettingModalOpenTransition(() => {
                      setKeypairSettingModalFrgmt(record);
                    });
                  },
                },
                ...(queryParams.activeType === 'inactive'
                  ? [
                      {
                        key: 'activate',
                        title: t('credential.Activate'),
                        icon: <UndoIcon />,
                        popConfirm: {
                          title: t('credential.ActivateCredential'),
                          description: record.user_id,
                          okText: t('credential.Activate'),
                          cancelText: t('button.Cancel'),
                          onConfirm: () => {
                            return new Promise<void>((resolve) => {
                              commitModifyKeypair({
                                variables: {
                                  access_key: record.access_key ?? '',
                                  props: {
                                    is_active: true,
                                  },
                                },
                                onCompleted: (res, errors) => {
                                  if (!res?.modify_keypair?.ok || errors) {
                                    message.error(res?.modify_keypair?.msg);
                                    resolve();
                                    return;
                                  }
                                  message.success(
                                    t(
                                      'credential.KeypairStatusUpdatedSuccessfully',
                                    ),
                                  );
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
                    ]
                  : []),
                ...(queryParams.activeType === 'active'
                  ? [
                      {
                        key: 'deactivate',
                        title: t('credential.Deactivate'),
                        icon: <BanIcon />,
                        type: 'danger' as const,
                        popConfirm: {
                          title: t('credential.DeactivateCredential'),
                          description: record.user_id,
                          okButtonProps: {
                            danger: true,
                          },
                          okText: t('credential.Deactivate'),
                          cancelText: t('button.Cancel'),
                          onConfirm: () => {
                            return new Promise<void>((resolve) => {
                              commitModifyKeypair({
                                variables: {
                                  access_key: record.access_key ?? '',
                                  props: {
                                    is_active: false,
                                  },
                                },
                                onCompleted: (res, errors) => {
                                  if (!res?.modify_keypair?.ok || errors) {
                                    message.error(res?.modify_keypair?.msg);
                                    resolve();
                                    return;
                                  }
                                  message.success(
                                    t(
                                      'credential.KeypairStatusUpdatedSuccessfully',
                                    ),
                                  );
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
                    ]
                  : [
                      {
                        key: 'delete',
                        title: t('button.Delete'),
                        icon: <DeleteFilled />,
                        type: 'danger' as const,
                        onClick: () => {
                          setDeletingKeypair(record);
                        },
                      },
                    ]),
              ];
              return (
                <BAINameActionCell
                  title={record.user_id}
                  showActions="always"
                  actions={actions}
                />
              );
            },
          },
          {
            key: 'permission',
            title: t('credential.Permission'),
            dataIndex: 'is_admin',
            render: (isAdmin) =>
              isAdmin ? (
                <BAIFlex gap="xs">
                  <Tag color={token.colorPrimary}>admin</Tag>
                  <Tag color="green">user</Tag>
                </BAIFlex>
              ) : (
                <Tag color="green">user</Tag>
              ),
            sorter: true,
          },
          {
            key: 'keyAge',
            title: t('credential.KeyAge'),
            dataIndex: 'created_at',
            render: (createdAt) => {
              return `${dayjs().diff(createdAt, 'day')}${t('credential.Days')}`;
            },
            sorter: true,
          },
          {
            key: 'createdAt',
            title: t('credential.CreatedAt'),
            dataIndex: 'created_at',
            render: (createdAt) => dayjs(createdAt).format('lll'),
            sorter: true,
          },
          {
            key: 'resourcePolicy',
            title: t('credential.ResourcePolicy'),
            dataIndex: 'resource_policy',
            sorter: true,
          },
          {
            key: 'allocation',
            title: t('credential.Allocation'),
            render: (record: Keypair) => {
              return (
                <BAIFlex direction="column" align="start">
                  <Typography.Text>
                    {record.concurrency_used}
                    <Typography.Text
                      type="secondary"
                      style={{
                        marginLeft: token.marginXXS,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      {t('credential.Sessions')}
                    </Typography.Text>
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: token.fontSizeSM,
                    }}
                  >
                    {record.rate_limit}
                    <Typography.Text
                      type="secondary"
                      style={{
                        marginLeft: token.marginXXS,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      {t('credential.ReqPer15Min')}
                    </Typography.Text>
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: token.fontSizeSM,
                    }}
                  >
                    {record.num_queries}
                    <Typography.Text
                      type="secondary"
                      style={{
                        marginLeft: token.marginXXS,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      {t('credential.Queries')}
                    </Typography.Text>
                  </Typography.Text>
                </BAIFlex>
              );
            },
          },
        ])}
        showSorterTooltip={false}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          total: keypair_list?.total_count || 0,
          current: tablePaginationOption.current,
          // TODO: need to set more options to export CSV in current page's data
          onChange(current, pageSize) {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
              setSelectedKeypairs([]);
            }
          },
        }}
        onChangeOrder={(nextOrder) => {
          setQueryParams({ order: nextOrder ?? null });
          setSelectedKeypairs([]);
        }}
      />
      <KeypairInfoModal
        keypairInfoModalFrgmt={keypairInfoModalFrgmt}
        open={!!keypairInfoModalFrgmt || isPendingInfoModalOpen}
        loading={isPendingInfoModalOpen}
        onRequestClose={() => {
          setKeypairInfoModalFrgmt(null);
        }}
      />
      <KeypairSettingModal
        keypairSettingModalFrgmt={keypairSettingModalFrgmt}
        loading={isPendingSettingModalOpen}
        open={
          !!keypairSettingModalFrgmt ||
          isPendingSettingModalOpen ||
          openUserKeypairSettingModal
        }
        onRequestClose={(success) => {
          setKeypairSettingModalFrgmt(null);
          setOpenUserKeypairSettingModal(false);
          if (success) {
            updateFetchKey();
          }
        }}
      />
      <BAIDeleteConfirmModal
        open={!!deletingKeypair}
        title={t('credential.DeleteCredential')}
        target={t('general.Credential')}
        items={
          deletingKeypair
            ? [
                {
                  key: deletingKeypair.access_key ?? '',
                  label: deletingKeypair.access_key ?? '',
                },
              ]
            : []
        }
        confirmText={deletingKeypair?.access_key ?? ''}
        requireConfirmInput
        onOk={() => {
          if (deletingKeypair) {
            commitDeleteKeypair({
              variables: {
                access_key: deletingKeypair.access_key ?? '',
              },
              onCompleted: (res, errors) => {
                if (!res?.delete_keypair?.ok || errors) {
                  message.error(res?.delete_keypair?.msg);
                  setDeletingKeypair(null);
                  return;
                }
                message.success(t('credential.KeypairSuccessfullyDeleted'));
                setDeletingKeypair(null);
                updateFetchKey();
              },
              onError: (error) => {
                message.error(error?.message);
                logger.error(error);
                setDeletingKeypair(null);
              },
            });
          }
        }}
        onCancel={() => setDeletingKeypair(null)}
      />
    </BAIFlex>
  );
};

export default AdminUserCredentialList;
