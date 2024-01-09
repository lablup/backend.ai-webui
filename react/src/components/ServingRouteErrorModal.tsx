import BAIModal, { BAIModalProps } from './BAIModal';
import CopyableCodeText from './CopyableCodeText';
import { ServingRouteErrorModalFragment$key } from './__generated__/ServingRouteErrorModalFragment.graphql';
import { Descriptions, DescriptionsProps, Button } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface Props extends Omit<BAIModalProps, 'onOk' | 'onClose'> {
  inferenceSessionErrorFrgmt: ServingRouteErrorModalFragment$key | null;
  onRequestClose: () => void;
}

const ServingRouteErrorModal: React.FC<Props> = ({
  onRequestClose,
  onCancel,
  inferenceSessionErrorFrgmt,
  ...baiModalProps
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
    inferenceSessionErrorFrgmt,
  );

  // const { errors } = endpoint
  // const targetSession = errors.filter(({ session_id }) => session === session_id)
  // if (targetSession.length > 0) {
  //   // setErrorJSONModalSessionID(session)
  //   // setErrorJSONModalError(targetSession[0].errors[0].repr)
  //   // setShowErrorJSONModal(true)
  // }

  const columnSetting: DescriptionsProps['column'] = {
    xxl: 1,
    xl: 1,
    lg: 1,
    md: 1,
    sm: 1,
    xs: 1,
  };

  return (
    <BAIModal
      centered
      title={t('modelService.ServingRouteErrorModalTitle')}
      onCancel={() => {
        onRequestClose();
      }}
      footer={[
        <Button
          onClick={() => {
            onRequestClose();
          }}
        >
          {t('button.Close')}
        </Button>,
      ]}
      {...baiModalProps}
    >
      <Descriptions
        bordered
        column={columnSetting}
        labelStyle={{ minWidth: 100 }}
        style={{ marginTop: 20 }}
      >
        <Descriptions.Item label={t('modelService.SessionId')}>
          <CopyableCodeText>{iSessionError?.session_id}</CopyableCodeText>
        </Descriptions.Item>
        <Descriptions.Item label={t('dialog.error.Error')}>
          {iSessionError?.errors[0].repr}
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default ServingRouteErrorModal;
