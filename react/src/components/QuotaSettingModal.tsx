import { QuotaSettingModalFragment$key } from '../__generated__/QuotaSettingModalFragment.graphql';
import { QuotaSettingModalSetMutation } from '../__generated__/QuotaSettingModalSetMutation.graphql';
import { GBToBytes, bytesToGB } from '../helper';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Form, FormInstance, Input, message } from 'antd';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

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
          },
        },
        onCompleted(response) {
          if (response?.set_quota_scope?.quota_scope?.id) {
            message.success(
              t('storageHost.quotaSettings.QuotaScopeSuccessfullyUpdated'),
            );
          } else {
            message.error(t('dialog.ErrorOccurred'));
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
      destroyOnHidden
      onOk={_onOk}
      confirmLoading={isInFlightCommitSetQuotaScope}
      onCancel={onRequestClose}
      title={t('storageHost.quotaSettings.QuotaSettings')}
    >
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 20 }}
        validateTrigger={['onChange', 'onBlur']}
        style={{ marginBottom: 40, marginTop: 20 }}
      >
        <Form.Item
          name="hard_limit_bytes"
          label={t('storageHost.HardLimit')}
          initialValue={bytesToGB(quotaScope?.details?.hard_limit_bytes)}
          rules={[
            {
              pattern: /^\d+(\.\d+)?$/,
              message:
                t('storageHost.quotaSettings.AllowNumberAndDot') ||
                'Allows numbers and .(dot) only',
            },
          ]}
        >
          <Input
            addonAfter="GB"
            type="number"
            step={0.25}
            style={{ width: '70%' }}
          />
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default QuotaSettingModal;
