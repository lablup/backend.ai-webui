import { Button, Form, Modal, Typography, Input, theme } from "antd";
import { useWebComponentInfo } from "./DefaultProviders";
import Flex from "./Flex";
import { useTranslation } from "react-i18next";
import { WarningTwoTone } from "@ant-design/icons";

// src/components/backend-ai-common-utils.ts
export const passwordPattern = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[_\W]).{8,}$/;

const ResetPasswordRequired = () => {
  const { value, dispatchEvent } = useWebComponentInfo();
  const open = value === "true";
  const { token } = theme.useToken();
  const { t } = useTranslation();
  return (
    <Modal
      open={open}
      centered
      mask={false}
      onCancel={() => {
        dispatchEvent("cancel", null);
      }}
      onOk={() => {
        dispatchEvent("ok", null);
      }}
      keyboard={false}
      maskClosable={false}
      footer={null}
      width={400}
      // title="Reset Password Required"
    >
      <Flex
        direction="column"
        justify="start"
        align="stretch"
        gap={"md"}
        style={{
          alignSelf: "stretch",
          paddingTop: token.paddingMD,
          paddingBottom: token.paddingMD,
        }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          <WarningTwoTone twoToneColor={token.colorWarning} />{" "}
          {t("webui.menu.PleaseChangeYourPassword")}
        </Typography.Title>
        {t("webui.menu.YouMushChangeYourPassword")}
        <Form layout="vertical">
          {/* <Form.Item
            name="curPassword"
            label={t("webui.menu.CurrentPassword")}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input.Password />
          </Form.Item> */}
          <Form.Item
            name="newPassword"
            label={t("webui.menu.NewPassword")}
            rules={[
              {
                required: true,
              },
              {
                pattern: passwordPattern,
                message: t("webui.menu.InvalidPasswordMessage").toString(),
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label={t("webui.menu.NewPasswordAgain")}
            dependencies={["newPassword"]}
            hasFeedback
            rules={[
              {
                required: true,
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t("environment.PasswordsDoNotMatch").toString())
                  );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          {/* <Form.Item
            label="New Password"
            name="password"
            rules={[
              {
                pattern: passwordPattern,
              },
            ]}
          >
            <Input type="password" />
          </Form.Item>
          <Form.Item label="Confirm Password" name="confirmPassword">
            <Input type="password" />
          </Form.Item> */}
        </Form>
        <Button type="primary">{t("webui.menu.Update")}</Button>
      </Flex>
    </Modal>
  );
};

export default ResetPasswordRequired;
