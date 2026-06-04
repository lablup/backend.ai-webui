/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { QuotaScopeTableQuery as QuotaScopeTableQueryType } from '../__generated__/QuotaScopeTableQuery.graphql';
import { QuotaScopeTableUnsetMutation } from '../__generated__/QuotaScopeTableUnsetMutation.graphql';
import { bytesToGB } from '../helper/index';
import QuotaSettingModal from './QuotaSettingModal';
import { CloseOutlined, EditFilled } from '@ant-design/icons';
import { App, Empty } from 'antd';
import {
  BAINameActionCell,
  BAITable,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery, useMutation } from 'react-relay';

interface Props {
  /**
   * Fully-qualified quota scope id (e.g. `user:<uuid>` or `project:<uuid>`).
   * When undefined, the table renders an empty placeholder and does not issue
   * the query (gated via `@skip` + `fetchPolicy: 'store-only'`).
   */
  scopeId?: string;
  hostName: string;
}

const QuotaScopeTable: React.FC<Props> = ({ scopeId, hostName }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  // Defer the scope id so switching scopes keeps the previous row visible
  // until the new data arrives, instead of falling through to the Suspense
  // fallback for one render.
  const queryVariables = {
    quota_scope_id: scopeId ?? '',
    storage_host_name: hostName,
    skip: !scopeId,
  };
  const deferredQueryVariables = useDeferredValue(queryVariables);

  const { quota_scope } = useLazyLoadQuery<QuotaScopeTableQueryType>(
    graphql`
      query QuotaScopeTableQuery(
        $quota_scope_id: String!
        $storage_host_name: String!
        $skip: Boolean!
      ) {
        quota_scope(
          storage_host_name: $storage_host_name
          quota_scope_id: $quota_scope_id
        ) @skip(if: $skip) {
          id
          quota_scope_id
          storage_host_name
          details {
            hard_limit_bytes
            usage_bytes
          }
          ...QuotaSettingModalFragment
        }
      }
    `,
    deferredQueryVariables,
    {
      // `@skip` alone still issues the request; pair with `store-only` to
      // suppress the network call entirely when no scope is picked.
      fetchPolicy: deferredQueryVariables.skip
        ? 'store-only'
        : 'store-and-network',
    },
  );

  const [isQuotaSettingModalOpen, setIsQuotaSettingModalOpen] = useState(false);

  const [commitUnsetQuotaScope] = useMutation<QuotaScopeTableUnsetMutation>(
    graphql`
      mutation QuotaScopeTableUnsetMutation(
        $quota_scope_id: String!
        $storage_host_name: String!
      ) {
        unset_quota_scope(
          quota_scope_id: $quota_scope_id
          storage_host_name: $storage_host_name
        ) {
          quota_scope {
            id
            quota_scope_id
            storage_host_name
            details {
              hard_limit_bytes
            }
          }
        }
      }
    `,
  );

  const selectProjectOrUserFirst = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<div>{t('storageHost.quotaSettings.SelectFirst')}</div>}
    />
  );

  return (
    <>
      <BAITable
        rowKey="id"
        pagination={false}
        loading={queryVariables !== deferredQueryVariables}
        columns={[
          {
            title: t('storageHost.quotaSettings.QuotaScopeId'),
            dataIndex: 'quota_scope_id',
            key: 'quota_scope_id',
            render: (value: string, record) => (
              <BAINameActionCell
                title={<code>{value}</code>}
                showActions="always"
                actions={[
                  {
                    key: 'edit',
                    title: t('button.Edit'),
                    icon: <EditFilled />,
                    onClick: () => setIsQuotaSettingModalOpen(true),
                    disabled: queryVariables !== deferredQueryVariables, // Disable edit button while loading new data
                  },
                  {
                    key: 'unset',
                    title: t('button.Unset'),
                    icon: <CloseOutlined />,
                    type: 'danger',
                    disabled: queryVariables !== deferredQueryVariables, // Disable unset button while loading new data
                    popConfirm: {
                      title: t('storageHost.quotaSettings.UnsetCustomSettings'),
                      description: t(
                        'storageHost.quotaSettings.ConfirmUnsetCustomQuota',
                      ),
                      placement: 'bottom',
                      // Returning a Promise makes Popconfirm show a loading
                      // spinner on its OK button until the mutation settles.
                      onConfirm: () =>
                        new Promise<void>((resolve) => {
                          commitUnsetQuotaScope({
                            variables: {
                              quota_scope_id: record.quota_scope_id,
                              storage_host_name: record.storage_host_name,
                            },
                            onCompleted() {
                              message.success(
                                t(
                                  'storageHost.quotaSettings.QuotaScopeSuccessfullyUpdated',
                                ),
                              );
                              resolve();
                            },
                            onError(error) {
                              message.error(error?.message);
                              resolve();
                            },
                          });
                        }),
                    },
                  },
                ]}
              />
            ),
          },
          {
            title: t('storageHost.HardLimit') + ' (GB)',
            dataIndex: ['details', 'hard_limit_bytes'],
            key: 'hard_limit_bytes',
            render: (value) => <>{bytesToGB(value)}</>,
          },
          {
            title: t('storageHost.Usage') + ' (GB)',
            dataIndex: ['details', 'usage_bytes'],
            key: 'usage_bytes',
            render: (value) => <>{bytesToGB(value)}</>,
          },
        ]}
        dataSource={quota_scope ? [quota_scope] : []}
        locale={{
          emptyText: selectProjectOrUserFirst,
        }}
      />
      <BAIUnmountAfterClose>
        <QuotaSettingModal
          open={isQuotaSettingModalOpen}
          quotaScopeFrgmt={quota_scope ?? null}
          onRequestClose={() => setIsQuotaSettingModalOpen(false)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default QuotaScopeTable;
