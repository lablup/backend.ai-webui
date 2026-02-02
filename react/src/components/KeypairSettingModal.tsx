import { KeypairSettingModalCreateMutation } from '../__generated__/KeypairSettingModalCreateMutation.graphql';
import { KeypairSettingModalFragment$key } from '../__generated__/KeypairSettingModalFragment.graphql';
import { KeypairSettingModalModifyMutation } from '../__generated__/KeypairSettingModalModifyMutation.graphql';
import KeypairResourcePolicySelect from './KeypairResourcePolicySelect';
import { App, Col, Form, Input, InputNumber, type ModalProps, Row } from 'antd';
import { FormInstance } from 'antd/lib';
import { BAIModal } from 'backend.ai-ui';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type KeypairSettingModalFormInput = {
  user_id?: string;
  rate_limit: number;
  resource_policy: string;
};

interface KeypairSettingModalProps extends ModalProps {
  keypairSettingModalFrgmt?: KeypairSettingModalFragment$key | null;
  onRequestClose: (success: boolean) => void;
}

const KeypairSettingModal: React.FC<KeypairSettingModalProps> = ({
  keypairSettingModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<KeypairSettingModalFormInput>>(null);

  const keypair = useFragment(
    graphql`
      fragment KeypairSettingModalFragment on KeyPair {
        rate_limit
        access_key
        resource_policy
      }
    `,
    keypairSettingModalFrgmt,
  );

  const [commitCreateKeypair, isInFlightCommitCreateKeypair] =
    useMutation<KeypairSettingModalCreateMutation>(graphql`
      mutation KeypairSettingModalCreateMutation(
        $user_id: String!
        $props: KeyPairInput!
      ) {
        create_keypair(user_id: $user_id, props: $props) {
          ok
          msg
        }
      }
    `);

  const [commitModifyKeypair, isInFlightCommitModifyKeypair] =
    useMutation<KeypairSettingModalModifyMutation>(graphql`
      mutation KeypairSettingModalModifyMutation(
        $access_key: String!
        $props: ModifyKeyPairInput!
      ) {
        modify_keypair(access_key: $access_key, props: $props) {
          ok
          msg
        }
      }
    `);

  return (
    <BAIModal
      title={
        keypair
          ? t('credential.ModifyKeypairResourcePolicy')
          : t('credential.AddCredential')
      }
      width={500}
      destroyOnHidden
      onOk={() => {
        formRef.current
          ?.validateFields()
          .then((values) => {
            keypair
              ? commitModifyKeypair({
                  variables: {
                    access_key: keypair.access_key ?? '',
                    props: {
                      rate_limit: values.rate_limit,
                      resource_policy: values.resource_policy,
                    },
                  },
                  onCompleted: (res, errors) => {
                    if (!res.modify_keypair?.ok || errors) {
                      message.error(res?.modify_keypair?.msg);
                      onRequestClose(false);
                      return;
                    }
                    message.success(t('notification.SuccessfullyUpdated'));
                    onRequestClose(true);
                  },
                  onError: (error) => {
                    message.error(error.message);
                    onRequestClose(false);
                  },
                })
              : commitCreateKeypair({
                  variables: {
                    user_id: values.user_id ?? '',
                    props: {
                      rate_limit: values.rate_limit,
                      resource_policy: values.resource_policy,
                    },
                  },
                  onCompleted: (res, errors) => {
                    if (!res.create_keypair?.ok || errors) {
                      message.error(res?.create_keypair?.msg);
                      onRequestClose(false);
                      return;
                    }
                    message.success(t('credential.KeypairCreated'));
                    onRequestClose(true);
                  },
                  onError: (error) => {
                    message.error(error.message);
                    onRequestClose(false);
                  },
                });
          })
          .catch(() => {});
      }}
      okButtonProps={{
        loading: isInFlightCommitCreateKeypair || isInFlightCommitModifyKeypair,
      }}
      onCancel={() => onRequestClose(false)}
      {...modalProps}
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={keypair ? { ...keypair } : {}}
      >
        {!keypair && (
          <Form.Item
            name="user_id"
            label={t('credential.UserIDAsEmail')}
            rules={[
              {
                required: true,
              },
              {
                type: 'email',
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="resource_policy"
              label={t('credential.ResourcePolicy')}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <KeypairResourcePolicySelect />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="rate_limit"
              label={t('credential.RateLimitFor15min')}
              rules={[
                {
                  required: true,
                },
                {
                  type: 'number',
                  min: 0,
                  max: 50000,
                },
                {
                  validator(_rule, value) {
                    if (value <= 100) {
                      return Promise.reject(
                        t('credential.WarningLessRateLimit'),
                      );
                    }
                    return Promise.resolve();
                  },
                  warningOnly: true,
                },
              ]}
            >
              <InputNumber min={0} max={50000} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </BAIModal>
  );
};

export default KeypairSettingModal;
