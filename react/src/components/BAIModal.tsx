// @ts-ignore
import rawBAIModalCss from './BAIModal.css?raw';
import { Modal, ModalProps } from 'antd';
import React from 'react';

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
