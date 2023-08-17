import React from "react";
import { Modal, Input, Form, Select, Divider, message, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from "./DefaultProviders";
import { passwordPattern } from "./ResetPasswordRequired";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTanMutation } from "../hooks/reactQueryAlias";
import _ from "lodash";

const UserProfileSettingModal : React.FC = () => {
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
    });
  };

  const baiClient = useSuspendedBackendaiClient();
  let email = baiClient.email;
  let full_name = baiClient.full_name;
  let loggedAccount = baiClient._config.accessKey;
  let totpSupported = false;
  let totpActivated = false;
  let selectOptions: any[] = [];
  let keyPairInfo = {
    keypairs: [{
      access_key: "",
      secret_key: ""
    }]
  };

  const _showTotpRule = async() => {
    totpSupported = baiClient.supports('2FA') && await baiClient.isManagerSupportingTOTP();
    if (totpSupported) {
      const userInfo = await baiClient.user.get( baiClient.email, ['totp_activated']);
      totpActivated = userInfo.user.totp_activated;
    };
  };

  const _showKeypairInfo = async(email: string) => {
    keyPairInfo = await baiClient.keypair.list(email, ["access_key", "secret_key"], true);
    if (keyPairInfo.keypairs) {
      for (let i=0; i < keyPairInfo.keypairs.length; i++) {
        selectOptions?.push({value: keyPairInfo.keypairs[i].secret_key, label: keyPairInfo.keypairs[i].access_key})
      };
      let matchLoggedAccount = _.find(keyPairInfo.keypairs, ["access_key", loggedAccount]);
      form.setFieldsValue({
        access_key: matchLoggedAccount?.access_key,
        secret_key: matchLoggedAccount?.secret_key
      });
    };
  };
  
  _showTotpRule();
  _showKeypairInfo(email);

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    isOpen: boolean;
  };
  try {
    parsedValue = JSON.parse(value || "");
  } catch (error) {
    parsedValue = {
      isOpen: false,
    };
  };
  const { isOpen } = parsedValue;

  const mutationToUpdateUserFullName = useTanMutation({
    mutationFn: (values: {
      email: string;
      full_name: string;
    }) => {
      return baiClient.update_full_name(values.email, values.full_name);
      }
  });

  const mutationToUpdateUserPassword = useTanMutation({
    mutationFn: (values: {
      old_password: string;
      new_password: string;
      new_password2: string;
    }) => {
      return baiClient.update_password(values.old_password, values.new_password, values.new_password2);
    }
  });

  const _onSelectAccessKey = (value: string) => {
    let matchLoggedAccount = _.find(keyPairInfo.keypairs, ["access_key", value]);
    form.setFieldsValue({
      secret_key: matchLoggedAccount?.secret_key
    });
  };

  const _updateFullName = (newFullName: string) => {
    if (full_name !== newFullName) {
      mutationToUpdateUserFullName.mutate(
        {
          full_name: newFullName,
          email: email,
        }, {
        onSuccess: () => {
          _showSuccessMessage(t("webui.menu.FullnameUpdated"));
          dispatchEvent("updateFullName", { newFullName });
        },
        onError: (error: any) => {
          _showErrorMessage(error.message);
        }
      });
    };
  };

  const _updatePassword = (oldPassword: string, newPassword: string, newPassword2: string) => {
    if (!oldPassword && !newPassword && !newPassword2) {
      dispatchEvent("cancel", null);
      return;
    };
    if (!oldPassword) {
      _showErrorMessage(t("webui.menu.InputOriginalPassword"));
      return;
    };
    if (!newPassword) {
      _showErrorMessage(t("webui.menu.InputNewPassword"));
      return;
    };
    if (newPassword !== newPassword2) {
      _showErrorMessage(t("webui.menu.NewPasswordMismatch"));
      return;
    };
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
  };

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
        centered
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
            initialValue={full_name}
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
          {
            totpSupported ?
            <Form.Item
              label={t("webui.menu.TotpActivated")}
            >
              <Switch
                defaultChecked={totpActivated}
                onChange={(e)=> totpActivated ? dispatchEvent("confirmRemovingTotp", e) : dispatchEvent("startActivatingTotp", e)}
              />
            </Form.Item> :
            ""
          }
        </Form>
      </Modal>
    </>
  );
};

export default UserProfileSettingModal;