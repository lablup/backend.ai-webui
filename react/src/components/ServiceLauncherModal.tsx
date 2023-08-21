import {
  Card,
  Form,
  Input,
  Modal,
  ModalProps,
  theme,
  Switch,
  message,
} from "antd";
import React, { Suspense } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import SliderInputItem from "./SliderInputFormItem";
import ImageEnvironmentSelectFormItems, {
  Image,
  ImageEnvironmentFormInput,
} from "./ImageEnvironmentSelectFormItems";
import FlexActivityIndicator from "./FlexActivityIndicator";
import _ from "lodash";
import ResourceGroupSelect from "./ResourceGroupSelect";
import VFolderSelect from "./VFolderSelect";
import { useTanMutation } from "../hooks/reactQueryAlias";
import { useCurrentDomainValue } from "../hooks";
import { baiSignedRequestWithPromise } from "../helper";
import { useResourceSlots } from "../hooks/backendai";

type ClusterMode = "single-node" | "multi-node";

interface ServiceCreateConfigResourceOptsType {
  shmem?: number | string;
}
interface ServiceCreateConfigResourceType {
  cpu: number | string;
  mem: string;
  "cuda.device"?: number | string;
  "cuda.shares"?: number | string;
}

interface ServiceCreateConfigType {
  model: string;
  model_version?: string;
  model_mount_destination: string; // default == "/models"
  environ: object; // environment variable
  scaling_group: string;
  resources: ServiceCreateConfigResourceType;
  resource_opts?: ServiceCreateConfigResourceOptsType;
}
interface ServiceCreateType {
  name: string;
  desired_session_count: number;
  image: string;
  arch: string;
  group: string;
  domain: string;
  cluster_size: number;
  cluster_mode: ClusterMode;
  tag?: string;
  startup_command?: string;
  bootstrap_script?: string;
  owner_access_key?: string;
  open_to_public: boolean;
  config: ServiceCreateConfigType;
}

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
  openToPublic: boolean;
}

const ServiceLauncherModal: React.FC<ServiceLauncherProps> = ({
  extraP,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  // const [modalText, setModalText] = useState("Content of the modal");
  const currentDomain = useCurrentDomainValue();
  const [form] = Form.useForm<ServiceLauncherFormInput>();
  const [resourceSlots] = useResourceSlots();

  const mutationToCreateService = useTanMutation({
    mutationFn: (values: ServiceLauncherFormInput) => {
      const image: string = `${values.environments.image?.registry}/${values.environments.image?.name}:${values.environments.image?.tag}`;
      const body: ServiceCreateType = {
        name: values.serviceName,
        desired_session_count: values.desiredRoutingCount,
        image: image,
        arch: values.environments.image?.architecture as string,
        group: baiClient.current_group, // current Project Group,
        domain: currentDomain, // current Domain Group,
        cluster_size: 1, // FIXME: hardcoded. change it with option later
        cluster_mode: "single-node", // FIXME: hardcoded. change it with option later
        open_to_public: values.openToPublic,
        config: {
          model: values.vFolderName,
          model_mount_destination: "/models", // FIXME: hardcoded. change it with option later
          environ: {}, // FIXME: hardcoded. change it with option later
          scaling_group: values.resourceGroup,
          resources: {
            cpu: values.cpu,
            mem: values.mem + "G",
          },
        },
      };
      if (resourceSlots?.cuda === "shares") {
        body["config"].resources["cuda.shares"] = values.gpu;
      }
      if (resourceSlots?.cuda === "device") {
        body["config"].resources["cuda.device"] = values.gpu;
      }
      if (values.shmem && values.shmem > 0) {
        body["config"].resource_opts = {
          shmem: values.shmem,
        };
      }
      return baiSignedRequestWithPromise({
        method: "POST",
        url: "/services",
        body,
        client: baiClient,
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
      mutationToCreateService.mutate(values, {
        onSuccess: () => {
          onRequestClose(true);
        },
        onError: (error) => {
          message.error(t("modelService.FailedToStartService"));
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
      title={t("modelService.StartNewServing")}
      onOk={handleOk}
      onCancel={handleCancel}
      destroyOnClose={true}
      maskClosable={false}
      confirmLoading={mutationToCreateService.isLoading}
      centered
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
            label={t("modelService.ServiceName")}
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
            name="openToPublic"
            label={t("modelService.OpenToPublic")}
            valuePropName="checked"
          >
            <Switch></Switch>
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
            label={t("modelService.DesiredRoutingCount")}
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
                      tooltip={<Trans i18nKey={"session.launcher.DescCPU"} />}
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
                      tooltip={
                        <Trans i18nKey={"session.launcher.DescMemory"} />
                      }
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
                      tooltip={
                        <Trans i18nKey={"session.launcher.DescSharedMemory"} />
                      }
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
                    {resourceSlots.cuda !== undefined ? (
                      <SliderInputItem
                        style={{ marginBottom: 0 }}
                        name={"gpu"}
                        label={t("session.launcher.AIAccelerator")}
                        tooltip={
                          <Trans
                            i18nKey={"session.launcher.DescAIAccelerator"}
                          />
                        }
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
                    ) : (
                      <></>
                    )}
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
