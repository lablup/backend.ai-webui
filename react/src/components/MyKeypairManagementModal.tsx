/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  MyKeypairManagementModalQuery,
  MyKeypairManagementModalQuery$data,
} from '../__generated__/MyKeypairManagementModalQuery.graphql';
import BAIRadioGroup from './BAIRadioGroup';
import { Alert, Empty, Tag, theme } from 'antd';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAITable,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
  INITIAL_FETCH_KEY,
  useFetchKey,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { KeyRoundIcon } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type ActiveFilter = 'active' | 'inactive';

type KeypairNode = NonNullable<
  NonNullable<MyKeypairManagementModalQuery$data['myKeypairs']>['edges'][number]
>['node'];

interface MyKeypairManagementModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const MyKeypairManagementModal: React.FC<MyKeypairManagementModalProps> = ({
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('active');
  const [fetchKey, updateFetchKey] = useFetchKey();

  const queryVariables = {
    filter: {
      isActive: activeFilter === 'active',
    },
    first: 100,
    offset: 0,
  };

  const deferredQueryVariables = useDeferredValue(queryVariables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const data = useLazyLoadQuery<MyKeypairManagementModalQuery>(
    graphql`
      query MyKeypairManagementModalQuery(
        $filter: KeypairFilter
        $orderBy: [KeypairOrderBy!]
        $first: Int
        $offset: Int
      ) {
        myKeypairs(
          filter: $filter
          orderBy: $orderBy
          first: $first
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

  return (
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
  );
};

export default MyKeypairManagementModal;
