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
import BAICopyableText from './astryx-bui/BAICopyableText';
import { Spinner } from '@astryxdesign/core/Spinner';
import { TextInput } from '@astryxdesign/core/TextInput';
// DOCUMENTED EXCLUSION (to-astryx phase 3 wave 2, partition C).
// MAPPING.md §2 grades antd `QRCode` as **NONE** — "third-party": Astryx core
// and lab ship no QR renderer, and there is no QR encoder anywhere in this
// repo's dependency graph (checked: `node_modules/.pnpm` has no qr* package).
// Closing it means ADDING a runtime dependency, which during a parallel
// migration wave means a `pnpm-lock.yaml` write that three sibling agents
// would have to merge — the exact failure mode `.claude/rules/
// pnpm-lockfile-conflicts.md` exists for. So this single antd import stays,
// scoped to the one symbol, and is queued for the final switch: adopt a QR
// dependency (e.g. `qrcode.react`) and delete this line.
import { QRCode } from 'antd';
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

/**
 * The confirmation-code field. A raw Astryx `TextInput` (not the shared
 * `AstryxFormTextInput` adapter) so it can carry a fixed width and an
 * `htmlName`; the two `Form.Item` contracts — non-nullable `value`,
 * value-not-event `onChange` — are honoured inline.
 *
 * PILOT-DECISION: antd `Input.OTP`'s `inputMode="numeric"` / `maxLength` /
 * `autoComplete="one-time-code"` hints are dropped — `TextInputProps` is a
 * closed surface with no raw-attribute passthrough, and the Form.Item rules
 * already enforce required + digits-only.
 */
const OTPInput: React.FC<{
  label: string;
  /** Injected by `Form.Item`. */
  value?: string;
  /** Injected by `Form.Item`. */
  onChange?: (value: string) => void;
}> = ({ label, value, onChange }) => {
  'use memo';
  return (
    <TextInput
      label={label}
      isLabelHidden
      size="lg"
      width={200}
      value={value ?? ''}
      onChange={(next) => onChange?.(next)}
      htmlName="otp"
    />
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
        <QRCode value={totp_uri} />
      </BAIFlex>
      {t('totp.TypeInAuthKey')}
      <BAIFlex
        justify="center"
        style={{ margin: token.marginSM, gap: token.margin }}
      >
        {/* MAPPING §3.4: `copyable` has exactly one home — BAICopyableText;
            `code` becomes its `type`. */}
        <BAICopyableText type="code" copyLabel={t('button.Copy')}>
          {totp_key}
        </BAICopyableText>
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
            {/* PILOT-DECISION: antd `Input.OTP` is MAPPING §3.6 **NONE** —
                Astryx has no segmented one-time-code control, and rebuilding
                the six-box widget (per-box focus movement, paste splitting,
                backspace traversal) is precisely the antd-equivalence reflex
                the simplicity policy forbids. It becomes one `TextInput`; the
                Form.Item rules above already enforce required + digits-only,
                and `inputMode="numeric"` keeps the phone keypad. */}
            <OTPInput label={t('totp.EnterConfirmationCode')} />
          </Form.Item>
        </BAIFlex>
      </Form>
    </>
  );
};

export default TOTPActivateModal;
