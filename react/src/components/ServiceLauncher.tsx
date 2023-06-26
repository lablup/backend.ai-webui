import { Button, Modal, theme } from "antd";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";

interface ServiceLauncherProps {}
const ServiceLauncher: React.FC<ServiceLauncherProps> = () => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const baiClient = useSuspendedBackendaiClient();
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [modalText, setModalText] = useState('Content of the modal');
    
    const showModal = () => {
      setOpen(true);
    }

    const handleOk = () => {
      setModalText('Lorem Ipsum');
      setConfirmLoading(true);
      setTimeout(() => {
        setOpen(false);
        setConfirmLoading(false);
      }, 2000);
    }

    const handleCancel = () => {
      console.log('Clicked cancel button');
      setOpen(false);
    };

    return (
        <>
          <Button type="primary" onClick={ showModal }>
            Start Service
          </Button>
          <Modal
            title="Title"
            open={open}
            onOk={handleOk}
            confirmLoading={confirmLoading}
            onCancel={handleCancel}
          >
            <p>{modalText}</p>
          </Modal>
        </>
    );
};

export default ServiceLauncher;