import BAIModal, { BAIModalProps } from './BAIModal';
import { DatePicker, Form, FormInstance, message } from 'antd';
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
    formRef.current?.validateFields().then((values) => {
      const validUntil = values.datetime.unix();
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
    });
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
      okText={t('button.Generate')}
      confirmLoading={isInFlightCreateAccessToken}
      centered
      title={t('deployment.GenerateNewToken')}
    >
      <Form
        ref={formRef}
        preserve={false}
        labelCol={{ span: 10 }}
        initialValues={{
          datetime: dayjs().add(24, 'hour'),
        }}
        validateTrigger={['onChange', 'onBlur']}
      >
        <BAIFlex direction="column" gap="sm" align="stretch" justify="center">
          <Form.Item
            name="datetime"
            label={t('deployment.ExpiredDate')}
            rules={[
              {
                type: 'object',
                required: true,
                message: t('deployment.PleaseSelectTime'),
              },
              () => ({
                validator(_, value) {
                  if (value.isAfter(dayjs())) {
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
      </Form>
    </BAIModal>
  );
};

export default DeploymentTokenGenerationModal;
