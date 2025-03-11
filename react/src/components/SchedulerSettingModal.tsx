import BAIModal, { BAIModalProps } from './BAIModal';
import { SchedulerOptions, SchedulerType } from './ConfigurationsSettingList';
import Flex from './Flex';
import FormItemWithCheckbox from './FormItemWithCheckbox';
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
  onDelete: (schedulerType: SchedulerType, key: string) => void;
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
          key="schedulerCancel"
          onClick={() => {
            // if (
            //   formRef.current &&
            //   formRef.current.getFieldValue('schedulerType')
            // ) {
            //   onDelete(formRef.current.getFieldValue('schedulerType'));
            //   const formValues = formRef.current.getFieldsValue();
            //   const newValues = Object.keys(formValues).reduce(
            //     (acc, key) => {
            //       acc[key] = 0;
            //       return acc;
            //     },
            //     {} as Record<keyof SchedulerOptions, any>,
            //   );
            //   formRef.current.setFieldsValue(
            //     _.omit(newValues, 'schedulerType'),
            //   );
            // }
            onRequestClose();
          }}
        >
          {t('button.Cancel')}
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
                    Object.entries(_.omit(values, 'schedulerType')).forEach(
                      ([key, value]) => {
                        console.log(key, value);
                        if (value === null || value === '' || !value) {
                          onDelete(values.schedulerType, key);
                        } else {
                          onSave(values.schedulerType, { [key]: value });
                        }
                      },
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
      <Form ref={formRef} layout="vertical">
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
          <FormItemWithCheckbox
            label={
              <Flex align="center">
                {t('settings.SessionCreationRetries')}
                <Tooltip title={t('settings.ConfigPerJobSchdulerDescription')}>
                  <Button type="link" icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Flex>
            }
            required
            name="num_retries_to_skip"
          >
            <InputNumber min={0} max={1000} style={{ width: '100%' }} />
          </FormItemWithCheckbox>
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default SchedulerSettingModal;
