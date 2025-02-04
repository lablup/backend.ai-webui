import {
  NetworkOptions,
  optionRange,
} from '../hooks/useBAIConfigurationsSetting';
import BAIModal, { BAIModalProps } from './BAIModal';
import { Button, Form, InputNumber } from 'antd';
import { FormInstance } from 'antd/lib';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface OverlayNetworkSettingsModalProps extends BAIModalProps {
  onRequestClose: () => void;
  networkOptions: NetworkOptions;
  onSave: (value: { [key: keyof NetworkOptions]: string }) => void;
  onDelete: () => void;
}

const OverlayNetworkSettingModal = ({
  onRequestClose,
  open,
  networkOptions,
  onSave,
  onDelete,
}: OverlayNetworkSettingsModalProps) => {
  const { t } = useTranslation();

  const formRef = useRef<FormInstance>(null);
  const labels: { [key: keyof NetworkOptions]: string } = {
    mtu: 'MTU',
  };

  return (
    <BAIModal
      open={open}
      title={t('settings.OverlayNetworkSettings')}
      onCancel={onRequestClose}
      centered
      width={'auto'}
      footer={[
        <Button
          key="overlayNetworkClose"
          onClick={() => {
            onDelete();
            if (formRef.current) {
              const formValues = formRef.current.getFieldsValue();
              const newValues = Object.keys(formValues).reduce(
                (acc, key) => {
                  acc[key] = null;
                  return acc;
                },
                {} as Record<keyof NetworkOptions, any>,
              );
              formRef.current.setFieldsValue(newValues);
            }
          }}
        >
          {t('button.DeleteAll')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form ref={formRef} initialValues={networkOptions}>
        {Object.keys(networkOptions).map((key) => (
          <Form.Item label={labels[key]} required name={key} key={key}>
            <InputNumber
              min={optionRange[key].min}
              max={optionRange[key].max}
              style={{
                width: '100%',
              }}
              onBlur={(e) => {
                if (e.target.value && formRef.current) {
                  formRef.current.validateFields().then((values) => {
                    onSave({ [key]: values[key] });
                  });
                }
              }}
            />
          </Form.Item>
        ))}
      </Form>
    </BAIModal>
  );
};

export default OverlayNetworkSettingModal;
