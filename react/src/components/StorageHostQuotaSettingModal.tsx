import React from "react";
import { 
  Modal,
  ModalProps,
} from "antd";

type QuotaSettingVar = {
  [key: string]: string;
};
interface Props extends ModalProps {
  settings?: QuotaSettingVar;
  onRequestClose: (settings?: QuotaSettingVar) => void;
}
const StorageHostQuotaSettingModal: React.FC<Props> = (
  onRequestClose,
  settings = {},
  ...props
) => {
  return (
    <Modal
      {...props}
      destroyOnClose
      title={"Quota Settings"}
    ></Modal>
  );
};

export default StorageHostQuotaSettingModal;
