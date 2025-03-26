import BAIModal, { BAIModalProps } from './BAIModal';
import { SchedulerOptions, SchedulerType } from './ConfigurationsSettingList';
import Flex from './Flex';
import FormItemWithCheckbox from './FormItemWithCheckbox';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Button, Form, InputNumber, Select, Typography } from 'antd';
import { FormInstance } from 'antd/lib';
import { useEffect, useRef, useState } from 'react';
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
  const [schedulerType, setSchedulerType] = useState<SchedulerType | null>(
    null,
  );
  const formRef = useRef<FormInstance>(null);

  useEffect(() => {
    if (open) {
      setSchedulerType(null);
    }
  }, [open]);

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
                    console.log(values);
                    const numRetries =
                      values[`${values.schedulerType}_num_retries_to_skip`];
                    const isUnset =
                      values[
                        `${values.schedulerType}_num_retries_to_skip_checkbox`
                      ];
                    if (isUnset) {
                      onDelete(values.schedulerType, 'num_retries_to_skip');
                    } else {
                      onSave(values.schedulerType, {
                        num_retries_to_skip: numRetries,
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
              message: t('settings.SchedulerRequired'),
            },
          ]}
          extra={t('settings.SchedulerSelectComment')}
        >
          <Select
            popupMatchSelectWidth={false}
            value={schedulerType}
            onChange={async (value) => {
              const newOptions: SchedulerOptions =
                await onSchedulerTypeChange(value);
              setSchedulerType(value);
              formRef.current?.setFieldsValue({
                [`${value}_num_retries_to_skip`]:
                  newOptions.num_retries_to_skip,
              });
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
          {
            <FormItemWithCheckbox
              label={t('settings.SessionCreationRetries')}
              required
              tooltip={t('settings.ConfigPerJobSchdulerDescription')}
              name={`${schedulerType}_num_retries_to_skip`}
              rules={[
                {
                  validator(_, value) {
                    const isUnset = formRef.current?.getFieldValue(
                      `${schedulerType}_num_retries_to_skip_checkbox`,
                    );

                    if (isUnset) {
                      return Promise.resolve();
                    }
                    if (value === null || value === undefined) {
                      return Promise.reject(t('data.explorer.ValueRequired'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
              disabled={schedulerType === null}
              checkedValue="0"
            >
              <InputNumber
                disabled
                min={0}
                max={1000}
                style={{ width: '100%' }}
              />
            </FormItemWithCheckbox>
          }
        </Flex>
      </Form>
    </BAIModal>
  );
};

export default SchedulerSettingModal;
