import React, { useState, useEffect } from "react";
import { 
  Modal,
  ModalProps,
  Form,
  FormProps,
  Select,
  Input,
  InputNumber,
} from "antd";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";

interface CustomQuotaAddingFormProps extends FormProps {
  currentMode: string;
}
const QuotaSettingVarForm: React.FC<CustomQuotaAddingFormProps> = ({
  currentMode,
  ...props
}) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();

  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 16 }}
      preserve={false}
      {...props}
      validateTrigger={["onChange", "onBlur"]}
    >
      {currentMode === 'user' && (
        <>
        
        </>
      )}
    </Form>
  );
};

interface Props extends ModalProps {
  currentMode: string;
}
const StorageHostQuotaCustomAddingModal: React.FC<Props> = ({
  currentMode,
  ...props
}) => {
  const { t } = useTranslation();

  const [form] = Form.useForm();

  useEffect(() => {
    if (props.open) {
    } else {
      form.resetFields();
    }
  }, [props.open]);

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={(e) => {
        form.submit();
      }}
      title={currentMode === 'project' ? t('storageHost.quotaSettings.AddProject') : t('storageHost.quotaSettings.AddUser')}
    >
    </Modal>
  );
};

export default StorageHostQuotaCustomAddingModal;
