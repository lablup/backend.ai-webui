import {
  Button,
  Form,
  Modal,
  ModalProps,
  Input,
  theme,
  Tooltip,
  InputNumber,
  Divider,
  Card,
  message,
} from "antd";
import React, { Suspense, useState } from "react";
import { useTranslation } from "react-i18next";
import Flex from "./Flex";
import { useSuspendedBackendaiClient } from "../hooks";
import SliderInputItem from "./SliderInputFormItem";
import ImageEnvironmentSelectFormItems, {
  Image,
  ImageEnvironmentFormInput,
} from "./ImageEnvironmentSelectFormItems";
import FlexActivityIndicator from "./FlexActivityIndicator";
import _ from "lodash";
import ResourceGroupSelect from "./ResourceGroupSelect";
import { InfoCircleOutlined } from "@ant-design/icons";
import VFolderSelect from "./VFolderSelect";
import { useTanMutation } from "../hooks/reactQueryAlias";

interface ServiceLauncherProps extends Omit<ModalProps, "onOK" | "onCancel"> {
  extraP?: boolean;
  onRequestClose: (success?: boolean) => void;
}
interface ServiceLauncherFormInput extends ImageEnvironmentFormInput {
  serviceName: string;
  gpu: number;
  cpu: number;
  mem: number;
  shmem: number;
  resourceGroup: string;
  vFolderName: string;
  desiredRoutingCount: number;
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

  const mutationToCreateService = useTanMutation({
    mutationFn: (values: ServiceLauncherFormInput) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => resolve("mock"), 3000);
      });
    },
  });
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

      // TODO: useTanMutation to request service start
      mutationToCreateService.mutate(values, {
        onSuccess: () => {
          onRequestClose(true);
        },
        onError: (error) => {
          // TODO: show error message
        },
      });
      new Promise((resolve, reject) => {}).then(() => {
        onRequestClose(true);
      });
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
      okButtonProps={{
        loading: mutationToCreateService.isLoading,
      }}
      confirmLoading={confirmLoading}
      {...modalProps}
    >
      <Suspense fallback={<FlexActivityIndicator />}>
        <Form
          disabled={mutationToCreateService.isLoading}
          form={form}
          preserve={false}
          layout="vertical"
          labelCol={{ span: 12 }}
          initialValues={
            {
              cpu: 1,
              gpu: 0,
              mem: 0.25,
              shmem: 0,
              desiredRoutingCount: 1,
            } as ServiceLauncherFormInput
          }
        >
          <Form.Item
            //TODO: i18n
            label={"Service Name"}
            name="serviceName"
            rules={[
              {
                max: 20,
              },
            ]}
          >
            <Input />
          </Form.Item>
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
            <VFolderSelect
              filter={(vf) => vf.usage_mode === "model"}
              autoSelectDefault
            />
          </Form.Item>
          <SliderInputItem
            label={"Desired Routing Count"}
            name="desiredRoutingCount"
            rules={[
              {
                required: true,
              },
            ]}
            inputNumberProps={{
              //TODO: change unit based on resource limit
              addonAfter: "#",
            }}
            required
          />
          <Card
            style={{
              marginBottom: token.margin,
            }}
          >
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
            <Form.Item
              noStyle
              shouldUpdate={(prev, cur) =>
                prev.environments?.image?.digest !==
                cur.environments?.image?.digest
              }
            >
              {({ getFieldValue }) => {
                // TODO: change min/max based on selected images resource limit and current user limit
                const currentImage: Image =
                  getFieldValue("environments")?.image;

                return (
                  <>
                    <SliderInputItem
                      name={"cpu"}
                      label={t("session.launcher.CPU")}
                      // tooltip={t("session.launcher.DescCPU")}

                      min={parseInt(
                        _.find(
                          currentImage?.resource_limits,
                          (i) => i?.key === "cpu"
                        )?.min || "0"
                      )}
                      max={parseInt(
                        _.find(
                          currentImage?.resource_limits,
                          (i) => i?.key === "cpu"
                        )?.max || "100"
                      )}
                      inputNumberProps={{
                        addonAfter: t("session.launcher.Core"),
                      }}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <SliderInputItem
                      name={"mem"}
                      label={t("session.launcher.Memory")}
                      // tooltip={t("session.launcher.DescMemory")}
                      max={30}
                      inputNumberProps={{
                        addonAfter: "GB",
                      }}
                      step={0.05}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <SliderInputItem
                      name={"shmem"}
                      label={t("session.launcher.SharedMemory")}
                      // tooltip={t("session.launcher.DescSharedMemory")}
                      max={30}
                      step={0.1}
                      inputNumberProps={{
                        addonAfter: "GB",
                      }}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                    <SliderInputItem
                      style={{ marginBottom: 0 }}
                      name={"gpu"}
                      label={t("session.launcher.AIAccelerator")}
                      // tooltip={t("session.launcher.DescAIAccelerator")}
                      max={30}
                      step={0.1}
                      inputNumberProps={{
                        //TODO: change unit based on resource limit
                        addonAfter: "GPU",
                      }}
                      required
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    />
                  </>
                );
              }}
            </Form.Item>
          </Card>
        </Form>
      </Suspense>
    </Modal>
  );
};

export default ServiceLauncherModal;
