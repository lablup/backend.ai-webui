import React from 'react';
import { Modal, Input, Form, Select, Divider } from 'antd';
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from './DefaultProviders';

const UserPrefModal : React.FC = () => {
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    isOpen: boolean;
    userName: string;
    keyPairInfo: {
      keypairs: [{
        access_key: string;
        secret_key: string;
      }];
    }
  };
  try {
    parsedValue = JSON.parse(value || "");
  } catch (error) {
    parsedValue = {
      isOpen: false,
      userName: "",
      keyPairInfo: {keypairs:[{access_key: "", secret_key: ""}]}
    };
  }
  const { isOpen, userName, keyPairInfo } = parsedValue;

  let selectOptions: any[] = [];
  keyPairInfo.keypairs?.map((item: {access_key: string; secret_key: string})=> {
    selectOptions.push({value: item.access_key, label: item.access_key});
  });

  const { t } = useTranslation();

  return (
    <Modal
      open={isOpen}
      okText={t('webui.menu.Update')}
      cancelText={t('webui.menu.Cancel')}
      onCancel={()=> dispatchEvent("cancel", null)}
    >
      <h2>{t('webui.menu.MyAccountInformation')}</h2>
      <Divider/>
      <Form layout='vertical'>
        <Form.Item name='userId' label={t('webui.menu.FullName')} initialValue={userName}>
          <Input/>
        </Form.Item>
        <Form.Item
          name='access-key-select'
          label={t('general.AccessKey')}
          rules={[{ required: true }]}
        >
          <Select
            options={selectOptions}
          />
        </Form.Item>
        <Form.Item
          name='secretkey'
          label={t('general.SecretKey')}
        >
          <Input disabled/>
        </Form.Item>
        <Form.Item
          name='pref-original-password'
          label={t('webui.menu.OriginalPassword')}
        >
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

export default UserPrefModal;