import { TOTPActivateModalFragment$key } from '../__generated__/TOTPActivateModalFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import {
  QRCode,
  Typography,
  Input,
  theme,
  Form,
  message,
  Spin,
  FormInstance,
} from 'antd';
import { BAIModal, BAIModalProps, BAIFlex } from 'backend.ai-ui';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type TOTPActivateFormData = {
  otp: number;
};

interface Props extends BAIModalProps {
  userFrgmt?: TOTPActivateModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const TOTPActivateModal: React.FC<Props> = ({
  userFrgmt = null,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance<TOTPActivateFormData>>(null);

  const user = useFragment(
    graphql`
      fragment TOTPActivateModalFragment on User {
        email
        totp_activated @skipOnClient(if: $isNotSupportTotp)
      }
    `,
    userFrgmt,
  );

  const baiClient = useSuspendedBackendaiClient();

  const initializedTotp = useTanQuery<{
    totp_key: string;
    totp_uri: string;
  }>({
    queryKey: ['initialize_totp', baiClient?.email, baiModalProps.open],
    queryFn: () => {
      return user?.email === baiClient?.email &&
        !user?.totp_activated &&
        baiModalProps.open
        ? baiClient.initialize_totp()
        : null;
    },
    staleTime: 1000,
  });

  const mutationToActivateTotp = useTanMutation({
    mutationFn: (values: TOTPActivateFormData) => {
      return baiClient.activate_totp(values.otp);
    },
  });

  const _onOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        mutationToActivateTotp.mutate(values, {
          onSuccess: () => {
            message.success(t('totp.TotpSetupCompleted'));
            onRequestClose(true);
          },
          onError: () => {
            message.error(t('totp.InvalidTotpCode'));
          },
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={t('webui.menu.SetupTotp')}
      maskClosable={false}
      confirmLoading={mutationToActivateTotp.isPending}
      onOk={_onOk}
      onCancel={() => {
        onRequestClose();
      }}
      {...baiModalProps}
    >
      {initializedTotp.isLoading ? (
        <BAIFlex justify="center" direction="row">
          <Spin />
        </BAIFlex>
      ) : !initializedTotp.data ? (
        <BAIFlex justify="center" direction="row">
          {t('totp.TotpSetupNotAvailable')}
        </BAIFlex>
      ) : (
        <TOTPActivateForm
          ref={formRef}
          totp_uri={initializedTotp.data.totp_uri}
          totp_key={initializedTotp.data.totp_key}
        />
      )}
    </BAIModal>
  );
};

interface TOTPActiveFormProps {
  totp_uri: string;
  totp_key: string;
  ref: React.Ref<FormInstance<TOTPActivateFormData>>;
}
export const TOTPActivateForm: React.FC<TOTPActiveFormProps> = ({
  totp_uri,
  totp_key,
  ref,
}) => {
  const { token } = theme.useToken();
  const { t } = useTranslation();
  return (
    <>
      {t('totp.ScanQRToEnable')}
      <BAIFlex
        justify="center"
        style={{ margin: token.marginSM, gap: token.margin }}
      >
        <QRCode value={totp_uri} />
      </BAIFlex>
      {t('totp.TypeInAuthKey')}
      <BAIFlex
        justify="center"
        style={{ margin: token.marginSM, gap: token.margin }}
      >
        <Typography.Text copyable code>
          {totp_key}
        </Typography.Text>
      </BAIFlex>
      {t('totp.EnterConfirmationCode')}
      <Form ref={ref} preserve={false} validateTrigger={['onChange', 'onBlur']}>
        <BAIFlex
          justify="center"
          style={{ margin: token.marginSM, gap: token.margin }}
        >
          <Form.Item
            name="otp"
            rules={[
              {
                required: true,
                message: t('totp.RequireOTP'),
              },
              {
                pattern: /^[0-9]+$/,
                message: t('general.validation.NumbersOnly'),
              },
            ]}
          >
            <Input.OTP size="large" />
          </Form.Item>
        </BAIFlex>
      </Form>
    </>
  );
};

export default TOTPActivateModal;
