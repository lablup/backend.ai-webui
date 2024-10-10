import { GBToBytes, bytesToGB } from '../helper';
import BAIModal, { BAIModalProps } from './BAIModal';
import { QuotaSettingModalFragment$key } from './__generated__/QuotaSettingModalFragment.graphql';
import { QuotaSettingModalSetMutation } from './__generated__/QuotaSettingModalSetMutation.graphql';
import { Form, FormInstance, InputNumber, message } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, useMutation } from 'react-relay';

interface Props extends BAIModalProps {
  quotaScopeFrgmt?: QuotaSettingModalFragment$key | null;
  onRequestClose: () => void;
}

const QuotaSettingModal: React.FC<Props> = ({
  quotaScopeFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);

  const quotaScope = useFragment(
    graphql`
      fragment QuotaSettingModalFragment on QuotaScope {
        id
        quota_scope_id
        storage_host_name
        details {
          hard_limit_bytes
          hard_limit_inodes
        }
      }
    `,
    quotaScopeFrgmt,
  );

  const [commitSetQuotaScope, isInFlightCommitSetQuotaScope] =
    useMutation<QuotaSettingModalSetMutation>(graphql`
      mutation QuotaSettingModalSetMutation(
        $quota_scope_id: String!
        $storage_host_name: String!
        $props: QuotaScopeInput!
      ) {
        set_quota_scope(
          quota_scope_id: $quota_scope_id
          storage_host_name: $storage_host_name
          props: $props
        ) {
          quota_scope {
            id
            quota_scope_id
            storage_host_name
            details {
              hard_limit_bytes
              hard_limit_inodes
            }
          }
        }
      }
    `);

  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    formRef.current?.validateFields().then((values) => {
      commitSetQuotaScope({
        variables: {
          quota_scope_id: quotaScope?.quota_scope_id || '',
          storage_host_name: quotaScope?.storage_host_name || '',
          props: {
            hard_limit_bytes: GBToBytes(values?.hard_limit_bytes),
            hard_limit_inodes: values?.hard_limit_inodes,
          },
        },
        onCompleted(response, errors) {
          if (!response?.set_quota_scope?.quota_scope?.id || errors) {
            message.error(t('dialog.ErrorOccurred'));
          } else {
            message.success(
              t('storageHost.quotaSettings.QuotaScopeSuccessfullyUpdated'),
            );
          }
          onRequestClose();
        },
        onError(error) {
          console.log(error);
          message.error(error?.message);
        },
      });
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={_onOk}
      confirmLoading={isInFlightCommitSetQuotaScope}
      onCancel={onRequestClose}
      title={t('storageHost.quotaSettings.QuotaSettings')}
    >
      <Form
        ref={formRef}
        layout="vertical"
        requiredMark="optional"
        preserve={false}
        initialValues={{
          hard_limit_bytes: quotaScope?.details?.hard_limit_bytes
            ? bytesToGB(quotaScope?.details?.hard_limit_bytes)
            : undefined,
          hard_limit_inodes: quotaScope?.details?.hard_limit_inodes,
        }}
      >
        <Form.Item
          name="hard_limit_bytes"
          label={t('storageHost.HardLimit')}
          rules={[
            {
              pattern: /^\d+(\.\d+)?$/,
              message:
                t('storageHost.quotaSettings.AllowNumberAndDot') ||
                'Allows numbers and .(dot) only',
            },
          ]}
        >
          <InputNumber addonAfter="GB" step={0.25} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="hard_limit_inodes"
          label={t('storageHost.HardLimitInodes')}
        >
          <InputNumber style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default QuotaSettingModal;
