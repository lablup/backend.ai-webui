import { KeypairSettingModalFragment$key } from '../__generated__/KeypairSettingModalFragment.graphql';
import { UserCredentialListDeleteMutation } from '../__generated__/UserCredentialListDeleteMutation.graphql';
import { UserCredentialListModifyMutation } from '../__generated__/UserCredentialListModifyMutation.graphql';
import {
  UserCredentialListQuery,
  UserCredentialListQuery$data,
} from '../__generated__/UserCredentialListQuery.graphql';
import { filterEmptyItem, filterNonNullItems } from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAIRadioGroup from './BAIRadioGroup';
import BAITable from './BAITable';
import Flex from './Flex';
import KeypairInfoModal from './KeypairInfoModal';
import KeypairSettingModal from './KeypairSettingModal';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Popconfirm, Tag, Tooltip, Typography, theme } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon, PlusIcon, UndoIcon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { StringParam, useQueryParam } from 'use-query-params';

type Keypair = NonNullable<
  NonNullable<UserCredentialListQuery$data['keypair_list']>['items'][number]
>;

const UserCredentialList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();

  const [action, setAction] = useQueryParam('action', StringParam);
  useEffect(() => {
    if (action === 'add') {
      setOpenUserKeypairSettingModal(true);
      setAction(undefined);
    }
  }, [action, setAction]);

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [order, setOrder] = useState<string | undefined>(undefined);
  const [filterString, setFilterString] = useState<string>();
  const [keypairSettingModalFrgmt, setKeypairSettingModalFrgmt] =
    useState<KeypairSettingModalFragment$key | null>(null);
  const [openUserKeypairSettingModal, setOpenUserKeypairSettingModal] =
    useState(false);
  const [keypairInfoModalFrgmt, setKeypairInfoModalFrgmt] = useState<any>(null);

  const [isPendingRefresh, startRefreshTransition] = useTransition();
  const [isActiveTypePending, startActiveTypeTransition] = useTransition();
  const [isPendingPageChange, startPageChangeTransition] = useTransition();
  const [isPendingFilter, startFilterTransition] = useTransition();
  const [isPendingInfoModalOpen, startInfoModalOpenTransition] =
    useTransition();
  const [isPendingSettingModalOpen, startSettingModalOpenTransition] =
    useTransition();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 20,
  });

  const { keypair_list } = useLazyLoadQuery<UserCredentialListQuery>(
    graphql`
      query UserCredentialListQuery(
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
    {
      limit: baiPaginationOption.limit,
      offset: baiPaginationOption.offset,
      is_active: activeType === 'active',
      filter: filterString,
      order,
    },
    { fetchKey, fetchPolicy: 'network-only' },
  );

  const [commitModifyKeypair, isInFlightCommitModifyKeypair] =
    useMutation<UserCredentialListModifyMutation>(graphql`
      mutation UserCredentialListModifyMutation(
        $access_key: String!
        $props: ModifyKeyPairInput!
      ) {
        modify_keypair(access_key: $access_key, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitDeleteKeypair, isInFlightCommitDeleteKeypair] =
    useMutation<UserCredentialListDeleteMutation>(graphql`
      mutation UserCredentialListDeleteMutation($access_key: String!) {
        delete_keypair(access_key: $access_key) {
          ok
          msg
        }
      }
    `);

  return (
    <Flex direction="column" align="stretch">
      <Flex
        justify="between"
        align="start"
        gap="xs"
        style={{ padding: token.paddingSM }}
        wrap="wrap"
      >
        <Flex gap={'sm'} align="start">
          <BAIRadioGroup
            value={activeType}
            onChange={(value) => {
              startActiveTypeTransition(() => {
                setActiveType(value.target.value);
                setTablePaginationOption({
                  current: 1,
                  pageSize: tablePaginationOption.pageSize,
                });
              });
            }}
            optionType="button"
            options={[
              {
                label: 'Active',
                value: 'active',
              },
              {
                label: 'Inactive',
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
            value={filterString}
            loading={isPendingFilter}
            onChange={(value) => {
              startFilterTransition(() => {
                setFilterString(value);
              });
            }}
          />
        </Flex>
        <Flex gap={'xs'}>
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={isPendingRefresh}
              onClick={() => {
                startRefreshTransition(() => {
                  updateFetchKey();
                });
              }}
              icon={<ReloadOutlined />}
            />
          </Tooltip>
          <Button
            type="primary"
            icon={<PlusIcon />}
            onClick={() => {
              setOpenUserKeypairSettingModal(true);
            }}
          >
            {t('credential.AddCredential')}
          </Button>
        </Flex>
      </Flex>
      <BAITable<Keypair>
        // resizable
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        loading={
          isActiveTypePending ||
          isPendingRefresh ||
          isPendingPageChange ||
          isPendingFilter
        }
        dataSource={filterNonNullItems(keypair_list?.items)}
        columns={filterEmptyItem([
          {
            key: 'userID',
            title: t('credential.UserID'),
            dataIndex: 'email',
            fixed: 'left',
            sorter: true,
            // TODO: user_id field in keypair_list is used as user's email, but sorting is done by email field
            render: (value, record) => {
              return record.user_id;
            },
          },
          {
            key: 'accessKey',
            title: t('credential.AccessKey'),
            dataIndex: 'access_key',
            sorter: true,
          },
          {
            key: 'permission',
            title: t('credential.Permission'),
            dataIndex: 'is_admin',
            render: (isAdmin) =>
              isAdmin ? (
                <>
                  <Tag color="red">admin</Tag>
                  <Tag color="green">user</Tag>
                </>
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
            render: (record) => {
              return (
                <Flex direction="column" align="start">
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
                </Flex>
              );
            },
          },
          {
            key: 'control',
            title: t('general.Control'),
            fixed: 'right',
            render: (value, record) => {
              return (
                <Flex gap={token.marginXS}>
                  <Button
                    type="text"
                    icon={
                      <InfoCircleOutlined
                        style={{ color: token.colorSuccess }}
                      />
                    }
                    onClick={() => {
                      startInfoModalOpenTransition(() => {
                        setKeypairInfoModalFrgmt(record);
                      });
                    }}
                  />
                  <Button
                    type="text"
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      startSettingModalOpenTransition(() => {
                        setKeypairSettingModalFrgmt(record);
                      });
                    }}
                  />
                  {activeType === 'inactive' && (
                    <Tooltip title={t('credential.Activate')}>
                      <Popconfirm
                        title={t('credential.ActivateCredential')}
                        description={record.user_id}
                        okText={t('credential.Activate')}
                        placement="left"
                        onConfirm={() => {
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
                                return;
                              }
                              message.success(
                                t(
                                  'credential.KeypairStatusUpdatedSuccessfully',
                                ),
                              );
                              startRefreshTransition(() => {
                                updateFetchKey();
                              });
                            },
                            onError: (error) => {
                              message.error(error?.message);
                              console.error(error);
                            },
                          });
                        }}
                      >
                        <Button type="text" icon={<UndoIcon />} />
                      </Popconfirm>
                    </Tooltip>
                  )}
                  {activeType === 'active' ? (
                    <Tooltip title={t('credential.Deactivate')}>
                      <Popconfirm
                        title={t('credential.DeactivateCredential')}
                        description={record.user_id}
                        okButtonProps={{
                          loading: isInFlightCommitModifyKeypair,
                        }}
                        okType="danger"
                        okText={t('credential.Deactivate')}
                        placement="left"
                        onConfirm={() => {
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
                                return;
                              }
                              message.success(
                                t(
                                  'credential.KeypairStatusUpdatedSuccessfully',
                                ),
                              );
                              startRefreshTransition(() => {
                                updateFetchKey();
                              });
                            },
                            onError: (error) => {
                              message.error(error?.message);
                              console.error(error);
                            },
                          });
                        }}
                      >
                        <Button type="text" danger icon={<BanIcon />} />
                      </Popconfirm>
                    </Tooltip>
                  ) : (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      loading={isInFlightCommitDeleteKeypair}
                      onClick={() => {
                        modal.confirm({
                          title: t('credential.DeleteCredential'),
                          content: (
                            <Flex direction="column" align="stretch">
                              <Typography.Text>
                                {t('credential.YouAreAboutToDeleteCredential')}
                              </Typography.Text>
                              <Typography.Text strong>
                                {record.user_id}
                              </Typography.Text>
                              <br />
                              <Typography.Text type="danger">
                                {t('dialog.warning.CannotBeUndone')}
                              </Typography.Text>
                            </Flex>
                          ),
                          onOk: () => {
                            commitDeleteKeypair({
                              variables: {
                                access_key: record.access_key ?? '',
                              },
                              onCompleted: (res, errors) => {
                                if (!res?.delete_keypair?.ok || errors) {
                                  message.error(res?.delete_keypair?.msg);
                                  return;
                                }
                                message.success(
                                  t('credential.KeypairSuccessfullyDeleted'),
                                );
                                startRefreshTransition(() => {
                                  updateFetchKey();
                                });
                              },
                              onError: (error) => {
                                message.error(error?.message);
                                console.error(error);
                              },
                            });
                          },
                          okButtonProps: {
                            danger: true,
                          },
                          okText: t('button.Delete'),
                        });
                      }}
                    />
                  )}
                </Flex>
              );
            },
          },
        ])}
        showSorterTooltip={false}
        pagination={{
          pageSize: tablePaginationOption.pageSize,
          showSizeChanger: true,
          total: keypair_list?.total_count || 0,
          current: tablePaginationOption.current,
          showTotal: (total, range) => {
            return `${range[0]}-${range[1]} of ${total} items`;
          },
          // TODO: need to set more options to export CSV in current page's data
          pageSizeOptions: ['10', '20', '50'],
          style: { marginRight: token.marginXS },
          onChange(current, pageSize) {
            startPageChangeTransition(() => {
              if (_.isNumber(current) && _.isNumber(pageSize)) {
                setTablePaginationOption({
                  current,
                  pageSize,
                });
              }
            });
          },
        }}
        onChangeOrder={(nextOrder) => {
          startPageChangeTransition(() => {
            setOrder(nextOrder);
          });
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
            startRefreshTransition(() => {
              updateFetchKey();
            });
          }
        }}
      />
    </Flex>
  );
};

export default UserCredentialList;
