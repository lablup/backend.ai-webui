import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAIModal, { BAIModalProps } from './BAIModal';
import Flex from './Flex';
import { TOTPActivateModalFragment$key } from './__generated__/TOTPActivateModalFragment.graphql';
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
import graphql from 'babel-plugin-relay/macro';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useFragment } from 'react-relay';

type TOTPActivateFormInput = {
  OTP: number;
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
  const { token } = theme.useToken();
  const formRef = useRef<FormInstance<TOTPActivateFormInput>>(null);

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
  let initializedTotp = useQuery<{
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
    suspense: false,
    staleTime: 0,
    cacheTime: 0,
  });

  const mutationToActivateTotp = useTanMutation({
    mutationFn: (values: TOTPActivateFormInput) => {
      return baiClient.activate_totp(values.OTP);
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
        new Promise((resolve, reject) => {}).then(() => {
          onRequestClose(true);
        });
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={t('webui.menu.SetupTotp')}
      maskClosable={false}
      confirmLoading={mutationToActivateTotp.isLoading}
      onOk={_onOk}
      onCancel={() => {
        onRequestClose();
      }}
      {...baiModalProps}
    >
      {initializedTotp.isLoading ? (
        <Flex justify="center" direction="row">
          <Spin />
        </Flex>
      ) : !initializedTotp.data ? (
        <Flex justify="center" direction="row">
          {t('totp.TotpSetupNotAvailable')}
        </Flex>
      ) : (
        <>
          {t('totp.ScanQRToEnable')}
          <Flex
            justify="center"
            style={{ margin: token.marginSM, gap: token.margin }}
          >
            <QRCode value={initializedTotp.data.totp_uri} />
          </Flex>
          {t('totp.TypeInAuthKey')}
          <Flex
            justify="center"
            style={{ margin: token.marginSM, gap: token.margin }}
          >
            <Typography.Text copyable code>
              {initializedTotp.data.totp_key}
            </Typography.Text>
          </Flex>
          {t('totp.EnterConfirmationCode')}
          <Form
            ref={formRef}
            preserve={false}
            validateTrigger={['onChange', 'onBlur']}
          >
            <Flex
              justify="center"
              style={{ margin: token.marginSM, gap: token.margin }}
            >
              <Form.Item
                name="OTP"
                rules={[
                  {
                    required: true,
                    message: t('totp.RequireOTP'),
                  },
                  {
                    pattern: /^[0-9]+$/,
                    message: t('credential.validation.NumbersOnly'),
                  },
                ]}
              >
                <Input
                  maxLength={6}
                  allowClear
                  placeholder="000000"
                  style={{ maxWidth: 150 }}
                />
              </Form.Item>
            </Flex>
          </Form>
        </>
      )}
    </BAIModal>
  );
};

export default TOTPActivateModal;
