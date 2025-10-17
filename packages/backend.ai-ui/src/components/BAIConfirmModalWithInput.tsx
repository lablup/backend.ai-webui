import BAIFlex from './BAIFlex';
import BAIModal, { BAIModalProps } from './BAIModal';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form, Input, Typography } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export interface BAIConfirmModalWithInputProps
  extends Omit<BAIModalProps, 'icon' | 'okButtonProps'> {
  confirmText: string;
  content: React.ReactNode;
  title: React.ReactNode;
  icon?: React.ReactNode;
  okButtonProps?: Omit<BAIModalProps['okButtonProps'], 'disabled' | 'danger'>;
}

const BAIConfirmModalWithInput: React.FC<BAIConfirmModalWithInputProps> = ({
  confirmText,
  title,
  content,
  icon,
  onOk,
  onCancel,
  ...props
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const typedText = Form.useWatch('confirmText', form);

  return (
    <BAIModal
      destroyOnHidden
      title={
        <BAIFlex direction="column" justify="start" align="start">
          <Text strong>
            {icon ?? (
              <ExclamationCircleFilled
                style={{ color: '#faad14', marginRight: 5 }}
              />
            )}
            {title}
          </Text>
        </BAIFlex>
      }
      onOk={(e) => {
        form.resetFields();
        onOk?.(e);
      }}
      onCancel={(e) => {
        form.resetFields();
        onCancel?.(e);
      }}
      {...props}
      okButtonProps={{
        ...props.okButtonProps,
        disabled: confirmText !== typedText,
        danger: true,
      }}
    >
      <BAIFlex direction="column" justify="start" align="stretch">
        {content}
        <Form form={form} style={{ width: '100%' }} preserve={false}>
          <Form.Item
            name="confirmText"
            rules={[
              {
                required: true,
                message: t('general.modal.PleaseTypeToConfirm', {
                  confirmText,
                }),
                validator: (_, value) => {
                  if (value === confirmText) {
                    return Promise.resolve();
                  }
                  return Promise.reject();
                },
              },
            ]}
          >
            <Input
              autoFocus
              autoComplete="off"
              allowClear
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            />
          </Form.Item>
        </Form>
      </BAIFlex>
    </BAIModal>
  );
};

export default BAIConfirmModalWithInput;
