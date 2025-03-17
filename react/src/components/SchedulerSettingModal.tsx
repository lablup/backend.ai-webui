import BAIModal, { BAIModalProps } from './BAIModal';
import { SchedulerOptions, SchedulerType } from './ConfigurationsSettingList';
import Flex from './Flex';
import FormItemWithCheckbox from './FormItemWithCheckbox';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Button, Form, InputNumber, Select, Typography } from 'antd';
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
        <Flex align="center" gap="xxs">
          {t('settings.ConfigPerJobSchduler')}
          <QuestionIconWithTooltip
            title={t('settings.ConfigPerJobSchdulerDescription')}
          />
        </Flex>
      }
      open={open}
      centered
      width={'auto'}
      onCancel={onRequestClose}
      footer={[
        <Button key="schedulerCancel" onClick={onRequestClose}>
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
                    if (
                      values.num_retries_to_skip_checkbox ||
                      values.num_retries_to_skip === null ||
                      values.num_retries_to_skip === undefined
                    ) {
                      onDelete(values.schedulerType, 'num_retries_to_skip');
                    } else {
                      onSave(values.schedulerType, {
                        num_retries_to_skip: values.num_retries_to_skip,
                      });
                    }
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
              console.log(newOptions);
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
            label={t('settings.SessionCreationRetries')}
            required
            tooltip={t('settings.ConfigPerJobSchdulerDescription')}
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
