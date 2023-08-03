import React, { useEffect } from "react";
import graphql from "babel-plugin-relay/macro";
import { useQuery } from "react-query";
import { useFragment } from "react-relay";
import { TOTPActivateModalFragment$key } from "./__generated__/TOTPActivateModalFragment.graphql";

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

interface Props extends ModalProps {
  userFrgmt?: TOTPActivateModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const TOTPActivateModal: React.FC<Props> = ({
  userFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<TOTPActivateFormInput>();

  const user = useFragment(
    graphql`
      fragment TOTPActivateModalFragment on User {
        totp_activated
      }
    `,
    userFrgmt
  );

  const baiClient = useSuspendedBackendaiClient();
  let { data, isLoading, refetch } = useQuery("totp", () => {
    return !user?.totp_activated ? baiClient.initialize_totp() : null;
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
