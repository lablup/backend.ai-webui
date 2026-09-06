/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import BAIFormItem from './BAIFormItem';
import { SchedulerType } from './ConfigurationsSettingList';
import {
  AstryxFormCheckbox,
  AstryxFormNumberInput,
  AstryxFormSelector,
} from './astryxFormControls';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIQuestionIconWithTooltip,
  BAIModal,
  BAIModalProps,
  BAIFlex,
} from 'backend.ai-ui';
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
  const baiClient = useSuspendedBackendaiClient();
  const { message } = App.useApp();

  return (
    <BAIModal
      title={
        <BAIFlex align="center" gap="xxs">
          {t('settings.ConfigPerJobSchduler')}
          <BAIQuestionIconWithTooltip
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
        <BAIFormItem
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
            <Text color="secondary" size="sm">
              {t('settings.SchedulerSelectComment')}
            </Text>
          }
        >
          <AstryxFormSelector
            label={t('settings.Scheduler')}
            isLoading={isUpdatingSchedulerOptions}
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
              {
                label: 'Fair Share',
                value: 'fair-share',
              },
            ]}
          />
        </BAIFormItem>
        <BAIFlex direction="column" align="start" style={{ width: '100%' }}>
          <Text weight="semibold">{t('settings.SchedulerOptions')}</Text>
          <BAIFormItem
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
                      {/* No wrapper element: `Form.Item` clones its DIRECT
                          child, so the former `<div style={{flex:1}}>`
                          absorbed `value`/`onChange` and the field never
                          bound. `width="100%"` (the adapter's default) covers
                          what the flex wrapper did. */}
                      <AstryxFormNumberInput
                        label={t('settings.SessionCreationRetries')}
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
                    <AstryxFormCheckbox
                      label={t('settings.Unset')}
                      disabled={
                        formRef.current?.getFieldValue('schedulerType') ===
                          undefined || isUpdatingSchedulerOptions
                      }
                      onChange={(checked) => {
                        if (checked) {
                          formRef.current?.setFieldsValue({
                            num_retries_to_skip: null,
                          });
                        }
                      }}
                    />
                  </Form.Item>
                )}
              </Form.Item>
            </BAIFlex>
          </BAIFormItem>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default SchedulerSettingModal;
