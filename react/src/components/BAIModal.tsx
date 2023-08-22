import React from "react";
import { Modal, ModalProps, ConfigProvider } from "antd";
// @ts-ignore
import rawBAIModalCss from "./BAIModal.css?raw";

export interface BAIModalProps extends ModalProps {}
const BAIModal: React.FC<BAIModalProps> = ({ ...modalProps }) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          paddingContentHorizontalLG: 0,
          paddingLG: 0,
          paddingMD: 0,
        },
        components: {
          Modal: {
            titleColor: "rgba(0, 0, 0, 0.6)",
            titleFontSize: 20,
          },
        },
      }}
    >
      <style>{rawBAIModalCss}</style>
      <Modal
        centered={modalProps.centered ?? true}
        className="bai-modal"
        {...modalProps}
      >
        {modalProps.children}
      </Modal>
    </ConfigProvider>
  );
};

export default BAIModal;
