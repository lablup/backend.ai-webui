/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyKeypairManagementModalDeactivateMyKeypairMutation } from '../__generated__/MyKeypairManagementModalDeactivateMyKeypairMutation.graphql';
import { MyKeypairManagementModalIssueMyKeypairMutation } from '../__generated__/MyKeypairManagementModalIssueMyKeypairMutation.graphql';
import {
  MyKeypairManagementModalQuery,
  MyKeypairManagementModalQuery$data,
  KeypairOrderBy,
} from '../__generated__/MyKeypairManagementModalQuery.graphql';
import { MyKeypairManagementModalRevokeMyKeypairMutation } from '../__generated__/MyKeypairManagementModalRevokeMyKeypairMutation.graphql';
import { MyKeypairManagementModalSwitchMainKeyMutation } from '../__generated__/MyKeypairManagementModalSwitchMainKeyMutation.graphql';
import { convertToOrderBy } from '../helper';
import { useBAIPaginationOptionState } from '../hooks/reactPaginationQueryOptions';
import BAIRadioGroup from './BAIRadioGroup';
import {
  Alert,
  App,
  Empty,
  Popconfirm,
  theme,
  Tooltip,
  Typography,
} from 'antd';
import {
  BAIButton,
  BAIConfirmModalWithInput,
  BAIFetchKeyButton,
  BAIFlex,
  BAIGraphQLPropertyFilter,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
  type GraphQLFilter,
  INITIAL_FETCH_KEY,
  useBAILogger,
  useErrorMessageResolver,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import {
  BanIcon,
  DownloadIcon,
  KeyRoundIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
  UndoIcon,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';
import { useBAISettingUserState } from 'src/hooks/useBAISetting';

type ActiveFilter = 'active' | 'inactive';

type KeypairNode = NonNullable<
  NonNullable<MyKeypairManagementModalQuery$data['myKeypairs']>['edges'][number]
>['node'];

interface KeypairCredential {
  accessKey: string;
  secretKey: string;
  sshPublicKey: string;
}

interface MyKeypairManagementModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

type KeypairSorterValue =
  | 'accessKey'
  | 'resourcePolicy'
  | 'createdAt'
  | 'lastUsed'
  | '-accessKey'
  | '-resourcePolicy'
  | '-createdAt'
  | '-lastUsed';

const downloadCredentialCSV = (credential: KeypairCredential) => {
  const header = 'access_key,secret_key,ssh_public_key';
  const row = [
    credential.accessKey,
    credential.secretKey,
    credential.sshPublicKey,
  ]
    .map((v) => `"${v.replace(/"/g, '""')}"`)
    .join(',');

  const csvContent = `${header}\n${row}\n`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `keypair_${credential.accessKey}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const MyKeypairManagementModal: React.FC<MyKeypairManagementModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message, modal } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [credentialResult, setCredentialResult] =
    useState<KeypairCredential | null>(null);
  const [deletingKeypairAccessKey, setDeletingKeypairAccessKey] = useState<
    string | null
  >(null);
  const [order, setOrder] = useState<KeypairSorterValue | null>('-createdAt');
  const [graphqlFilter, setGraphqlFilter] = useState<
    GraphQLFilter | undefined
  >();
  const [columnOverrides, setColumnOverrides] = useBAISettingUserState(
    'table_column_overrides.MyKeypairManagementModal',
  );

  const {
    baiPaginationOption,
    tablePaginationOption,
    setTablePaginationOption,
  } = useBAIPaginationOptionState({
    current: 1,
    pageSize: 10,
  });

  const [issueMyKeypair] =
    useMutation<MyKeypairManagementModalIssueMyKeypairMutation>(graphql`
      mutation MyKeypairManagementModalIssueMyKeypairMutation {
        issueMyKeypair {
          keypair {
            accessKey
            sshPublicKey
          }
          secretKey
        }
      }
    `);

  const [switchMainKey] =
    useMutation<MyKeypairManagementModalSwitchMainKeyMutation>(graphql`
      mutation MyKeypairManagementModalSwitchMainKeyMutation(
        $input: SwitchMyMainAccessKeyInput!
      ) {
        switchMyMainAccessKey(input: $input) {
          success
        }
      }
    `);

  const [updateMyKeypair] =
    useMutation<MyKeypairManagementModalDeactivateMyKeypairMutation>(graphql`
      mutation MyKeypairManagementModalDeactivateMyKeypairMutation(
        $input: UpdateMyKeypairInput!
      ) {
        updateMyKeypair(input: $input) {
          keypair {
            isActive
          }
        }
      }
    `);

  const [revokeKeypair] =
    useMutation<MyKeypairManagementModalRevokeMyKeypairMutation>(graphql`
      mutation MyKeypairManagementModalRevokeMyKeypairMutation(
        $input: RevokeMyKeypairInput!
      ) {
        revokeMyKeypair(input: $input) {
          success
        }
      }
    `);

  const queryVariables = {
    filter: {
      isActive: activeFilter === 'active',
      ...graphqlFilter,
    },
    orderBy: convertToOrderBy<Required<KeypairOrderBy>>(order),
    limit: baiPaginationOption.limit,
    offset: baiPaginationOption.offset,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<MyKeypairManagementModalQuery>(
    graphql`
      query MyKeypairManagementModalQuery(
        $filter: KeypairFilter
        $orderBy: [KeypairOrderBy!]
        $limit: Int
        $offset: Int
      ) {
        myKeypairs(
          filter: $filter
          orderBy: $orderBy
          limit: $limit
          offset: $offset
        ) {
          edges {
            node {
              id
              accessKey
              isActive
              isAdmin
              createdAt
              modifiedAt
              lastUsed
              rateLimit
              numQueries
              resourcePolicy
              sshPublicKey
            }
          }
          count
        }
        user {
          main_access_key
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

  const mainAccessKey = data.user?.main_access_key;
  const keypairNodes = filterOutNullAndUndefined(
    data.myKeypairs?.edges?.map((edge) => edge?.node),
  );

  const handleIssueKeypair = () => {
    issueMyKeypair({
      onCompleted: (
        result: MyKeypairManagementModalIssueMyKeypairMutation['response'],
      ) => {
        const payload = result.issueMyKeypair;
        setCredentialResult({
          accessKey: payload.keypair.accessKey,
          secretKey: payload.secretKey,
          sshPublicKey: payload.keypair.sshPublicKey ?? '',
        });
        setActiveFilter('active');
        updateFetchKey();
        message.success(t('credential.KeypairCreated'));
      },
      onError: (error) => {
        logger.error(error);
        message.error(getErrorMessage(error));
      },
      variables: {},
    });
  };

  const handleSwitchMainKey = (accessKey: string) => {
    switchMainKey({
      variables: { input: { accessKey } },
      onCompleted: () => {
        modal.info({
          title: t('credential.ReLoginRequired'),
          content: t('credential.MainKeyChangedNeedRelogin'),
          okText: t('button.Confirm'),
          centered: true,
          closable: false,
          maskClosable: false,
          keyboard: false,
          onOk: () => {
            document.dispatchEvent(new CustomEvent('backend-ai-logout'));
          },
        });
      },
      onError: (error) => {
        logger.error(error);
        message.error(getErrorMessage(error));
      },
    });
  };

  const handleDeactivateKeypair = (accessKey: string) => {
    updateMyKeypair({
      variables: {
        input: { accessKey, isActive: false },
      },
      onCompleted: () => {
        updateFetchKey();
        message.success(t('credential.KeypairDeactivated'));
      },
      onError: (error) => {
        logger.error(error);
        message.error(getErrorMessage(error));
      },
    });
  };

  const handleActivateKeypair = (accessKey: string) => {
    updateMyKeypair({
      variables: {
        input: { accessKey, isActive: true },
      },
      onCompleted: () => {
        updateFetchKey();
        message.success(t('credential.KeypairRestored'));
      },
      onError: (error) => {
        logger.error(error);
        message.error(getErrorMessage(error));
      },
    });
  };

  const handleDeleteKeypair = (accessKey: string) => {
    revokeKeypair({
      variables: {
        input: { accessKey },
      },
      onCompleted: () => {
        updateFetchKey();
        message.success(t('credential.KeypairDeleted'));
      },
      onError: (error) => {
        logger.error(error);
        message.error(getErrorMessage(error));
      },
    });
  };

  return (
    <>
      <BAIModal
        {...baiModalProps}
        title={t('credential.MyKeypairManagement')}
        centered
        onCancel={onRequestClose}
        destroyOnHidden
        width={1100}
        footer={null}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          {mainAccessKey && (
            <Alert
              type="info"
              showIcon
              icon={
                <KeyRoundIcon
                  style={{ width: token.fontSizeLG, height: token.fontSizeLG }}
                />
              }
              title={
                <BAIFlex gap="xs" align="center">
                  <BAIText>{t('credential.MainAccessKey')}:</BAIText>
                  <BAIText monospace copyable>
                    {mainAccessKey}
                  </BAIText>
                </BAIFlex>
              }
            />
          )}
          <BAIFlex
            justify="between"
            align="start"
            gap="sm"
            wrap="wrap"
            style={{ marginBottom: token.marginSM }}
          >
            <BAIFlex gap="xs" align="start" wrap="wrap">
              <BAIRadioGroup
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setTablePaginationOption({ current: 1 });
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
              <BAIGraphQLPropertyFilter
                filterProperties={[
                  {
                    key: 'accessKey',
                    propertyLabel: t('credential.AccessKey'),
                    type: 'string',
                  },
                  {
                    key: 'resourcePolicy',
                    propertyLabel: t('credential.ResourcePolicy'),
                    type: 'string',
                  },
                ]}
                value={graphqlFilter}
                onChange={(value) => {
                  setGraphqlFilter(value ?? undefined);
                  setTablePaginationOption({ current: 1 });
                }}
              />
            </BAIFlex>
            <BAIFlex gap="xs">
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                onClick={handleIssueKeypair}
              >
                {t('credential.IssueNewKeypair')}
              </BAIButton>
              <BAIFetchKeyButton
                loading={
                  deferredQueryVariables !== queryVariables ||
                  deferredFetchKey !== fetchKey
                }
                value={fetchKey}
                onChange={(newFetchKey) => {
                  updateFetchKey(newFetchKey);
                }}
              />
            </BAIFlex>
          </BAIFlex>
          <BAITable<KeypairNode>
            rowKey="id"
            scroll={{ x: 'max-content' }}
            loading={deferredQueryVariables !== queryVariables}
            dataSource={keypairNodes}
            order={order}
            onChangeOrder={(newOrder) => {
              setOrder(newOrder as KeypairSorterValue);
              setTablePaginationOption({ current: 1 });
            }}
            tableSettings={{
              columnOverrides,
              onColumnOverridesChange: setColumnOverrides,
            }}
            columns={filterOutEmpty([
              {
                key: 'accessKey',
                title: t('credential.AccessKey'),
                dataIndex: 'accessKey',
                sorter: true,
                render: (value: string) => (
                  <BAIFlex gap="xs" align="center">
                    <BAIText monospace copyable>
                      {value}
                    </BAIText>
                    {value === mainAccessKey && (
                      <Tooltip title={t('credential.MainAccessKey')}>
                        <KeyRoundIcon
                          style={{ color: token.colorTextSecondary }}
                        />
                      </Tooltip>
                    )}
                  </BAIFlex>
                ),
              },
              {
                key: 'actions',
                title: t('credential.Controls'),
                fixed: 'right' as const,
                render: (_: unknown, record: KeypairNode) => {
                  if (activeFilter === 'active') {
                    const isMain = record.accessKey === mainAccessKey;
                    return (
                      <BAIFlex gap="xxs">
                        {!isMain && (
                          <Popconfirm
                            title={t('credential.SetAsMain')}
                            description={t('credential.SetAsMainConfirm')}
                            okText={t('button.Confirm')}
                            cancelText={t('button.Cancel')}
                            placement="left"
                            onConfirm={() =>
                              handleSwitchMainKey(record.accessKey ?? '')
                            }
                          >
                            <Tooltip title={t('credential.SetAsMain')}>
                              <BAIButton
                                type="text"
                                icon={<KeyRoundIcon />}
                                size="small"
                                style={{ color: token.colorInfo }}
                              />
                            </Tooltip>
                          </Popconfirm>
                        )}
                        {isMain ? (
                          <Tooltip
                            title={t('credential.MainKeyCannotDeactivate')}
                          >
                            <BAIButton
                              type="text"
                              danger
                              icon={<BanIcon />}
                              size="small"
                              disabled
                            />
                          </Tooltip>
                        ) : (
                          <Popconfirm
                            title={t('credential.Deactivate')}
                            description={t('credential.DeactivateConfirm')}
                            okText={t('button.Confirm')}
                            okType="danger"
                            cancelText={t('button.Cancel')}
                            placement="left"
                            onConfirm={() =>
                              handleDeactivateKeypair(record.accessKey ?? '')
                            }
                          >
                            <Tooltip title={t('credential.Deactivate')}>
                              <BAIButton
                                type="text"
                                danger
                                icon={<BanIcon />}
                                size="small"
                              />
                            </Tooltip>
                          </Popconfirm>
                        )}
                      </BAIFlex>
                    );
                  }
                  return (
                    <BAIFlex gap="xxs">
                      <Popconfirm
                        title={t('credential.Restore')}
                        description={t('credential.RestoreConfirm')}
                        okText={t('button.Confirm')}
                        cancelText={t('button.Cancel')}
                        placement="left"
                        onConfirm={() =>
                          handleActivateKeypair(record.accessKey ?? '')
                        }
                      >
                        <Tooltip title={t('credential.Restore')}>
                          <BAIButton
                            type="text"
                            icon={<UndoIcon />}
                            size="small"
                          />
                        </Tooltip>
                      </Popconfirm>
                      <Tooltip title={t('credential.DeleteKeypair')}>
                        <BAIButton
                          type="text"
                          danger
                          icon={<Trash2Icon />}
                          size="small"
                          onClick={() =>
                            setDeletingKeypairAccessKey(
                              record.accessKey ?? null,
                            )
                          }
                        />
                      </Tooltip>
                    </BAIFlex>
                  );
                },
              },
              {
                key: 'resourcePolicy',
                title: t('credential.ResourcePolicy'),
                dataIndex: 'resourcePolicy',
                sorter: true,
              },
              {
                key: 'createdAt',
                title: t('credential.CreatedAt'),
                dataIndex: 'createdAt',
                sorter: true,
                render: (value: string) =>
                  value ? dayjs(value).format('lll') : '-',
              },
              {
                key: 'lastUsed',
                title: t('credential.LastUsed'),
                dataIndex: 'lastUsed',
                sorter: true,
                render: (value: string) =>
                  value ? dayjs(value).format('lll') : '-',
              },
              {
                key: 'modifiedAt',
                title: t('credential.ModifiedAt'),
                dataIndex: 'modifiedAt',
                defaultHidden: true,
                render: (value: string) =>
                  value ? dayjs(value).format('lll') : '-',
              },
            ])}
            showSorterTooltip={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    activeFilter === 'active'
                      ? t('credential.NoActiveKeypairs')
                      : t('credential.NoInactiveKeypairs')
                  }
                />
              ),
            }}
            pagination={{
              pageSize: tablePaginationOption.pageSize,
              current: tablePaginationOption.current,
              total: data.myKeypairs?.count ?? 0,
              onChange: (current, pageSize) => {
                setTablePaginationOption({ current, pageSize });
              },
            }}
          />
        </BAIFlex>
      </BAIModal>
      <BAIModal
        open={credentialResult !== null}
        title={t('credential.KeypairCredentialInfo')}
        keyboard={false}
        onCancel={() => setCredentialResult(null)}
        destroyOnHidden
        width={640}
        footer={
          <BAIFlex justify="end">
            <BAIButton
              type="primary"
              icon={<DownloadIcon />}
              onClick={() => {
                if (credentialResult) {
                  downloadCredentialCSV(credentialResult);
                }
              }}
            >
              {t('credential.DownloadCSV')}
            </BAIButton>
          </BAIFlex>
        }
      >
        <BAIFlex direction="column" gap="sm">
          <Alert
            type="warning"
            showIcon
            icon={
              <TriangleAlertIcon
                style={{ width: token.fontSizeLG, height: token.fontSizeLG }}
              />
            }
            title={t('credential.CannotViewAgainWarning')}
            style={{ width: '100%' }}
          />
          <BAIFlex direction="column" gap="xs">
            <BAIText type="secondary">{t('credential.AccessKey')}</BAIText>
            <BAIText copyable code ellipsis={{ tooltip: true }}>
              {credentialResult?.accessKey}
            </BAIText>
          </BAIFlex>
          <BAIFlex direction="column" gap="xs">
            <BAIText type="secondary">{t('credential.SecretKey')}</BAIText>
            <BAIText copyable code ellipsis={{ tooltip: true }}>
              {credentialResult?.secretKey}
            </BAIText>
          </BAIFlex>
          <BAIFlex
            direction="column"
            gap="xs"
            style={{ overflow: 'hidden', width: '100%' }}
          >
            <BAIText type="secondary">{t('credential.SSHPublicKey')}</BAIText>
            <BAIText copyable code ellipsis={{ tooltip: true }}>
              {credentialResult?.sshPublicKey}
            </BAIText>
          </BAIFlex>
        </BAIFlex>
      </BAIModal>
      <BAIConfirmModalWithInput
        open={!!deletingKeypairAccessKey}
        title={t('credential.DeleteKeypair')}
        content={
          <Typography.Text style={{ marginBottom: token.marginSM }}>
            {t('credential.DeleteKeypairWarning', {
              accessKey: deletingKeypairAccessKey,
            })}
          </Typography.Text>
        }
        confirmText={t('credential.PermanentlyDelete')}
        inputLabel={t('credential.TypePermanentlyDelete', {
          text: t('credential.PermanentlyDelete'),
        })}
        inputProps={{
          placeholder: t('credential.PermanentlyDelete'),
        }}
        okText={t('button.Delete')}
        cancelText={t('button.Cancel')}
        onOk={() => {
          if (deletingKeypairAccessKey) {
            handleDeleteKeypair(deletingKeypairAccessKey);
          }
          setDeletingKeypairAccessKey(null);
        }}
        onCancel={() => {
          setDeletingKeypairAccessKey(null);
        }}
      />
    </>
  );
};

export default MyKeypairManagementModal;
