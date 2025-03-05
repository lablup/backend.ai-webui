import {
  NetworkOptions,
  optionRange,
} from '../hooks/useBAIConfigurationsSetting';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import FormItemWithCheckbox from './FormItemWithCheckbox';
import { InfoCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Checkbox,
  Form,
  FormItemProps,
  InputNumber,
  Tooltip,
} from 'antd';
import { FormInstance } from 'antd/lib';
import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface OverlayNetworkSettingsModalProps extends BAIModalProps {
  onRequestClose: () => void;
  networkOptions: NetworkOptions;
  onSave: (value: { [key: keyof NetworkOptions]: string }) => void;
  onDelete: (key: string) => void;
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
  const tooltipText: { [key: keyof NetworkOptions]: string } = {
    mtu: t('settings.MTUDescription'),
  };

  return (
    <BAIModal
      open={open}
      title={
        <Flex align="center">
          {t('settings.OverlayNetworkSettings')}
          <Tooltip title={t('settings.OverlayNetworkSettingsDescription')}>
            <Button type="link" size="large" icon={<InfoCircleOutlined />} />
          </Tooltip>
        </Flex>
      }
      onCancel={onRequestClose}
      centered
      width={'auto'}
      footer={[
        <Button key="overlayNetworkClose" onClick={onRequestClose}>
          {t('button.Cancel')}
        </Button>,
        <Button
          key="overlayNetworkSave"
          onClick={() => {
            if (formRef.current) {
              formRef.current
                .validateFields()
                .then((values) => {
                  Object.entries(values).forEach(([key, value]) => {
                    if (value === null || !value || value === '') {
                      onDelete(key);
                    } else {
                      onSave({ [key]: value } as {
                        [key: keyof NetworkOptions]: string;
                      });
                    }
                  });
                  onRequestClose();
                })
                .catch(() => {});
            }
          }}
          type="primary"
        >
          {t('button.Save')}
        </Button>,
      ]}
      destroyOnClose
    >
      <Form ref={formRef} layout="vertical" initialValues={networkOptions}>
        {Object.keys(networkOptions).map((key) => (
          <FormItemWithCheckbox
            label={
              <Flex>
                {labels[key]}
                <Tooltip title={tooltipText[key]}>
                  <Button type="link" icon={<InfoCircleOutlined />} />
                </Tooltip>
              </Flex>
            }
            required
            name={key}
            key={key}
          >
            <InputNumber
              min={optionRange[key].min}
              max={optionRange[key].max}
              style={{ width: '100%' }}
            />
          </FormItemWithCheckbox>
        ))}
      </Form>
    </BAIModal>
  );
};

export default OverlayNetworkSettingModal;
