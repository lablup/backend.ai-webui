import React from 'react';
import { Modal, ModalProps } from 'antd';
// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';

export interface BAIModalProps extends ModalProps {}
const BAIModal: React.FC<BAIModalProps> = ({ ...modalProps }) => {
  return (
    <>
      <style>{rawBAIModalCss}</style>
      <Modal
        centered={modalProps.centered ?? true}
        className="bai-modal"
        {...modalProps}
      />
    </>
  );
};

export default BAIModal;
