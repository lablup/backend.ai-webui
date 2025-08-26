import BAIModal, { BAIModalProps } from './BAIModal';
import { DatePicker, Form, FormInstance, message, Select } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useMutation } from 'react-relay';
import { DeploymentTokenGenerationModalMutation } from 'src/__generated__/DeploymentTokenGenerationModalMutation.graphql';

interface DeploymentTokenGenerationModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onClose'> {
  deploymentId: string;
  onRequestClose: (success?: boolean) => void;
}

const DeploymentTokenGenerationModal: React.FC<
  DeploymentTokenGenerationModalProps
> = ({ onRequestClose, onCancel, deploymentId, ...baiModalProps }) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance>(null);
  // expiryOption은 Form.Item에서 관리

  const [commitCreateAccessToken, isInFlightCreateAccessToken] =
    useMutation<DeploymentTokenGenerationModalMutation>(graphql`
      mutation DeploymentTokenGenerationModalMutation(
        $input: CreateAccessTokenInput!
      ) {
        createAccessToken(input: $input) {
          accessToken {
            id
            token
            createdAt
            validUntil
          }
        }
      }
    `);

  const handleOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        let validUntil;
        if (values.expiryOption === 'custom') {
          validUntil = values.datetime.unix();
        } else {
          const daysToAdd = parseInt(values.expiryOption.replace('days', ''));
          validUntil = dayjs().add(daysToAdd, 'day').unix();
        }

        commitCreateAccessToken({
          variables: {
            input: {
              validUntil: validUntil,
              modelDeploymentId: deploymentId,
            },
          },
          onCompleted: (res, errors) => {
            if (!res?.createAccessToken?.accessToken) {
              message.error(t('deployment.TokenGenerationFailed'));
              return;
            }
            if (errors && errors.length > 0) {
              const errorMsgList = errors.map((error) => error.message);
              for (const error of errorMsgList) {
                message.error(error);
              }
            } else {
              message.success(t('deployment.TokenGenerated'));
              onRequestClose(true);
            }
          },
          onError: (err) => {
            if (err?.message?.includes('valid_until is older than now')) {
              message.error(t('deployment.TokenExpiredDateError'));
              return;
            } else {
              message.error(t('deployment.TokenGenerationFailed'));
              console.log(err);
            }
          },
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okText={t('button.Generate')}
      confirmLoading={isInFlightCreateAccessToken}
      title={t('deployment.GenerateNewToken')}
    >
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 12 }}
        initialValues={{
          expiryOption: '7days',
          datetime: dayjs().add(7, 'day'),
        }}
        validateTrigger={['onChange', 'onBlur']}
      >
        <BAIFlex direction="column" gap="sm" align="stretch" justify="center">
          <BAIFlex direction="row" align="stretch" justify="around">
            <Form.Item
              name="expiryOption"
              label={t('deployment.ExpirationDate')}
              rules={[
                {
                  required: true,
                  message: t('deployment.PleaseSelectTime'),
                },
              ]}
            >
              <Select
                style={{ width: 200 }}
                options={[
                  { value: '7days', label: t('general.Days', { num: 7 }) },
                  { value: '30days', label: t('general.Days', { num: 30 }) },
                  { value: '90days', label: t('general.Days', { num: 90 }) },
                  { value: 'custom', label: t('deployment.Custom') },
                ]}
              />
            </Form.Item>
          </BAIFlex>
          <Form.Item dependencies={['expiryOption']} noStyle>
            {({ getFieldValue }) =>
              getFieldValue('expiryOption') === 'custom' ? (
                <BAIFlex direction="row" align="stretch" justify="around">
                  <Form.Item
                    name="datetime"
                    label={t('deployment.CustomExpirationDate')}
                    rules={[
                      {
                        type: 'object' as const,
                        required: true,
                        message: t('deployment.PleaseSelectTime'),
                      },
                      () => ({
                        validator(_, value) {
                          if (value && value.isAfter(dayjs())) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(t('deployment.TokenExpiredDateError')),
                          );
                        },
                      }),
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm:ss"
                      style={{ width: 200 }}
                    />
                  </Form.Item>
                </BAIFlex>
              ) : null
            }
          </Form.Item>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default DeploymentTokenGenerationModal;
