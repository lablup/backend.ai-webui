import React from "react";
import {
  Modal,
  ModalProps,
  Input,
  Typography,
  Space,
  Button,
  Form,
} from "antd";
import { DeleteOutlined, PlusOutlined, CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useWebComponentInfo } from "./DefaultProviders";
import Flex from "./Flex";

interface Props extends ModalProps {}
const { Text } = Typography;
const ManageAppsModal: React.FC<Props> = ({ ...modalProps }) => {
  const { t } = useTranslation();
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    servicePorts: any;
  };
  try {
    parsedValue = JSON.parse(value || "");
  } catch (error) {
    parsedValue = {
      open: false,
      servicePorts: [],
    };
  }
  const { open, servicePorts } = parsedValue;
  const onFinish = (values: any) => {
    console.log("Saved settings. ", values);
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        dispatchEvent("cancel", null);
      }}
      centered
      title={t("environment.ManageApps")}
      {...modalProps}
      footer={[
        <Flex direction="row" justify="between">
          <Button type="text" danger>
            {t("button.Reset")}
          </Button>
          <Button type="primary" icon={<CheckOutlined />}>
            {t("button.Save")}
          </Button>
        </Flex>,
      ]}
    >
      <Form
        initialValues={{ apps: servicePorts }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Flex direction="column" gap={"xs"}>
          <Space.Compact block>
            <Text style={{ width: "30%" }}>{t("environment.AppName")}</Text>
            <Text style={{ width: "30%" }}>{t("environment.Protocol")}</Text>
            <Text style={{ width: "30%" }}>{t("environment.Port")}</Text>
            <Text style={{ width: "10%", textAlign: "center" }}>
              {/* {t("environment.Action")} */}
            </Text>
          </Space.Compact>
          <Form.List name="apps">
            {(fields, { add, remove }) => (
              <Flex direction="column" gap="sm">
                {fields.map((field) => (
                  <Flex direction="row" gap={"xs"}>
                    <Space.Compact block key={field.key}>
                      <Form.Item
                        {...field}
                        name={[field.name, "app"]}
                        rules={[
                          {
                            required: true,
                            message: t("environment.AppNameMustNotBeEmpty"),
                          },
                        ]}
                        noStyle
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, "protocol"]}
                        noStyle
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, "port"]} noStyle>
                        <Input />
                      </Form.Item>
                    </Space.Compact>
                    <Button
                      type="text"
                      onClick={() => remove(field.name)}
                      style={{ width: "10%" }}
                      icon={<DeleteOutlined />}
                    />
                  </Flex>
                ))}
                <Button
                  type="dashed"
                  onClick={() => add()}
                  block
                  icon={<PlusOutlined />}
                >
                  {t("button.Add")}
                </Button>
              </Flex>
            )}
          </Form.List>
        </Flex>
      </Form>
      {/* <Space direction="vertical">
                <Space.Compact block>
                    <Text style={{ width: '30%' }}>{t('environment.AppName')}</Text>
                    <Text style={{ width: '30%' }}>{t('environment.Protocol')}</Text>
                    <Text style={{ width: '30%' }}>{t('environment.Port')}</Text>
                    <Text style={{ width: '10%' }}>{t('environment.Action')}</Text>
                </Space.Compact>
                {servicePorts?.map((item: any, index: number) => {
                    return (
                        <Space.Compact block key={index}>
                            <Input style={{ width: '30%' }} defaultValue={item.app}/>
                            <Input style={{ width: '30%' }} defaultValue={item.protocol}/>
                            <Input style={{ width: '30%' }} defaultValue={item.port}/>
                            <Button style={{ width: '10%' }} icon={<DeleteOutlined />}/>
                        </Space.Compact>
                    )
                })}
                <Button block icon={<PlusOutlined />}>{t('general.Add')}</Button>
            </Space> */}
    </Modal>
  );
};

export default ManageAppsModal;
