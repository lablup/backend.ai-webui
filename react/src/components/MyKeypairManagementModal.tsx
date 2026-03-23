/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyKeypairManagementModalIssueMyKeypairMutation } from '../__generated__/MyKeypairManagementModalIssueMyKeypairMutation.graphql';
import {
  MyKeypairManagementModalQuery,
  MyKeypairManagementModalQuery$data,
} from '../__generated__/MyKeypairManagementModalQuery.graphql';
import BAIRadioGroup from './BAIRadioGroup';
import { Alert, App, Empty, Tag, Typography, theme } from 'antd';
import {
  BAIButton,
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  useBAILogger,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import {
  DownloadIcon,
  KeyRoundIcon,
  PlusIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [credentialResult, setCredentialResult] =
    useState<KeypairCredential | null>(null);

  const issueMyKeypair =
    useMutationWithPromise<MyKeypairManagementModalIssueMyKeypairMutation>(
      graphql`
        mutation MyKeypairManagementModalIssueMyKeypairMutation {
          issueMyKeypair @since(version: "26.4.0") {
            keypair {
              accessKey
              sshPublicKey
            }
            secretKey
          }
        }
      `,
    );

  const queryVariables = {
    filter: {
      isActive: activeFilter === 'active',
    },
    limit: 100,
    offset: 0,
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
        ) @since(version: "26.4.0") {
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

  const handleIssueKeypair = async () => {
    try {
      const result = await issueMyKeypair({});
      const payload = result.issueMyKeypair;
      setCredentialResult({
        accessKey: payload.keypair.accessKey,
        secretKey: payload.secretKey,
        sshPublicKey: payload.keypair.sshPublicKey,
      });
      setActiveFilter('active');
      updateFetchKey();
      message.success(t('credential.KeypairCreated'));
    } catch (e) {
      logger.error(e);
      message.error(getErrorMessage(e));
    }
  };

  return (
    <>
      <BAIModal
        {...baiModalProps}
        title={t('credential.MyKeypairManagement')}
        centered
        onCancel={onRequestClose}
        destroyOnHidden
        width={900}
        footer={null}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          {mainAccessKey && (
            <Alert
              type="info"
              showIcon
              icon={
                <KeyRoundIcon
                  style={{
                    width: token.fontSizeLG,
                    height: token.fontSizeLG,
                  }}
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
          <BAIFlex justify="between" align="start" gap="xs" wrap="wrap">
            <BAIRadioGroup
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
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
            <BAIFlex gap="xs">
              <BAIButton
                type="primary"
                icon={<PlusIcon />}
                action={handleIssueKeypair}
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
                      <Tag color="red">{t('credential.MainAccessKey')}</Tag>
                    )}
                  </BAIFlex>
                ),
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
                sorter: true,
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
              pageSize: 10,
              total: data.myKeypairs?.count ?? 0,
            }}
          />
        </BAIFlex>
      </BAIModal>
      <BAIModal
        open={credentialResult !== null}
        title={t('credential.KeypairCredentialInfo')}
        maskClosable={false}
        closable
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
                style={{
                  width: token.fontSizeLG,
                  height: token.fontSizeLG,
                }}
              />
            }
            title={t('credential.CannotViewAgainWarning')}
          />
          <BAIFlex direction="column" gap="xs">
            <BAIText type="secondary">{t('credential.AccessKey')}</BAIText>
            <Typography.Text copyable code>
              {credentialResult?.accessKey}
            </Typography.Text>
          </BAIFlex>
          <BAIFlex direction="column" gap="xs">
            <BAIText type="secondary">{t('credential.SecretKey')}</BAIText>
            <Typography.Text copyable code>
              {credentialResult?.secretKey}
            </Typography.Text>
          </BAIFlex>
          <BAIFlex direction="column" gap="xs">
            <BAIText type="secondary">{t('credential.SSHPublicKey')}</BAIText>
            <Typography.Text copyable code ellipsis={{ tooltip: true }}>
              {credentialResult?.sshPublicKey}
            </Typography.Text>
          </BAIFlex>
        </BAIFlex>
      </BAIModal>
    </>
  );
};

export default MyKeypairManagementModal;
