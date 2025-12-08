import { KeypairSettingModalFragment$key } from '../__generated__/KeypairSettingModalFragment.graphql';
import { UserCredentialListDeleteMutation } from '../__generated__/UserCredentialListDeleteMutation.graphql';
import { UserCredentialListModifyMutation } from '../__generated__/UserCredentialListModifyMutation.graphql';
import {
  UserCredentialListQuery,
  UserCredentialListQuery$data,
  UserCredentialListQuery$variables,
} from '../__generated__/UserCredentialListQuery.graphql';
import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useBAIPaginationOptionStateOnSearchParamLegacy } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import KeypairInfoModal from './KeypairInfoModal';
import KeypairSettingModal from './KeypairSettingModal';
import {
  DeleteOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { App, Button, Popconfirm, Tag, Tooltip, Typography, theme } from 'antd';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAITable,
  BAIFlex,
  BAIPropertyFilter,
  useBAILogger,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { BanIcon, PlusIcon, UndoIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import {
  StringParam,
  useQueryParam,
  useQueryParams,
  withDefault,
} from 'use-query-params';

type Keypair = NonNullable<
  NonNullable<UserCredentialListQuery$data['keypair_list']>['items'][number]
>;

const UserCredentialList: React.FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();

  const [action, setAction] = useQueryParam('action', StringParam);

  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [queryParams, setQueryParams] = useQueryParams({
    activeType: withDefault(StringParam, 'active'),
    order: withDefault(StringParam, undefined),
    filter: withDefault(StringParam, undefined),
  });

  const [keypairSettingModalFrgmt, setKeypairSettingModalFrgmt] =
    useState<KeypairSettingModalFragment$key | null>(null);
  const [openUserKeypairSettingModal, setOpenUserKeypairSettingModal] =
    useState(false);
  const [keypairInfoModalFrgmt, setKeypairInfoModalFrgmt] = useState<any>(null);
  const [isPendingInfoModalOpen, startInfoModalOpenTransition] =
    useTransition();
  const [isPendingSettingModalOpen, startSettingModalOpenTransition] =
    useTransition();

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionStateOnSearchParamLegacy({
    current: 1,
    pageSize: 20,
  });

  const queryVariables: UserCredentialListQuery$variables = {
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
    is_active: queryParams.activeType === 'active',
    filter: queryParams.filter,
    order: queryParams.order,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

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
    deferredQueryVariables,
    {
      fetchKey: deferredFetchKey,
      fetchPolicy:
        deferredFetchKey === INITIAL_FETCH_KEY
          ? 'store-and-network'
          : 'network-only',
    },
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

  useEffect(() => {
    if (action === 'add') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpenUserKeypairSettingModal(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAction(undefined);
    }
  }, [action, setAction]);

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
        <BAIFlex gap={'sm'} align="start">
          <BAIRadioGroup
            value={queryParams.activeType}
            onChange={(value) => {
              setQueryParams({ activeType: value.target.value }, 'replaceIn');
              setTablePaginationOption({
                current: 1,
                pageSize: tablePaginationOption.pageSize,
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
            value={queryParams.filter}
            onChange={(value) => {
              setQueryParams({ filter: value }, 'replaceIn');
            }}
          />
        </BAIFlex>
        <BAIFlex gap={'xs'}>
          <Tooltip title={t('button.Refresh')}>
            <Button
              loading={deferredFetchKey !== fetchKey}
              onClick={() => {
                updateFetchKey();
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
        </BAIFlex>
      </BAIFlex>
      <BAITable<Keypair>
        rowKey={'id'}
        scroll={{ x: 'max-content' }}
        loading={deferredQueryVariables !== queryVariables}
        dataSource={filterOutNullAndUndefined(keypair_list?.items)}
        columns={filterOutEmpty([
          {
            key: 'userID',
            title: t('credential.UserID'),
            dataIndex: 'email',
            fixed: 'left',
            sorter: true,
            // TODO: user_id field in keypair_list is used as user's email, but sorting is done by email field
            render: (_value, record) => {
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
          {
            key: 'control',
            title: t('general.Control'),
            fixed: 'right',
            render: (_value, record) => {
              return (
                <BAIFlex gap={token.marginXS}>
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
                  {queryParams.activeType === 'inactive' && (
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
                              updateFetchKey();
                            },
                            onError: (error) => {
                              message.error(error?.message);
                              logger.error(error);
                            },
                          });
                        }}
                      >
                        <Button type="text" icon={<UndoIcon />} />
                      </Popconfirm>
                    </Tooltip>
                  )}
                  {queryParams.activeType === 'active' ? (
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
                              updateFetchKey();
                            },
                            onError: (error) => {
                              message.error(error?.message);
                              logger.error(error);
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
                            <BAIFlex direction="column" align="stretch">
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
                            </BAIFlex>
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
                                updateFetchKey();
                              },
                              onError: (error) => {
                                message.error(error?.message);
                                logger.error(error);
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
            }
          },
        }}
        onChangeOrder={(nextOrder) => {
          setQueryParams({ order: nextOrder }, 'replaceIn');
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
    </BAIFlex>
  );
};

export default UserCredentialList;
