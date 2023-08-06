import React, { useEffect } from 'react';
import {
  Modal,
  Input,
  Form,
  Select,
  Divider,
  message
} from 'antd';
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from './DefaultProviders';
import { passwordPattern } from './ResetPasswordRequired';
import { useSuspendedBackendaiClient } from "../hooks";
import { baiSignedRequestWithPromise } from '../helper';
import { useTanMutation } from '../hooks/reactQueryAlias';

const UserPrefModal : React.FC = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();
  const _showSuccessMessage = (successMessage: string) => {
    messageApi.open({
      type: "success",
      content: successMessage
    });
  };
  const _showErrorMessage = (errorMessage: string) => {
    messageApi.open({
      type: "error",
      content: errorMessage
    })
  }

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    isOpen: boolean;
    full_name: string;
    userId: string;
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
      full_name: "",
      userId: "",
      loggedAccount: {access_key: ""},
      keyPairInfo: {keypairs:[{access_key: "", secret_key: ""}]}
    };
  };
  const { isOpen, full_name, userId, loggedAccount, keyPairInfo } = parsedValue;

  let selectOptions: any[] = [];
  if (keyPairInfo.keypairs) {
    for (let i=0; i < keyPairInfo.keypairs.length; i++) {
      selectOptions.push({value: keyPairInfo.keypairs[i].secret_key, label: keyPairInfo.keypairs[i].access_key})
    }
  };

  const baiClient = useSuspendedBackendaiClient();
  const mutationToUpdateUserFullName = useTanMutation({
    mutationFn: (body: {
      full_name: string;
      email: string
    }) => {
      return baiSignedRequestWithPromise({
        method: "POST",
        url: `/auth/update-full-name`,
        body,
        client: baiClient,
      });
    }
  });
  const mutationToUpdateUserPassword = useTanMutation({
    mutationFn: (body: {
      old_password: string;
      new_password: string;
      new_password2: string;
    }) => {
      return baiSignedRequestWithPromise({
        method: "POST",
        url: `/auth/update-password`,
        body,
        client: baiClient,
      });
    }
  });
  
  useEffect(()=> {
    for(let i=0; i<selectOptions.length; i++) {
      if (loggedAccount.access_key === selectOptions[i].label) {
        form.setFieldsValue({
          access_key: selectOptions[i].label,
          secret_key: selectOptions[i].value
        })
        break;
      }
    }
    form.setFieldsValue({
      full_name: full_name
    });
  });

  const _onSelectAccessKey = (value: string) => {
    for (let i=0; i< keyPairInfo.keypairs.length; i++) {
      if (keyPairInfo.keypairs[i].access_key === value) {
        form.setFieldsValue({
          secret_key: keyPairInfo.keypairs[i].secret_key
        });
        break;
      }
    }
  }

  const _updateFullName = (newFullName: string) => {
    if (full_name !== newFullName) {
      mutationToUpdateUserFullName.mutate(
        {
          full_name: newFullName,
          email: userId,
        }, {
        onSuccess: () => {
          _showSuccessMessage(t("webui.menu.FullnameUpdated"));
          dispatchEvent("updateFullName", { newFullName });
        },
        onError: (error: any) => {
          _showErrorMessage(error.message);
        },
        onSettled: () => {
          form.setFieldsValue({
            full_name: full_name
          })
        }
      });
    }
  };

  const _updatePassword = (oldPassword: string, newPassword: string, newPassword2: string) => {
    if (!oldPassword && !newPassword && !newPassword2) {
      dispatchEvent("cancel", null);
      return;
    }
    if (!oldPassword) {
      _showErrorMessage(t("webui.menu.InputOriginalPassword"));
      return;
    }
    if (!newPassword) {
      _showErrorMessage(t("webui.menu.InputNewPassword"));
      return;
    }
    if (newPassword !== newPassword2) {
      _showErrorMessage(t("webui.menu.NewPasswordMismatch"));
      return;
    }
    mutationToUpdateUserPassword.mutate(
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2
      }, {
        onSuccess: () => {
          _showSuccessMessage(t("webui.menu.PasswordUpdated"));
          dispatchEvent("cancel",null);
        },
        onError: (error: any) => {
          _showErrorMessage(error.message);
        },
        onSettled: () => {
          form.setFieldsValue({
            originalPassword: "",
            newPassword: "",
            newPasswordConfirm: ""
          });
        }
      }
    );
  }

  const _onSubmit = () => {
    form.validateFields().then((values) => {
      _updateFullName(values.full_name);
      _updatePassword(values.originalPassword, values.newPassword, values.newPasswordConfirm);
      dispatchEvent("refresh",null);
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
            name='full_name'
            label={t('webui.menu.FullName')}
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
            name='access_key'
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
            name='secret_key'
            label={t('general.SecretKey')}
          >
            <Input disabled/>
          </Form.Item>
          <Form.Item
            name='originalPassword'
            label={t('webui.menu.OriginalPassword')}
          >
            <Input.Password/>
          </Form.Item>
          <Form.Item
            name='newPassword'
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
            name='newPasswordConfirm'
            label={t('webui.menu.NewPasswordAgain')}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
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