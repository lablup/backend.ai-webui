import {
  Alert,
  Button,
  ButtonProps,
  Form,
  Input,
  Modal,
  ModalProps,
} from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { PlusIcon } from 'lucide-react';
import React, { useRef, useState, useTransition } from 'react';

interface ModelEditModalProps extends ModalProps {}
const ModelEditModal: React.FC<ModelEditModalProps> = ({ ...props }) => {
  const formRef = useRef<FormInstance>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState('');
  return (
    <Modal
      title={'Add Model info'}
      {...props}
      onOk={(e) => {
        errorMessage && setErrorMessage('');
        startTransition(() => {
          const result = formRef.current?.validateFields().catch(() => {});
          if (result) {
            // const newModel = createModel(result).catch((e) => {
            //   setErrorMessage(e.message);
            // });
            // if (newModel) {
            //   props.onOk?.(e);
            // }
          }
        });
      }}
      confirmLoading={isPending}
    >
      <Form layout="vertical" ref={formRef}>
        <Form.Item name={'name'} label="Name" rules={[{ required: true }]}>
          <Input placeholder="Model Name" />
        </Form.Item>
        <Form.Item name={'label'} label="Label">
          <Input placeholder="Label" />
        </Form.Item>
        <Form.Item name={'group'} label="Group">
          <Input />
        </Form.Item>
        <Form.Item name={'description'} label="Description">
          <Input />
        </Form.Item>
        <Form.Item name={'baseURL'} label="Base URL" rules={[{ type: 'url' }]}>
          <Input />
        </Form.Item>
        {errorMessage && <Alert message={errorMessage} type="error" />}
      </Form>
    </Modal>
  );
};

export const ModelEditButton: React.FC<ButtonProps> = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        icon={<PlusIcon />}
        onClick={() => {
          setOpen(true);
        }}
        {...props}
      />
      <ModelEditModal
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        onOk={() => {
          setOpen(false);
        }}
      />
    </>
  );
};

export default ModelEditModal;
