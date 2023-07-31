import React from "react";

import { Form, InputNumber, Modal, ModalProps, theme } from "antd";
// import { useTranslation } from "react-i18next";
import { useSuspendedBackendaiClient } from "../hooks";
import { baiSignedRequestWithPromise } from "../helper";
import { useTanMutation } from "../hooks/reactQueryAlias";
import Flex from "./Flex";
import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { ModelServiceSettingModal_endpoint$key } from "./__generated__/ModelServiceSettingModal_endpoint.graphql";

interface Props extends ModalProps {
  endpointFrgmt: ModelServiceSettingModal_endpoint$key | null;
  onRequestClose: (success?: boolean) => void;
}

interface ServiceSettingFormInput {
  desired_session_count: number;
}

const ModelServiceSettingModal: React.FC<Props> = ({
  onRequestClose,
  endpointFrgmt,
  ...props
}) => {
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
  // const { t } = useTranslation();
  const [form] = Form.useForm();

  const endpoint = useFragment(
    graphql`
      fragment ModelServiceSettingModal_endpoint on Endpoint {
        endpoint_id
        desired_session_count
      }
    `,
    endpointFrgmt
  );

  const mutationToUpdateService = useTanMutation({
    mutationFn: (values: ServiceSettingFormInput) => {
      const body = {
        to: values.desired_session_count,
      };
      return baiSignedRequestWithPromise({
        method: "POST",
        url: `/services/${endpoint?.endpoint_id}/scale`,
        body,
        client: baiClient,
      });
    },
  });

  // Apply any operation after clicking OK button
  const handleOk = (e: React.MouseEvent<HTMLElement>) => {
    form
      .validateFields()
      .then((values) => {
        mutationToUpdateService.mutate(values, {
          onSuccess: () => {
            console.log("service updated");
            onRequestClose(true);
          },
          onError: (error) => {
            console.log(error);
            // TODO: show error message
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // Apply any operation after clicking Cancel button
  const handleCancel = () => {
    // console.log("Clicked cancel button");
    onRequestClose();
  };

  return (
    <Modal
      {...props}
      style={{
        zIndex: 10000,
      }}
      destroyOnClose
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{
        loading: mutationToUpdateService.isLoading,
      }}
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
            desired_session_count: endpoint?.desired_session_count,
          }}
          style={{ marginBottom: token.marginLG, marginTop: token.margin }}
        >
          <Form.Item
            name="desired_session_count"
            label="Desired Session Count"
            rules={[
              {
                pattern: /^[0-9]+$/,
                message: "Only Allows non-negative integers.",
              },
            ]}
          >
            <InputNumber type="number" min={0} />
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
};

export default ModelServiceSettingModal;
