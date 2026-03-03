/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { QuotaScopeCardFragment$key } from '../__generated__/QuotaScopeCardFragment.graphql';
import { QuotaScopeCardUnsetMutation } from '../__generated__/QuotaScopeCardUnsetMutation.graphql';
import { bytesToGB } from '../helper/index';
import { EditFilled, PlusOutlined, CloseOutlined } from '@ant-design/icons';
import {
  CardProps,
  Table,
  Button,
  Popconfirm,
  message,
  Empty,
  theme,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface Props extends CardProps {
  quotaScopeFrgmt: QuotaScopeCardFragment$key | null;
  showAddButtonWhenEmpty: boolean;
  onClickEdit: () => void;
}
const QuotaScopeCard: React.FC<Props> = ({
  quotaScopeFrgmt,
  showAddButtonWhenEmpty,
  onClickEdit,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const quota_scope = useFragment(
    graphql`
      fragment QuotaScopeCardFragment on QuotaScope {
        id
        quota_scope_id
        storage_host_name
        details {
          hard_limit_bytes
          usage_bytes
        }
        ...QuotaSettingModalFragment
      }
    `,
    quotaScopeFrgmt,
  );

  const [commitUnsetQuotaScope, isInFlightCommitUnsetQuotaScope] =
    useMutation<QuotaScopeCardUnsetMutation>(graphql`
      mutation QuotaScopeCardUnsetMutation(
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
    `);

  const selectProjectOrUserFirst = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={<div>{t('storageHost.quotaSettings.SelectFirst')}</div>}
    />
  );

  const addQuotaConfigsWhenEmpty = (
    <Empty
      style={{ width: '100%' }}
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <>
          <div style={{ margin: 10 }}>
            {t('storageHost.quotaSettings.ClickSettingButton')}
          </div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => onClickEdit && onClickEdit()}
          >
            {t('storageHost.quotaSettings.AddQuotaConfigs')}
          </Button>
        </>
      }
    />
  );

  return (
    <Table
      bordered
      rowKey="id"
      columns={[
        {
          title: t('storageHost.quotaSettings.QuotaScopeId'),
          dataIndex: 'quota_scope_id',
          key: 'quota_scope_id',
          render: (value) => <code>{value}</code>,
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
        {
          title: t('general.Control'),
          key: 'control',
          render: () => (
            <BAIFlex gap={token.marginSM}>
              <Button
                icon={<EditFilled />}
                onClick={() => onClickEdit && onClickEdit()}
              >
                {t('button.Edit')}
              </Button>
              <Popconfirm
                title={t('storageHost.quotaSettings.UnsetCustomSettings')}
                description={t(
                  'storageHost.quotaSettings.ConfirmUnsetCustomQuota',
                )}
                placement="bottom"
                onConfirm={() => {
                  if (quota_scope) {
                    commitUnsetQuotaScope({
                      variables: {
                        quota_scope_id: quota_scope.quota_scope_id,
                        storage_host_name: quota_scope.storage_host_name,
                      },
                      onCompleted() {
                        message.success(
                          t(
                            'storageHost.quotaSettings.QuotaScopeSuccessfullyUpdated',
                          ),
                        );
                      },
                      onError(error) {
                        message.error(error?.message);
                      },
                    });
                  }
                }}
              >
                <Button
                  loading={isInFlightCommitUnsetQuotaScope}
                  danger
                  icon={<CloseOutlined />}
                >
                  {t('button.Unset')}
                </Button>
              </Popconfirm>
            </BAIFlex>
          ),
        },
      ]}
      dataSource={quota_scope ? [quota_scope] : []}
      locale={{
        emptyText: showAddButtonWhenEmpty
          ? addQuotaConfigsWhenEmpty
          : selectProjectOrUserFirst,
      }}
      pagination={false}
    />
  );
};

export default QuotaScopeCard;
