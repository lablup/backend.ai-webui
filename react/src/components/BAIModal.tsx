import React from "react";
import { Modal, ModalProps, ConfigProvider } from "antd";
// @ts-ignore
import rawBAIModalCss from "./BAIModal.css?raw";

interface Props extends ModalProps {}
const BAIModal: React.FC<Props> = ({ ...modalProps }) => {
  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            titleColor: "rgba(0, 0, 0, 0.6)",
            titleFontSize: 20,
            paddingContentHorizontalLG: 0,
            paddingLG: 0,
            paddingMD: 0,
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
