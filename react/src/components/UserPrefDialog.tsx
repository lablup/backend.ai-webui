import React, { useState } from 'react';
import { Modal, Input, Form, Select } from 'antd';
import { useTranslation } from "react-i18next";

interface UserPrefDialogProps {

};

const UserPrefDialog : React.FC<UserPrefDialogProps> = () => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(true);
  
  const onClickModify = () => {
    setIsOpen(false);
  };

  const onClickCancel = () => {
    setIsOpen(false);
  };

  return (
    <Modal open={isOpen} onOk={onClickModify} onCancel={onClickCancel} okText='변경' cancelText='취소'>
      <span slot='title'>{t('webui.menu.MyAccountInformation')}</span>
      <Form layout='vertical'>
        <Form.Item name='userId' label={t('webui.menu.FullName')}>
          <Input/>
        </Form.Item>
        <Form.Item name='access-key-select' label={t('general.AccessKey')} rules={[{ required: true }]}>
          <Select/>
        </Form.Item>
        <Form.Item name='secretkey' label={t('general.SecretKey')}>
          <Input/>
        </Form.Item>
        <Form.Item name='pref-original-password' label={t('webui.menu.OriginalPassword')}>
          <Input.Password/>
        </Form.Item>
        <Form.Item name='pref-new-password' label={t('webui.menu.NewPassword')}>
          <Input.Password/>
        </Form.Item>
        <Form.Item name='pref-new-password2' label={t('webui.menu.NewPasswordAgain')}>
          <Input.Password/>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserPrefDialog;