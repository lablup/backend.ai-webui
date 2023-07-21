import React from "react";
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from "./DefaultProviders";

import { Button, Modal, ModalProps } from "antd";

interface Props extends ModalProps {}

const UserSettingModal: React.FC<Props> = ({ ...modalProps }) => {
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    userEmail: string;
  };
  try {
    parsedValue = JSON.parse(value || "");
  } catch (error) {
    parsedValue = {
      open: false,
      userEmail: "",
    };
  }
  const { open, userEmail } = parsedValue;

  const { t } = useTranslation();

  return (
    <Modal
      open={open}
      onCancel={() => {
        dispatchEvent("cancel", null);
      }}
      centered
      title={t("credential.ModifyUserDetail")}
      {...modalProps}
    >
      {userEmail}
    </Modal>
  );
};

export default UserSettingModal;
