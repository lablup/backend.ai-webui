/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App, GlobalToken, Typography } from 'antd';
import { useErrorMessageResolver } from 'backend.ai-ui';
import { TFunction } from 'i18next';

type ModalInstance = ReturnType<typeof App.useApp>['modal'];
type GetErrorMessage = ReturnType<
  typeof useErrorMessageResolver
>['getErrorMessage'];

interface OpenSFTPFailureModalArgs {
  modal: ModalInstance;
  t: TFunction;
  token: GlobalToken;
  error: unknown;
  getErrorMessage: GetErrorMessage;
  onGoToUploadSessions: () => void;
}

/**
 * Opens the SFTP session creation failure modal.
 *
 * Shared by `SFTPServerButton` and `SFTPServerButtonV2` (the legacy and
 * Relay-node variants) so that copy, classification, and the recovery CTA
 * stay in sync. Uses `modal.error` with `okCancel` to keep the native
 * error styling (icon + colors) while still exposing a primary action
 * that deep-links to the upload session list — the failure shown here is
 * typically downstream of stale upload sessions piling up.
 */
export const openSFTPFailureModal = ({
  modal,
  t,
  token,
  error,
  getErrorMessage,
  onGoToUploadSessions,
}: OpenSFTPFailureModalArgs) => {
  modal.error({
    okCancel: true,
    title: t('data.explorer.SFTPSessionCreationFailed'),
    content: (
      <Typography.Paragraph
        style={{ marginTop: token.marginSM, marginBottom: 0 }}
      >
        <Typography.Text>
          {getErrorMessage(error, { verbosity: 'detail' })}
        </Typography.Text>
        <br />
        <Typography.Text type="secondary">
          {t('data.explorer.SFTPSessionFailureHint')}
        </Typography.Text>
      </Typography.Paragraph>
    ),
    okText: t('session.GoToUploadSessionList'),
    cancelText: t('button.Close'),
    onOk: onGoToUploadSessions,
  });
};
