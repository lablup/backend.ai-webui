import {
  filterEmptyItem,
  filterNonNullItems,
  transformSorterToOrderString,
} from '../helper';
import { useUpdatableState } from '../hooks';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import KeypairSettingModal from '../pages/KeypairSettingModal';
import { KeypairSettingModalFragment$key } from '../pages/__generated__/KeypairSettingModalFragment.graphql';
import BAIPropertyFilter from './BAIPropertyFilter';
import BAITable from './BAITable';
import Flex from './Flex';
import KeypairInfoModal from './KeypairInfoModal';
import { UserCredentialListDeleteMutation } from './__generated__/UserCredentialListDeleteMutation.graphql';
import { UserCredentialListModifyMutation } from './__generated__/UserCredentialListModifyMutation.graphql';
import {
  UserCredentialListQuery,
  UserCredentialListQuery$data,
} from './__generated__/UserCredentialListQuery.graphql';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Popconfirm,
  Radio,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery, useMutation } from 'react-relay';

type Keypair = NonNullable<
  NonNullable<UserCredentialListQuery$data['keypair_list']>['items'][number]
>;

const UserCredentialList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [activeType, setActiveType] = useState<'active' | 'inactive'>('active');
  const [order, setOrder] = useState<string>();
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
            concurrency_limit @since(version: "24.09.0")

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
        style={{ padding: token.paddingXS }}
        wrap="wrap"
      >
        <Flex gap={'sm'} align="start">
          <Radio.Group
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
                label: t('credential.Active'),
                value: 'active',
              },
              {
                label: t('credential.Inactive'),
                value: 'inactive',
              },
            ]}
          />
          <BAIPropertyFilter
            filterProperties={[
              {
                key: 'user_id',
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
        loading={{
          spinning:
            isActiveTypePending ||
            isPendingRefresh ||
            isPendingPageChange ||
            isPendingFilter,
          indicator: <LoadingOutlined />,
        }}
        dataSource={filterNonNullItems(keypair_list?.items)}
        columns={filterEmptyItem([
          {
            key: 'userID',
            title: t('credential.UserID'),
            dataIndex: 'user_id',
            fixed: 'left',
            // FIXME: sorter is not working
            // sorter: true,
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
                    {record.concurrency_used} / {record.concurrency_limit}
                    <Typography.Text
                      type="secondary"
                      style={{
                        marginLeft: token.marginXXS,
                        fontSize: token.fontSizeSM,
                      }}
                    >
                      Sess.
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
                      req per 15 min
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
                      queries
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
                    type="link"
                    icon={<InfoCircleOutlined />}
                    onClick={() => {
                      setKeypairInfoModalFrgmt(record);
                    }}
                  />
                  <Button
                    type="link"
                    icon={
                      <SettingOutlined style={{ color: token.colorInfo }} />
                    }
                    onClick={() => {
                      setKeypairSettingModalFrgmt(record);
                    }}
                  />
                  {activeType === 'inactive' && (
                    <Button
                      type="link"
                      icon={<UndoOutlined style={{ color: token.colorInfo }} />}
                      onClick={() => {
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
                              t('environment.SuccessfullyModified'),
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
                    />
                  )}
                  <Popconfirm
                    title={t('dialog.ask.DoYouWantToProceed')}
                    description={t('dialog.warning.CannotBeUndone')}
                    okButtonProps={{
                      loading:
                        isInFlightCommitModifyKeypair ||
                        isInFlightCommitDeleteKeypair,
                    }}
                    okType="danger"
                    okText={t('button.Delete')}
                    placement="left"
                    onConfirm={() => {
                      activeType === 'active'
                        ? commitModifyKeypair({
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
                                t('credential.KeySeccessfullyDeleted'),
                              );
                              startRefreshTransition(() => {
                                updateFetchKey();
                              });
                            },
                            onError: (error) => {
                              message.error(error?.message);
                              console.error(error);
                            },
                          })
                        : commitDeleteKeypair({
                            variables: {
                              access_key: record.access_key ?? '',
                            },
                            onCompleted: (res, errors) => {
                              if (!res?.delete_keypair?.ok || errors) {
                                message.error(res?.delete_keypair?.msg);
                                return;
                              }
                              message.success(
                                t('credential.KeySeccessfullyDeleted'),
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
                    <Button type="link" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
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
        }}
        onChange={({ pageSize, current }, filters, sorter) => {
          startPageChangeTransition(() => {
            if (_.isNumber(current) && _.isNumber(pageSize)) {
              setTablePaginationOption({
                current,
                pageSize,
              });
            }
            setOrder(transformSorterToOrderString(sorter));
          });
        }}
      />
      <KeypairSettingModal
        keypairSettingModalFrgmt={keypairSettingModalFrgmt}
        open={!!keypairSettingModalFrgmt || openUserKeypairSettingModal}
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
      <KeypairInfoModal
        keypairInfoModalFrgmt={keypairInfoModalFrgmt}
        open={!!keypairInfoModalFrgmt}
        onRequestClose={() => {
          setKeypairInfoModalFrgmt(null);
        }}
      />
    </Flex>
  );
};

export default UserCredentialList;
