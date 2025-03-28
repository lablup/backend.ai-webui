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
                  const isUnset = values.mtu_checkbox;
                  if (isUnset) {
                    onDelete('mtu');
                  } else {
                    onSave({ mtu: values.mtu });
                  }
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
          checkboxText={t('button.Delete')}
          tooltip={t('settings.MTUDescription')}
          required
          name="mtu"
          checkedValue=""
          rules={[
            {
              validator(_, value) {
                const isUnset = formRef.current?.getFieldValue('mtu_checkbox');

                if (value === '' && isUnset) {
                  return Promise.resolve();
                }
                if (value === '' || value === null || value === undefined) {
                  return Promise.reject(t('data.explorer.ValueRequired'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber min={0} max={15000} style={{ width: '100%' }} />
        </FormItemWithCheckbox>
      </Form>
    </BAIModal>
  );
};

export default OverlayNetworkSettingModal;
