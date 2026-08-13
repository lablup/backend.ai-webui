/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TOTPActivateModalFragment$key } from '../__generated__/TOTPActivateModalFragment.graphql';
import { App } from '../app-shim';
import { Form, FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation, useTanQuery } from '../hooks/reactQueryAlias';
import { theme } from '../theme-shim';
import { AstryxFormTextInput } from './astryxFormControls';
import { Spinner } from '@astryxdesign/core/Spinner';
import { BAIModal, BAIModalProps, BAIFlex, BAIText } from 'backend.ai-ui';
// PILOT-DECISION (p3-w3b): antd `QRCode` was the last antd RENDER in this
// file. MAPPING.md §2 grades it **NONE** — neither Astryx core nor lab ships
// a QR renderer — so closing it meant adopting a dependency. `qrcode.react`
// is the one taken: 4.2.0, ISC, ZERO runtime dependencies, 115 KB unpacked,
// published 2024-12-11 and therefore already past `minimumReleaseAge`
// (no `minimumReleaseAgeExclude` entry needed). Catalogued in
// `pnpm-workspace.yaml` like every other shared dep.
import { QRCodeSVG } from 'qrcode.react';
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
  'use memo';
  const { t } = useTranslation();
  // Static `message` from antd -> the app-shim's `App.useApp()` bridge.
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<TOTPActivateFormData>>(null);

  const user = useFragment(
    graphql`
      fragment TOTPActivateModalFragment on UserV2 {
        basicInfo {
          email
        }
        security {
          totpActivated @skipOnClient(if: $isNotSupportTotp)
        }
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
      return user?.basicInfo?.email === baiClient?.email &&
        !user?.security?.totpActivated &&
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
          {/* MAPPING §3.14: a bare `Spin` indicator is `Spinner`. */}
          <Spinner />
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
  'use memo';
  const { token } = theme.useToken();
  const { t } = useTranslation();
  return (
    <>
      {t('totp.ScanQRToEnable')}
      <BAIFlex
        justify="center"
        style={{ margin: token.marginSM, gap: token.margin }}
      >
        {/* PILOT-DECISION: the QR is pinned to literal black-on-white in
            BOTH modes rather than themed. That is a scanner-contrast
            requirement, not a styling choice — antd's `QRCode` defaulted to a
            TRANSPARENT background, which over the dark-mode dialog surface
            renders black modules on near-black and is unreadable by a phone
            camera. `marginSize` keeps the mandatory quiet zone. Size 160
            matches antd's default so the modal's layout is unchanged. */}
        <QRCodeSVG
          value={totp_uri}
          size={160}
          marginSize={2}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </BAIFlex>
      {t('totp.TypeInAuthKey')}
      <BAIFlex
        justify="center"
        style={{ margin: token.marginSM, gap: token.margin }}
      >
        <BAIText code copyable>
          {totp_key}
        </BAIText>
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
            {/* PILOT-DECISION (kept from wave 2): antd `Input.OTP` is
                MAPPING §3.6 **NONE** — Astryx has no segmented
                one-time-code control, and rebuilding the six-box widget
                (per-box focus movement, paste splitting, backspace
                traversal) is precisely the antd-equivalence reflex the
                simplicity policy forbids. It becomes one `TextInput`, and
                its `inputMode="numeric"` / `maxLength` /
                `autoComplete="one-time-code"` hints are dropped because
                `TextInputProps` is a closed surface with no raw-attribute
                passthrough; the `Form.Item` rules above already enforce
                required + digits-only.

                `size` / `width` / `htmlName` are on the SHARED adapter now
                (D10 fold-back), so this no longer needs a local copy. */}
            <AstryxFormTextInput
              label={t('totp.EnterConfirmationCode')}
              size="lg"
              width={200}
              htmlName="otp"
            />
          </Form.Item>
        </BAIFlex>
      </Form>
    </>
  );
};

export default TOTPActivateModal;
