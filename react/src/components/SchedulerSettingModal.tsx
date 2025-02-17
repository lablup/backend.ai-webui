import {
  optionRange,
  SchedulerOptions,
  SchedulerType,
} from '../hooks/useBAIConfigurationsSetting';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Button, Form, InputNumber, Select, Tooltip, Typography } from 'antd';
import { FormInstance } from 'antd/lib';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SchedulerSettingModalProps extends BAIModalProps {
  onRequestClose: () => void;
  onSave: (
    key: SchedulerType,
    value: { [key: keyof SchedulerOptions | string]: string },
  ) => void;
  onSchedulerTypeChange: (
    schedulerType: SchedulerType,
  ) => Promise<SchedulerOptions>;
  onDelete: (key: SchedulerType) => void;
}

const SchedulerSettingModal = ({
  onRequestClose,
  open,
  onSave,
  onSchedulerTypeChange,
  onDelete,
}: SchedulerSettingModalProps) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);
  const labels: {
    [key: keyof SchedulerOptions]: string;
  } = {
    num_retries_to_skip: t('settings.SessionCreationRetries'),
  };
  const tooltipText: { [key: keyof SchedulerOptions]: string } = {
    num_retries_to_skip: t('settings.ConfigPerJobSchdulerDescription'),
  };
  const scheduleOptions: (keyof SchedulerOptions)[] = ['num_retries_to_skip'];

  return (
    <BAIModal
      title={
        <Flex align="center">
          {t('settings.ConfigPerJobSchduler')}
          <Tooltip title={t('settingConfigPerJobSchdulerDescriptions.')}>
            <Button type="link" size="large" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </Flex>
      }
      open={open}
      centered
      width={'auto'}
      onCancel={onRequestClose}
      footer={[
        <Button
          key="schedulerDelete"
          onClick={() => {
            if (
              formRef.current &&
              formRef.current.getFieldValue('schedulerType')
            ) {
              onDelete(formRef.current.getFieldValue('schedulerType'));
              const formValues = formRef.current.getFieldsValue();
              const newValues = Object.keys(formValues).reduce(
                (acc, key) => {
                  acc[key] = 0;
                  return acc;
                },
                {} as Record<keyof SchedulerOptions, any>,
              );
              formRef.current.setFieldsValue(
                _.omit(newValues, 'schedulerType'),
              );
            }
          }}
        >
          {t('button.DeleteAll')}
        </Button>,
        <Button
          key="schedulerSave"
          type="primary"
          onClick={() => {
            if (formRef.current) {
              formRef.current
                .validateFields()
                .then((values) => {
                  if (values.schedulerType) {
                    onSave(
                      values.schedulerType,
                      _.omit(values, 'schedulerType'),
                    );
                  }
                })
                .catch(() => {});
            }
          }}
        >
          {t('button.Save')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form ref={formRef}>
        <Form.Item
          label={t('settings.Scheduler')}
          name="schedulerType"
          required
          rules={[
            {
              required: true,
              message: t('data.explorer.ValueRequired'),
            },
          ]}
        >
          <Select
            popupMatchSelectWidth={false}
            onChange={async (value) => {
              const newOptions: SchedulerOptions =
                await onSchedulerTypeChange(value);
              formRef.current?.setFieldsValue(newOptions);
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
        <Flex direction="column" align="start" style={{ width: '100%' }}>
          <Typography.Text strong>
            {t('settings.SchedulerOptions')}
          </Typography.Text>
          {scheduleOptions.map((key) => (
            <Form.Item
              label={
                <Flex align="center">
                  {labels[key]}
                  <Tooltip title={tooltipText[key]}>
                    <Button type="link" icon={<InfoCircleOutlined />} />
                  </Tooltip>
                </Flex>
              }
              name={key}
              required
              rules={[
                {
                  required: true,
                  message: t('data.explorer.ValueRequired'),
                },
              ]}
              key={key}
            >
              <InputNumber
                min={optionRange[key].min}
                max={optionRange[key].max}
                style={{ width: '100%' }}
              />
            </Form.Item>
          ))}
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default SchedulerSettingModal;
