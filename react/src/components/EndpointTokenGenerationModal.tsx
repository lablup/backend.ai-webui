import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { Alert, DatePicker, Form, message } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';

// import { graphql, useFragment } from "react-relay";

interface EndpointTokenGenerationModalProps
  extends Omit<BAIModalProps, 'onOK' | 'onClose'> {
  endpoint_id: string;
  onRequestClose: (success?: boolean) => void;
}

interface EndpointTokenGenerationInput {
  valid_until?: number; // Unix epoch time
}

const EndpointTokenGenerationModal: React.FC<
  EndpointTokenGenerationModalProps
> = ({ onRequestClose, onCancel, endpoint_id, ...baiModalProps }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const [form] = Form.useForm();

  const mutationToGenerateToken = useTanMutation<
    unknown,
    {
      message?: string;
    },
    EndpointTokenGenerationInput
  >({
    mutationFn: (values) => {
      const body = {
        valid_until: values.valid_until,
      };
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: `/services/${endpoint_id}/token`,
        body,
        client: baiClient,
      });
    },
  });

  // Apply any operation after clicking OK button
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      const validUntil = values.datetime.unix();
      mutationToGenerateToken.mutate(
        {
          valid_until: validUntil,
        },
        {
          onSuccess: () => {
            message.success(t('modelService.TokenGenerated'));
            onRequestClose(true);
          },
          onError: (err) => {
            if (err?.message?.includes('valid_until is older than now')) {
              message.error(t('modelService.TokenExpiredDateError'));
              return;
            } else {
              message.error(t('modelService.TokenGenerationFailed'));
              console.log(err);
            }
          },
        },
      );
    });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    onRequestClose();
  };

  return (
    <BAIModal
      {...baiModalProps}
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('modelService.Generate')}
      confirmLoading={mutationToGenerateToken.isLoading}
      centered
      title={t('modelService.GenerateNewToken')}
    >
      <Form
        preserve={false}
        labelCol={{ span: 10 }}
        initialValues={{
          datetime: dayjs().add(24, 'hour'),
        }}
        validateTrigger={['onChange', 'onBlur']}
        style={{ maxWidth: 500 }}
        form={form}
      >
        <Flex direction="column" gap="sm" align="stretch">
          <Alert
            type="info"
            showIcon
            message={t('modelService.TokenExpiredDateHelp')}
          />
          <Flex direction="row" align="stretch" justify="around">
            <Form.Item
              name="datetime"
              label={t('modelService.ExpiredDate')}
              rules={[
                {
                  type: 'object' as const,
                  required: true,
                  message: t('modelService.PleaseSelectTime'),
                },
                () => ({
                  validator(_, value) {
                    if (value.isAfter(dayjs())) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t('modelService.TokenExpiredDateError')),
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
          </Flex>
        </Flex>
        {/* <Flex direction="row" align="stretch" justify="end">
          <Tag style={{height: 30}}>{t('modelService.CurrentTime')}</Tag>
          <TimeContainer></TimeContainer>
        </Flex> */}
      </Form>
    </BAIModal>
  );
};

export default EndpointTokenGenerationModal;
