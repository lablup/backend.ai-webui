import React from "react";

import {
  Modal,
  ModalProps,
  Descriptions,
  DescriptionsProps,
  Button,
} from "antd";
import { useTranslation } from "react-i18next";
import _ from "lodash";

interface Props extends ModalProps {
  sessionId: string
  error: string
  close: () => void
}

const ServingRouteErrorModal: React.FC<Props> = ({ open, sessionId, close, error, ...modalProps }) => {
  const { t } = useTranslation();

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 1,
    xl: 1,
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <Modal
      open={open}
      onCancel={close}
      centered
      title={t("ServingRouteErrorModalTitle")}
      footer={[
        <Button
          key="ok"
          type="primary"
          onClick={close}
        >
          {t("button.OK")}
        </Button>,
      ]}
      {...modalProps}
    >
      <br />
      <Descriptions
        title={t("credential.Information")}
        bordered
        column={columnSetting}
      >
        <Descriptions.Item label={t("SessionID")}>
          {sessionId}
        </Descriptions.Item>
        <Descriptions.Item label={t("Error")}>
          {error}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ServingRouteErrorModal;
