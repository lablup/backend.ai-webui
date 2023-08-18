import React from "react";

import {
  Modal,
  ModalProps,
  Descriptions,
  DescriptionsProps,
  Button,
} from "antd";
import { useTranslation } from "react-i18next";
import { useFragment } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { ServingRouteErrorModalFragment$key } from "./__generated__/ServingRouteErrorModalFragment.graphql";
import CopyableCodeText from "./CopyableCodeText";

interface Props extends Omit<ModalProps, "onOk" | "onClose"> {
  inferenceSessionErrorFrgmt: ServingRouteErrorModalFragment$key | null;
  onRequestClose: () => void;
}

const ServingRouteErrorModal: React.FC<Props> = ({
  onRequestClose,
  onCancel,
  inferenceSessionErrorFrgmt,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const iSessionError = useFragment(
    graphql`
      fragment ServingRouteErrorModalFragment on InferenceSessionError {
        session_id
        errors {
          repr
        }
      }
    `,
    inferenceSessionErrorFrgmt
  );

  // const { errors } = endpoint
  // const targetSession = errors.filter(({ session_id }) => session === session_id)
  // if (targetSession.length > 0) {
  //   // setErrorJSONModalSessionID(session)
  //   // setErrorJSONModalError(targetSession[0].errors[0].repr)
  //   // setShowErrorJSONModal(true)
  // }

  const columnSetting: DescriptionsProps["column"] = {
    xxl: 1,
    xl: 1,
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <Modal
      centered
      title={t("modelService.ServingRouteErrorModalTitle")}
      onCancel={() => {
        onRequestClose();
      }}
      footer={[
        <Button
          onClick={() => {
            onRequestClose();
          }}
        >
          {t("button.Close")}
        </Button>,
      ]}
      {...modalProps}
    >
      <Descriptions
        bordered
        column={columnSetting}
        labelStyle={{ minWidth: 100 }}
      >
        <Descriptions.Item label={t("modelService.SessionId")}>
          <CopyableCodeText>{iSessionError?.session_id}</CopyableCodeText>
        </Descriptions.Item>
        <Descriptions.Item label={t("dialog.error.Error")}>
          {iSessionError?.errors[0].repr}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ServingRouteErrorModal;
