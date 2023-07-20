import { Button, Modal, ModalProps, theme } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import SliderInput from "./SliderInput";

interface ServiceLauncherProps  extends ModalProps {
  extraP? : boolean
}
const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({extraP, ...modalProps}) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const baiClient = useSuspendedBackendaiClient();
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    // const scalingGroupList = use;
    // modelStorageList: Record<string, any>[];
    // environmentList: Record<string, any>[];
    // name?: string;
    // cpu: number | string;
    // mem: number | string;
    // npu?: number | string;
    // shmem?: number | string;
    
    const showModal = () => {
      setOpen(true);
    }

    // Apply any operation after clicking OK button
    const handleOk = () => {
      setModalText('Lorem Ipsum');
      setConfirmLoading(true);
      // TODO: send request to start service to manager server
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    }

    // Apply any operation after clicking Cancel button
    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };

    return (
          <Modal
            title="Title"
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
            {
              ...modalProps
            }
          >
            <p>{modalText}</p>
            <SliderInput></SliderInput>
            <SliderInput></SliderInput>
            <SliderInput></SliderInput>
            <SliderInput></SliderInput>
          </Modal>
    );
};

export default ServiceLauncherModal;