import { useSuspendedBackendaiClient } from '../hooks';
import BAIModal, { BAIModalProps } from './BAIModal';
import { SchedulerType } from './ConfigurationsSettingList';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { App, Form, InputNumber, Select, theme, Typography } from 'antd';
import Checkbox from 'antd/es/checkbox/Checkbox';
import { FormInstance } from 'antd/lib';
import { BAIFlex } from 'backend.ai-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SchedulerSettingModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const SchedulerSettingModal = ({
  onRequestClose,
  open,
}: SchedulerSettingModalProps) => {
  const { t } = useTranslation();
  const [isFetchingSchedulerOptions, setIsFetchingSchedulerOptions] =
    useState(false);
  const [isUpdatingSchedulerOptions, setIsUpdatingSchedulerOptions] =
    useState(false);
  const formRef = useRef<FormInstance>(null);
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { message } = App.useApp();

  return (
    <BAIModal
      title={
        <BAIFlex align="center" gap="xxs">
          {t('settings.ConfigPerJobSchduler')}
          <QuestionIconWithTooltip
            title={t('settings.ConfigPerJobSchdulerDescription')}
          />
        </BAIFlex>
      }
      confirmLoading={isFetchingSchedulerOptions}
      open={open}
      centered
      width={'auto'}
      onCancel={onRequestClose}
      onOk={() => {
        if (formRef.current) {
          formRef.current
            .validateFields()
            .then(async (values) => {
              const schedulerType = values.schedulerType as SchedulerType;
              const numRetriesToSkip = values.num_retries_to_skip;
              try {
                if (values.num_retries_to_skip_checkbox) {
                  setIsFetchingSchedulerOptions(true);
                  const { result } = await baiClient.setting.delete(
                    `plugins/scheduler/${schedulerType}/num_retries_to_skip`,
                    true,
                  );
                  if (result === 'ok') {
                    message.success(t('notification.SuccessfullyUpdated'));
                    onRequestClose();
                  } else {
                    throw new Error();
                  }
                } else {
                  if (schedulerType !== 'fifo' && numRetriesToSkip !== '0') {
                    throw new Error(t('settings.FifoOnly'));
                  }
                  setIsFetchingSchedulerOptions(true);
                  const { result } = await baiClient.setting.set(
                    `plugins/scheduler/${schedulerType}/num_retries_to_skip`,
                    numRetriesToSkip,
                  );
                  if (result === 'ok') {
                    message.success(t('notification.SuccessfullyUpdated'));
                    onRequestClose();
                  } else {
                    throw new Error();
                  }
                }
              } catch (e: any) {
                message.error(e?.message ?? t('settings.FailedToSaveSettings'));
              } finally {
                setIsFetchingSchedulerOptions(false);
              }
            })
            .catch(() => {});
        }
      }}
      cancelText={t('button.Cancel')}
      okText={t('button.Save')}
      okButtonProps={{
        type: 'primary',
      }}
      destroyOnHidden
    >
      <Form ref={formRef} layout="vertical">
        <Form.Item
          label={t('settings.Scheduler')}
          name="schedulerType"
          required
          rules={[
            {
              required: true,
              message: t('settings.SchedulerRequired'),
            },
          ]}
          extra={
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {t('settings.SchedulerSelectComment')}
            </Typography.Text>
          }
        >
          <Select
            loading={isUpdatingSchedulerOptions}
            popupMatchSelectWidth={false}
            onChange={(value) => {
              if (value !== null) {
                setIsUpdatingSchedulerOptions(true);
                baiClient.setting
                  .get(`plugins/scheduler/${value}/num_retries_to_skip`)
                  .then((res) => {
                    formRef.current?.setFieldsValue({
                      num_retries_to_skip: res.result,
                      num_retries_to_skip_checkbox: res.result === null,
                    });
                  })
                  .finally(() => {
                    setIsUpdatingSchedulerOptions(false);
                  });
              }
            }}
            options={[
              {
                label: 'FIFO',
                value: 'fifo',
              },
              {
                label: 'LIFO',
                value: 'lifo',
              },
              {
                label: 'DRF',
                value: 'drf',
              },
            ]}
          />
        </Form.Item>
        <BAIFlex direction="column" align="start" style={{ width: '100%' }}>
          <Typography.Text strong>
            {t('settings.SchedulerOptions')}
          </Typography.Text>
          <Form.Item
            label={t('settings.SessionCreationRetries')}
            required
            style={{
              width: '100%',
            }}
          >
            <BAIFlex
              gap="sm"
              align="center"
              style={{
                width: '100%',
              }}
            >
              <Form.Item
                noStyle
                dependencies={['schedulerType', 'num_retries_to_skip_checkbox']}
                style={{
                  width: '100%',
                }}
              >
                {() => {
                  return (
                    <Form.Item
                      noStyle
                      name="num_retries_to_skip"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (
                              formRef.current?.getFieldValue(
                                'num_retries_to_skip_checkbox',
                              ) === true
                            ) {
                              return Promise.resolve();
                            }
                            if (value === undefined || value === null) {
                              return Promise.reject(
                                t('data.explorer.ValueRequired'),
                              );
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={1000}
                        disabled={
                          formRef.current?.getFieldValue(
                            'num_retries_to_skip_checkbox',
                          ) === true ||
                          formRef.current?.getFieldValue('schedulerType') ===
                            undefined ||
                          isUpdatingSchedulerOptions
                        }
                        style={{
                          flex: 1,
                        }}
                      />
                    </Form.Item>
                  );
                }}
              </Form.Item>
              <Form.Item noStyle dependencies={['schedulerType']}>
                {() => (
                  <Form.Item
                    noStyle
                    name="num_retries_to_skip_checkbox"
                    valuePropName="checked"
                  >
                    <Checkbox
                      disabled={
                        formRef.current?.getFieldValue('schedulerType') ===
                          undefined || isUpdatingSchedulerOptions
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          formRef.current?.setFieldsValue({
                            num_retries_to_skip: null,
                          });
                        }
                      }}
                    >
                      {t('settings.Unset')}
                    </Checkbox>
                  </Form.Item>
                )}
              </Form.Item>
            </BAIFlex>
          </Form.Item>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default SchedulerSettingModal;
