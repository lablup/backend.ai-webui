import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { Form, Input, Typography } from 'antd';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

interface BAIConfirmModalWithInputProps
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
      destroyOnClose
      title={
        <Flex direction="column" justify="start" align="start">
          <Text strong>
            {icon ?? (
              <ExclamationCircleFilled
                style={{ color: '#faad14', marginRight: 5 }}
              />
            )}
            {title}
          </Text>
        </Flex>
      }
      onOk={(e) => {
        form.resetFields();
        _.isFunction(onOk) && onOk(e);
      }}
      onCancel={(e) => {
        form.resetFields();
        _.isFunction(onCancel) && onCancel(e);
      }}
      {...props}
      okButtonProps={{
        ...props.okButtonProps,
        disabled: confirmText !== typedText,
        danger: true,
      }}
    >
      <Flex direction="column" justify="start" align="start">
        {content}
        <Form form={form} style={{ width: '100%' }} preserve={false}>
          <Form.Item
            name="confirmText"
            rules={[
              {
                required: true,
                message: t('dialog.PleaseTypeToConfirm', {
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
      </Flex>
    </BAIModal>
  );
};

export default BAIConfirmModalWithInput;
