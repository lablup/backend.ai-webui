/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { BAIFlex, BAIText, useErrorMessageResolver } from 'backend.ai-ui';
import { TFunction } from 'i18next';

type ModalInstance = ReturnType<typeof App.useApp>['modal'];
type GetErrorMessage = ReturnType<
  typeof useErrorMessageResolver
>['getErrorMessage'];

interface OpenSFTPFailureModalArgs {
  modal: ModalInstance;
  t: TFunction;
  error: unknown;
  getErrorMessage: GetErrorMessage;
  onGoToUploadSessions: () => void;
}

/**
 * Shared by `SFTPServerButton` and `SFTPServerButtonV2` so the copy and the
 * recovery CTA stay in sync. `confirm` (not `error`) because the app-shim only
 * renders a cancel button for that kind, and this modal needs two actions.
 */
export const openSFTPFailureModal = ({
  modal,
  t,
  error,
  getErrorMessage,
  onGoToUploadSessions,
}: OpenSFTPFailureModalArgs) => {
  modal.confirm({
    title: t('data.explorer.SFTPSessionCreationFailed'),
    content: (
      <BAIFlex direction="column" align="start" gap="xs">
        <BAIText>{getErrorMessage(error, { verbosity: 'detail' })}</BAIText>
        <BAIText type="secondary">
          {t('data.explorer.SFTPSessionFailureHint')}
        </BAIText>
      </BAIFlex>
    ),
    okText: t('session.GoToUploadSessionList'),
    cancelText: t('button.Close'),
    onOk: onGoToUploadSessions,
  });
};
