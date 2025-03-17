import BAIModal, { BAIModalProps } from './BAIModal';
import { NetworkOptions } from './ConfigurationsSettingList';
import Flex from './Flex';
import FormItemWithCheckbox from './FormItemWithCheckbox';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { Button, Form, InputNumber } from 'antd';
import { FormInstance } from 'antd/lib';
import { useRef } from 'react';
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

  return (
    <BAIModal
      open={open}
      title={
        <Flex gap="xxs">
          {t('settings.OverlayNetworkSettings')}
          <QuestionIconWithTooltip
            title={t('settings.OverlayNetworkSettingsDescription')}
          />
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
        <FormItemWithCheckbox
          label="MTU"
          tooltip={t('settings.MTUDescription')}
          required
          name="mtu"
        >
          <InputNumber min={0} max={15000} style={{ width: '100%' }} />
        </FormItemWithCheckbox>
      </Form>
    </BAIModal>
  );
};

export default OverlayNetworkSettingModal;
