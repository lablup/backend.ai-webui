import React from "react";

import { Form, InputNumber, Modal, ModalProps, theme } from "antd";
import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import { baiSignedRequestWithPromise } from "../helper";
import { useTanQuery } from "../hooks/reactQueryAlias";
import { ServingListInfo } from "../components/ServingList";
import Flex from "./Flex";

interface Props extends ModalProps {
  onRequestClose: () => void;
  dataSource: ServingListInfo | null;
}

const ModelServiceSettingModal: React.FC<Props> = ({
  onRequestClose,
  dataSource,
  ...props
}) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const _onOk = (e: React.MouseEvent<HTMLElement>) => {
    form.validateFields().then((values) => {
      // TODO: send Requests
    }).catch((err) => {
      console.log(err)
    })
  };

  return(
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={_onOk}
      onCancel={onRequestClose}
      title={"Edit Model Service"} // TODO: translate needed
    >
      <Flex direction="row" align="stretch" justify="around">
        <Form
          form={form}
          preserve={false}
          // labelCol={{ span: 12 }}
          // wrapperCol={{ span: 6 }}
          validateTrigger={["onChange", "onBlur"]}
          initialValues={{
            desired_session_count: dataSource?.desired_session_count,
          }}
          style={{ marginBottom: token.marginLG, marginTop: token.margin }}>
            <Form.Item 
              name="desired_session_count"
              label="Desired Session Count"
              rules={[
                {
                  pattern: /^[0-9]+$/,
                  message: "Only Allows non-negative integers."
                }
              ]}>
              <InputNumber type="number" min={0} />
            </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
};

export default ModelServiceSettingModal;