import { baiSignedRequestWithPromise } from '../helper';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { FormInstance, message, Form, Select, DatePicker } from 'antd';
import { BAIModalProps, ESMClientErrorResponse, BAIModal } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface EndpointTokenGenerationModalProps
  extends Omit<BAIModalProps, 'onOk' | 'onClose'> {
  endpoint_id: string;
  onRequestClose: (success?: boolean) => void;
}

interface EndpointTokenGenerationInput {
  valid_until?: number; // Unix epoch time
}

type FormValue = {
  expiryOption: 7 | 30 | 90 | 'custom';
  datetime: dayjs.Dayjs;
};
const EndpointTokenGenerationModal: React.FC<
  EndpointTokenGenerationModalProps
> = ({ onRequestClose, onCancel, endpoint_id, ...baiModalProps }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const formRef = useRef<FormInstance<FormValue> | null>(null);

  const mutationToGenerateToken = useTanMutation<
    unknown,
    ESMClientErrorResponse,
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
        const daysToAdd = values.expiryOption;
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
      destroyOnHidden
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('modelService.Generate')}
      confirmLoading={mutationToGenerateToken.isPending}
      centered
      title={t('modelService.GenerateNewToken')}
      width={400}
    >
      <Form
        ref={formRef}
        initialValues={{
          expiryOption: 7,
          datetime: dayjs().add(7, 'day'),
        }}
        validateTrigger={['onChange', 'onBlur']}
        layout="vertical"
        style={{ justifyItems: 'center' }}
      >
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
          <Select<FormValue['expiryOption']>
            style={{ width: 200 }}
            options={[
              { value: 7, label: t('general.Days', { num: 7 }) },
              { value: 30, label: t('general.Days', { num: 30 }) },
              { value: 90, label: t('general.Days', { num: 90 }) },
              { value: 'custom', label: t('modelService.Custom') },
            ]}
            onChange={(value) => {
              // For the convenience of users, set the default date to 7, 30, or 90 days later when not custom
              if (value !== 'custom') {
                formRef.current?.setFieldValue(
                  'datetime',
                  dayjs().add(value, 'day'),
                );
              }
            }}
          />
        </Form.Item>
        <Form.Item dependencies={['expiryOption']} noStyle>
          {({ getFieldValue }) => (
            <Form.Item
              name="datetime"
              hidden={getFieldValue('expiryOption') !== 'custom'}
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
          )}
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default EndpointTokenGenerationModal;
