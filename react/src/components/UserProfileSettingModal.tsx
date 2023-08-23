import React from "react";
import { Modal, Input, Form, Select, SelectProps, message, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from "./DefaultProviders";
import { passwordPattern } from "./ResetPasswordRequired";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTanQuery, useTanMutation } from "../hooks/reactQueryAlias";
import _ from "lodash";

const UserProfileSettingModal: React.FC = () => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();

  const baiClient = useSuspendedBackendaiClient();

  const { data: isManagerSupportingTOTP } = useTanQuery(
    "isManagerSupportingTOTP",
    () => {
      return baiClient.isManagerSupportingTOTP();
    },
    {
      suspense: false,
    }
  );
  const totpSupported = baiClient.supports("2FA") && isManagerSupportingTOTP;

  const { data: userInfo } = useTanQuery(
    "totpActivated",
    () => {
      return baiClient.user.get(baiClient.email, ["totp_activated"]);
    },
    {
      suspense: false,
    }
  );
  const totpActivated = userInfo?.user.totp_activated;

  const { data: keyPairInfo } = useTanQuery(
    "keyPairInfo",
    () => {
      return baiClient.keypair.list(
        baiClient.email,
        ["access_key", "secret_key"],
        true
      );
    },
    {
      suspense: false,
    }
  );
  let selectOptions: SelectProps["options"] = [];
  if (keyPairInfo) {
    for (let i = 0; i < keyPairInfo.keypairs.length; i++) {
      selectOptions.push({
        value: keyPairInfo.keypairs[i].secret_key,
        label: keyPairInfo.keypairs[i].access_key,
      });
    }
    const matchLoggedAccount = _.find(keyPairInfo.keypairs, [
      "access_key",
      baiClient._config.accessKey,
    ]);
    form.setFieldsValue({
      access_key: matchLoggedAccount?.access_key,
      secret_key: matchLoggedAccount?.secret_key,
    });
  }

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    isOpenUserPrefDialog: boolean;
  };
  try {
    parsedValue = JSON.parse(value || "");
  } catch (error) {
    parsedValue = {
      isOpenUserPrefDialog: false,
    };
  }

  const { isOpenUserPrefDialog } = parsedValue;

  const mutationToUpdateUserFullName = useTanMutation({
    mutationFn: (values: { email: string; full_name: string }) => {
      return baiClient.update_full_name(values.email, values.full_name);
    },
  });

  const mutationToUpdateUserPassword = useTanMutation({
    mutationFn: (values: {
      old_password: string;
      new_password: string;
      new_password2: string;
    }) => {
      return baiClient.update_password(
        values.old_password,
        values.new_password,
        values.new_password2
      );
    },
  });

  const onSelectAccessKey = (value: string) => {
    let matchLoggedAccount = _.find(keyPairInfo.keypairs, [
      "secret_key",
      value,
    ]);
    form.setFieldsValue({
      secret_key: matchLoggedAccount.secret_key,
    });
  };

  const updateFullName = (newFullName: string) => {
    if (baiClient.full_name !== newFullName) {
      mutationToUpdateUserFullName.mutate(
        {
          full_name: newFullName,
          email: baiClient.email,
        },
        {
          onSuccess: () => {
            messageApi.open({
              type: "success",
              content: t("webui.menu.FullnameUpdated"),
            });
            dispatchEvent("updateFullName", { newFullName });
          },
          onError: (error: any) => {
            messageApi.open({
              type: "error",
              content: error.message,
            });
          },
        }
      );
    }
  };

  const updatePassword = (
    oldPassword: string,
    newPassword: string,
    newPassword2: string
  ) => {
    if (!oldPassword && !newPassword && !newPassword2) {
      dispatchEvent("cancel", null);
      return;
    }
    if (!oldPassword) {
      messageApi.open({
        type: "error",
        content: t("webui.menu.InputOriginalPassword"),
      });
      return;
    }
    if (!newPassword) {
      messageApi.open({
        type: "error",
        content: t("webui.menu.InputNewPassword"),
      });
      return;
    }
    if (newPassword !== newPassword2) {
      messageApi.open({
        type: "error",
        content: t("webui.menu.NewPasswordMismatch"),
      });
      return;
    }
    mutationToUpdateUserPassword.mutate(
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword2,
      },
      {
        onSuccess: () => {
          messageApi.open({
            type: "success",
            content: t("webui.menu.PasswordUpdated"),
          });
          dispatchEvent("cancel", null);
        },
        onError: (error: any) => {
          messageApi.open({
            type: "error",
            content: error.message,
          });
        },
        onSettled: () => {
          form.setFieldsValue({
            originalPassword: "",
            newPassword: "",
            newPasswordConfirm: "",
          });
        },
      }
    );
  };

  const onSubmit = () => {
    form.validateFields().then((values) => {
      updateFullName(values.full_name);
      updatePassword(
        values.originalPassword,
        values.newPassword,
        values.newPasswordConfirm
      );
    });
  };

  return (
    <>
      {contextHolder}
      <Modal
        open={isOpenUserPrefDialog}
        okText={t("webui.menu.Update")}
        cancelText={t("webui.menu.Cancel")}
        onCancel={() => dispatchEvent("cancel", null)}
        onOk={() => onSubmit()}
        centered
        title={t("webui.menu.MyAccountInformation")}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            name="full_name"
            label={t("webui.menu.FullName")}
            initialValue={baiClient.full_name}
            rules={[
              () => ({
                validator(_, value) {
                  if (value && value.length < 65) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("webui.menu.FullNameInvalid"))
                  );
                },
              }),
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="access_key"
            label={t("general.AccessKey")}
            rules={[{ required: true }]}
          >
            <Select
              options={selectOptions}
              onSelect={onSelectAccessKey}
            ></Select>
          </Form.Item>
          <Form.Item name="secret_key" label={t("general.SecretKey")}>
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="originalPassword"
            label={t("webui.menu.OriginalPassword")}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t("webui.menu.NewPassword")}
            rules={[
              {
                pattern: passwordPattern,
                message: t("webui.menu.InvalidPasswordMessage"),
              },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="newPasswordConfirm"
            label={t("webui.menu.NewPasswordAgain")}
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
            <Input.Password />
          </Form.Item>
          {totpSupported ? (
            <Form.Item label={t("webui.menu.TotpActivated")}>
              <Switch
                defaultChecked={totpActivated}
                onChange={(e) =>
                  totpActivated
                    ? dispatchEvent("confirmRemovingTotp", null)
                    : dispatchEvent("startActivatingTotp", null)
                }
              />
            </Form.Item>
          ) : (
            ""
          )}
        </Form>
      </Modal>
    </>
  );
};

export default UserProfileSettingModal;
