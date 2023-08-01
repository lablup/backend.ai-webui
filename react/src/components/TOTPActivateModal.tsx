import React, { useEffect } from "react";
import { useQuery } from "react-query";

import {
  Modal,
  ModalProps,
  QRCode,
  Typography,
  Input,
  theme,
  Form,
  message,
  Spin,
} from "antd";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import { useTanMutation } from "../hooks/reactQueryAlias";
import Flex from "./Flex";

type TOTPActivateFormInput = {
  otp: number;
};

type User = {
  user: {
    totp_activated: boolean;
  };
};

interface Props extends ModalProps {
  onRequestClose: (success?: boolean) => void;
}

const TOTPActivateModal: React.FC<Props> = ({
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<TOTPActivateFormInput>();

  const baiClient = useSuspendedBackendaiClient();
  let { data, isLoading, refetch } = useQuery("totp", () => {
    return baiClient.user
      .get(baiClient.email, ["totp_activated"])
      .then((data: User) => {
        if (!data.user.totp_activated) return baiClient.initialize_totp();
        return null;
      });
  });

  useEffect(() => {
    if (modalProps.open) {
      refetch();
    }
  }, [refetch, modalProps.open]);

  const mutationToActivateTotp = useTanMutation({
    mutationFn: (values: TOTPActivateFormInput) => {
      return baiClient.activate_totp(values.otp);
    },
  });

  const _onOk = () => {
    form.validateFields().then((values) => {
      mutationToActivateTotp.mutate(values, {
        onSuccess: () => {
          message.success(t("totp.TotpSetupCompleted"));
          onRequestClose(true);
        },
        onError: () => {
          message.error(t("totp.InvalidTotpCode"));
        },
      });
      new Promise((resolve, reject) => {}).then(() => {
        onRequestClose(true);
      });
    });
  };

  return (
    <Modal
      title={t("webui.menu.SetupTotp")}
      maskClosable={false}
      onOk={_onOk}
      onCancel={() => {
        onRequestClose();
      }}
      style={{ zIndex: 1 }}
      {...modalProps}
    >
      {!data ? (
        <Flex justify="center" direction="row">
          <Spin />
        </Flex>
      ) : (
        <Form
          preserve={false}
          form={form}
          validateTrigger={["onChange", "onBlur"]}
        >
          {t("totp.TypeInAuthKey")}
          <Flex
            justify="center"
            style={{ margin: token.marginSM, gap: token.margin }}
          >
            <QRCode
              value={data?.totp_uri}
              status={isLoading ? "loading" : undefined}
            />
          </Flex>
          {t("totp.ScanQRToEnable")}
          <Flex
            justify="center"
            style={{ margin: token.marginSM, gap: token.margin }}
          >
            <Typography.Text copyable code>
              {data?.totp_key}
            </Typography.Text>
          </Flex>
          {t("totp.TypeInAuthKey")}
          <Flex
            justify="center"
            style={{ margin: token.marginSM, gap: token.margin }}
          >
            <Form.Item required name="otp">
              <Input
                maxLength={6}
                allowClear
                placeholder="000000"
                style={{ maxWidth: 120 }}
              />
            </Form.Item>
          </Flex>
        </Form>
      )}
    </Modal>
  );
};

export default TOTPActivateModal;
