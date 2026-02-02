import { ExclamationCircleFilled } from '@ant-design/icons';
import {
  Form,
  Input,
  Popconfirm,
  type PopconfirmProps,
  Typography,
} from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';

const { Text } = Typography;

interface Props extends PopconfirmProps {
  confirmText: string;
  content: React.ReactNode;
  title: React.ReactNode;
}
const PopConfirmWithInput: React.FC<Props> = ({
  confirmText,
  children,
  onConfirm,
  onCancel,
  title,
  icon,
  content,
  ...props
}) => {
  const [form] = Form.useForm();
  const typedText = Form.useWatch('confirmText', form);

  return (
    <Popconfirm
      title={
        <BAIFlex
          direction="column"
          justify="start"
          align="start"
          style={{ maxWidth: 250 }}
          onClick={(e) => {
            alert(e);
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Text strong>
            {icon ?? (
              <ExclamationCircleFilled
                style={{ color: '#faad14', marginRight: 5 }}
              />
            )}
            {title}
          </Text>
          <Text>{content}</Text>
          {/* <Text>
            {' '}
            Please type <Text code>{confirmText}</Text> to confirm.
          </Text> */}
          <Form form={form} style={{ width: '100%' }} preserve={false}>
            <Form.Item
              name="confirmText"
              rules={[
                {
                  required: true,
                  message: `Please type ${confirmText} to confirm.`,
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
                size="small"
                autoFocus
                autoComplete="off"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </Form.Item>
          </Form>
        </BAIFlex>
      }
      icon={null}
      okButtonProps={{ disabled: confirmText !== typedText, danger: true }}
      onConfirm={(e) => {
        form.resetFields();
        _.isFunction(onConfirm) && onConfirm(e);
      }}
      onCancel={(e) => {
        form.resetFields();
        _.isFunction(onCancel) && onCancel(e);
      }}
      okText="Delete"
      cancelText="No"
      {...props}
    >
      {children}
    </Popconfirm>
  );
};

export default PopConfirmWithInput;
