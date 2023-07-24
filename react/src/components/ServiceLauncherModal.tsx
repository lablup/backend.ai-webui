import { Button, Form, Modal, ModalProps, Input, theme, Tooltip } from "antd";
import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import SliderInputItem from "./SliderInputFormItem";
import ImageEnvironmentSelectFormItems, {
  ImageEnvironmentFormInput,
} from "./ImageEnvironmentSelectFormItems";
import FlexActivityIndicator from "./FlexActivityIndicator";
import _ from "lodash";
import ResourceGroupSelect from "./ResourceGroupSelect";
import { InfoCircleOutlined } from "@ant-design/icons";
import VFolderSelect from "./VFolderSelect";

interface ServiceLauncherProps extends Omit<ModalProps, "onOK" | "onCancel"> {
  extraP?: boolean;
  onRequestClose: (success?: boolean) => void;
}
interface ServiceLauncherFormInput extends ImageEnvironmentFormInput {
  gpu: number;
  cpu: number;
  resourceGroup: string;
  vFolderName: string;
}

const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({
  extraP,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalText, setModalText] = useState("Content of the modal");
  const [form] = Form.useForm<ServiceLauncherFormInput>();
  // const scalingGroupList = use;
  // modelStorageList: Record<string, any>[];
  // environmentList: Record<string, any>[];
  // name?: string;
  // cpu: number | string;
  // mem: number | string;
  // npu?: number | string;
  // shmem?: number | string;

  // Apply any operation after clicking OK button
  const handleOk = () => {
    // setModalText("Lorem Ipsum");
    // setConfirmLoading(true);
    // // TODO: send request to start service to manager server
    // setTimeout(() => {
    //   setConfirmLoading(false);
    // }, 2000);
    form.validateFields().then((values) => {
      console.log(values);

      //do mutation and
      onRequestClose(true);
    });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    // console.log("Clicked cancel button");
    onRequestClose();
  };

  return (
    <Modal
      title="Title"
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      maskClosable={false}
      confirmLoading={confirmLoading}
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Form
          form={form}
          preserve={false}
          layout="vertical"
          labelCol={{ span: 12 }}
          initialValues={
            {
              cpu: 1,
              gpu: 0,
            } as ServiceLauncherFormInput
          }
        >
          <Form.Item
            name="resourceGroup"
            label={t("session.ResourceGroup")}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <ResourceGroupSelect autoSelectDefault />
          </Form.Item>
          <Form.Item
            name={"vFolderName"}
            label={t("session.launcher.ModelStorageToMount")}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <VFolderSelect filter={(vf) => vf.usage_mode === "model"} />
          </Form.Item>
          <ImageEnvironmentSelectFormItems
          // //TODO: test with real inference images
          // filter={(image) => {
          //   return !!_.find(image?.labels, (label) => {
          //     return (
          //       label?.key === "ai.backend.role" &&
          //       label.value === "INFERENCE" //['COMPUTE', 'INFERENCE', 'SYSTEM']
          //     );
          //   });
          // }}
          />
          <SliderInputItem
            name={"cpu"}
            label={t("session.launcher.CPU")}
            // tooltip={t("session.launcher.DescCPU")}
            max={30}
          />
          <SliderInputItem
            name={"mem"}
            label={t("session.launcher.Memory")}
            // tooltip={t("session.launcher.DescMemory")}
            max={30}
            step={0.1}
          />
          <SliderInputItem
            name={"shmem"}
            label={t("session.launcher.SharedMemory")}
            // tooltip={t("session.launcher.DescSharedMemory")}
            max={30}
            step={0.1}
          />
          <SliderInputItem
            name={"gpu"}
            label={t("session.launcher.AIAccelerator")}
            // tooltip={t("session.launcher.DescAIAccelerator")}
            max={30}
            step={0.1}
          />
        </Form>
      </Suspense>
    </Modal>
  );
};

export default ServiceLauncherModal;
