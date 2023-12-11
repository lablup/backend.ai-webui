// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';
import { Modal, ModalProps, theme } from 'antd';
import React from 'react';

export interface BAIModalProps extends ModalProps {
  okText?: string; // customize text of ok button with adequate content
}
const BAIModal: React.FC<BAIModalProps> = ({ styles, ...modalProps }) => {
  const { token } = theme.useToken();
  return (
    <>
      <style>{rawBAIModalCss}</style>
      <Modal
        centered={modalProps.centered ?? true}
        className="bai-modal"
        styles={{
          ...styles,
          header: {
            marginBottom: token.marginSM,
            ...styles?.header,
          },
        }}
        {...modalProps}
      />
    </>
  );
};

export default BAIModal;
