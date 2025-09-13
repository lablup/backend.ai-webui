import { useSuspendedBackendaiClient } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import QuestionIconWithTooltip from './QuestionIconWithTooltip';
import { App, Checkbox, Form, InputNumber } from 'antd';
import { FormInstance } from 'antd/lib';
import { BAIFlex } from 'backend.ai-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface OverlayNetworkSettingsModalProps extends BAIModalProps {
  onRequestClose: () => void;
}

const OverlayNetworkSettingModal = ({
  onRequestClose,
  open,
}: OverlayNetworkSettingsModalProps) => {
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance>(null);
  const [isUpdatingNetworkOverlay, setIsUpdatingNetworkOverlay] =
    useState(false);
  const baiClient = useSuspendedBackendaiClient();

  const { isFetching: isFetchingMtu } = useTanQuery({
    queryKey: ['mtu'],
    queryFn: async () => {
      const { result } = await baiClient.setting.get('network/overlay/mtu');
      formRef.current?.setFieldsValue({
        mtu: result,
        mtu_checkbox: result === null || result === undefined || result === '',
      });
      return result;
    },
    enabled: open,
  });

  return (
    <BAIModal
      open={open}
      title={
        <BAIFlex gap="xxs">
          {t('settings.OverlayNetworkSettings')}
          <QuestionIconWithTooltip
            title={t('settings.OverlayNetworkSettingsDescription')}
          />
        </BAIFlex>
      }
      onCancel={onRequestClose}
      confirmLoading={isUpdatingNetworkOverlay}
      centered
      width={'auto'}
      okText={t('button.Save')}
      onOk={() => {
        if (formRef.current) {
          formRef.current
            .validateFields()
            .then(async (values) => {
              try {
                if (values.mtu_checkbox) {
                  setIsUpdatingNetworkOverlay(true);
                  const { result } = await baiClient.setting.delete(
                    'network/overlay/mtu',
                    true,
                  );
                  if (result === 'ok') {
                    message.success(t('notification.SuccessfullyUpdated'));
                    onRequestClose();
                  } else {
                    throw new Error();
                  }
                } else {
                  setIsUpdatingNetworkOverlay(true);
                  const { result } = await baiClient.setting.set(
                    'network/overlay/mtu',
                    values.mtu,
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
                setIsUpdatingNetworkOverlay(false);
              }
            })
            .catch(() => {});
        }
      }}
      cancelText={t('button.Cancel')}
      destroyOnHidden
    >
      <Form ref={formRef} layout="vertical">
        <Form.Item label="MTU" tooltip={t('settings.MTUDescription')} required>
          <BAIFlex gap="sm" align="center">
            <Form.Item noStyle dependencies={['mtu_checkbox']}>
              {() => {
                return (
                  <Form.Item
                    noStyle
                    name="mtu"
                    rules={[
                      {
                        validator: (_, value) => {
                          if (
                            formRef.current?.getFieldValue('mtu_checkbox') ===
                            true
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
                      style={{
                        flex: 1,
                      }}
                      min={0}
                      max={15000}
                      disabled={
                        formRef.current?.getFieldValue('mtu_checkbox') ===
                          true || isFetchingMtu
                      }
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item noStyle name="mtu_checkbox" valuePropName="checked">
              <Checkbox
                disabled={isFetchingMtu}
                onChange={(e) => {
                  if (e.target.checked) {
                    formRef.current?.setFieldsValue({
                      mtu: null,
                    });
                  }
                }}
              >
                {t('settings.Unset')}
              </Checkbox>
            </Form.Item>
          </BAIFlex>
        </Form.Item>
      </Form>
    </BAIModal>
  );
};

export default OverlayNetworkSettingModal;
