import React, { useEffect } from 'react';
import { Modal, Input, Form, Select, Divider, notification } from 'antd';
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from './DefaultProviders';
import { passwordPattern } from './ResetPasswordRequired';

const UserPrefModal : React.FC = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [api, contextHolder] = notification.useNotification();
  const _openNotification = (message: string) => {
    api.info({
      message: message,
      placement: "bottomRight"
    });
  };

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    isOpen: boolean;
    userName: string;
    loggedAccount: {
      access_key: string;
    };
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
      loggedAccount: {access_key: ""},
      keyPairInfo: {keypairs:[{access_key: "", secret_key: ""}]}
    };
  };
  const { isOpen, userName, loggedAccount, keyPairInfo } = parsedValue;

  let selectOptions: any[] = [];
  if (keyPairInfo.keypairs) {
    for (let i=0; i < keyPairInfo.keypairs.length; i++) {
      selectOptions.push({value: keyPairInfo.keypairs[i].secret_key, label: keyPairInfo.keypairs[i].access_key})
    }
  };

  useEffect(()=> {
    for(let i=0; i<selectOptions.length; i++) {
      if (loggedAccount.access_key === selectOptions[i].label) {
        form.setFieldsValue({
          accessKeySelect: selectOptions[i].label,
          secretKeyInput: selectOptions[i].value
        })
        break;
      }
    }
  });

  const _onSelectAccessKey = (value: string) => {
    for (let i=0; i< keyPairInfo.keypairs.length; i++) {
      if (keyPairInfo.keypairs[i].access_key === value) {
        form.setFieldsValue({
          secretKeyInput: keyPairInfo.keypairs[i].secret_key
        });
        break;
      }
    }
  }

  const _onSubmit = () => {
    form.validateFields().then((values) => {
      console.log(values);
    })
    .catch((errorInfo) => {
      errorInfo.errorFields.map((error: {errors: string[]})=> {
        _openNotification(error.errors[0])
      })
    });
  };


  return (
    <>
      {contextHolder}
      <Modal
        open={isOpen}
        okText={t('webui.menu.Update')}
        cancelText={t('webui.menu.Cancel')}
        onCancel={()=> dispatchEvent("cancel", null)}
        onOk={()=>_onSubmit()}
      >
        <h2>{t('webui.menu.MyAccountInformation')}</h2>
        <Divider/>
        <Form
          layout='vertical'
          form={form}
        >
          <Form.Item
            name='userNameInput'
            label={t('webui.menu.FullName')}
            initialValue={userName}
            rules={[
              () => ({
                validator(_, value) {
                  if (value && value.length < 65) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('webui.menu.FullNameInvalid'))
                  );
                },
              }),
            ]}
          >
            <Input/>
          </Form.Item>
          <Form.Item
            name='accessKeySelect'
            label={t('general.AccessKey')}
            rules={[{ required: true }]}
          >
            <Select
              options={selectOptions}
              onSelect={_onSelectAccessKey}
            >
            </Select>
          </Form.Item>
          <Form.Item
            name='secretKeyInput'
            label={t('general.SecretKey')}
          >
            <Input disabled/>
          </Form.Item>
          <Form.Item
            name='prefOriginalPasswordInput'
            label={t('webui.menu.OriginalPassword')}
          >
            <Input.Password/>
          </Form.Item>
          <Form.Item
            name='prefNewPasswordInput'
            label={t('webui.menu.NewPassword')}
            rules={[
              {
                pattern: passwordPattern,
                message: t("webui.menu.InvalidPasswordMessage")
              }
            ]}
          >
            <Input.Password/>
          </Form.Item>
          <Form.Item
            name='prefNewPassword2Input'
            label={t('webui.menu.NewPasswordAgain')}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("prefNewPasswordInput") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("environment.PasswordsDoNotMatch"))
                  );
                },
              }),
            ]}
          >
            <Input.Password/>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserPrefModal;