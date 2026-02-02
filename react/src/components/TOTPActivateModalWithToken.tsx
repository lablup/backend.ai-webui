import { useAnonymousBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useWebComponentInfo } from './DefaultProviders';
import { TOTPActivateForm, TOTPActivateFormData } from './TOTPActivateModal';
import { type FormInstance, message } from 'antd';
import { BAIModal, BAIFlex } from 'backend.ai-ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TOTPActivateModalWithToken = () => {
  const { t } = useTranslation();
  const formRef = useRef<FormInstance<TOTPActivateFormData>>(null);
  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    open: boolean;
    totp_registration_token: string;
    api_endpoint: string;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      open: false,
      totp_registration_token: '',
      api_endpoint: '',
    };
  }

  const { api_endpoint, open, totp_registration_token } = parsedValue;
  const anonBaiClient = useAnonymousBackendaiClient({
    api_endpoint,
  });

  const {
    data: initializedTotp,
    isSuccess,
    isError,
    mutate,
  } = useTanMutation<
    {
      totp_key: string;
      totp_uri: string;
    },
    null,
    {
      registration_token: string;
    }
  >({
    mutationFn: ({ registration_token }) => {
      return anonBaiClient.initialize_totp_anon({
        registration_token,
      });
    },
  });

  useEffect(() => {
    if (open) {
      mutate({
        registration_token: totp_registration_token,
      });
    }
  }, [open, mutate, totp_registration_token]);

  const mutationToActivateTotp = useTanMutation<
    NonNullable<unknown>,
    null,
    {
      registration_token: string;
      otp: number;
    }
  >({
    mutationFn: (values: TOTPActivateFormData) => {
      return anonBaiClient.activate_totp_anon(values);
    },
  });

  const _onOk = () => {
    formRef.current
      ?.validateFields()
      .then((values) => {
        mutationToActivateTotp.mutate(
          {
            otp: values.otp,
            registration_token: totp_registration_token,
          },
          {
            onSuccess: () => {
              message.success(t('totp.TotpSetupCompleted'));
              dispatchEvent('ok', null);
            },
            onError: () => {
              message.error(t('totp.InvalidTotpCode'));
            },
          },
        );
      })
      .catch(() => {});
  };

  return (
    <BAIModal
      title={t('webui.menu.SetupTotp')}
      maskClosable={false}
      confirmLoading={mutationToActivateTotp.isPending}
      open={open}
      onCancel={() => {
        dispatchEvent('cancel', null);
      }}
      destroyOnHidden
      onOk={_onOk}
      loading={!isSuccess}
    >
      {isError || !initializedTotp?.totp_uri || !initializedTotp?.totp_key ? (
        <BAIFlex>{t('totp.TotpSetupNotAvailable')}</BAIFlex>
      ) : (
        <TOTPActivateForm
          ref={formRef}
          totp_uri={initializedTotp?.totp_uri}
          totp_key={initializedTotp?.totp_key}
        />
      )}
    </BAIModal>
  );
};

export default TOTPActivateModalWithToken;
