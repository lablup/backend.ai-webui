import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import { DatePicker, Form, FormInstance, message, Select } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

// import { graphql, useFragment } from "react-relay";

interface EndpointTokenGenerationModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onClose'> {
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
  const formRef = useRef<FormInstance>(null);

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
    formRef.current?.validateFields().then((values) => {
      let validUntil: number;

      if (values.expiryOption === 'custom') {
        validUntil = values.datetime.unix();
      } else {
        const daysToAdd = parseInt(values.expiryOption.replace('days', ''));
        validUntil = dayjs().add(daysToAdd, 'day').unix();
      }

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
      confirmLoading={mutationToGenerateToken.isPending}
      centered
      title={t('modelService.GenerateNewToken')}
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
        style={{ maxWidth: 500 }}
      >
        <BAIFlex direction="column" gap="sm" align="stretch">
          <BAIFlex direction="row" align="stretch" justify="around">
            <Form.Item
              name="expiryOption"
              label={t('modelService.ExpiredDate')}
              rules={[
                {
                  required: true,
                  message: t('modelService.PleaseSelectTime'),
                },
              ]}
            >
              <Select
                style={{ width: 200 }}
                options={[
                  { value: '7days', label: t('general.Days', { num: 7 }) },
                  { value: '30days', label: t('general.Days', { num: 30 }) },
                  { value: '90days', label: t('general.Days', { num: 90 }) },
                  { value: 'custom', label: t('modelService.Custom') },
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
                    label={t('modelService.CustomExpirationDate')}
                    rules={[
                      {
                        type: 'object' as const,
                        required: true,
                        message: t('modelService.PleaseSelectTime'),
                      },
                      () => ({
                        validator(_, value) {
                          if (value && value.isAfter(dayjs())) {
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
                </BAIFlex>
              ) : null
            }
          </Form.Item>
        </BAIFlex>
        {/* <BAIFlex direction="row" align="stretch" justify="end">
          <Tag style={{height: 30}}>{t('modelService.CurrentTime')}</Tag>
          <TimeContainer></TimeContainer>
        </BAIFlex> */}
      </Form>
    </BAIModal>
  );
};

export default EndpointTokenGenerationModal;
