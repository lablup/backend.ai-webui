'use memo';

import { Typography } from 'antd';
import { BAIButton, BAIFlex, BAIModal, BAIModalProps } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AppLaunchConfirmationModalFragment$key } from 'src/__generated__/AppLaunchConfirmationModalFragment.graphql';
import { useBackendAIAppLauncher } from 'src/hooks/useBackendAIAppLauncher';

interface AppLaunchConfirmationModalProps extends BAIModalProps {
  sessionFrgmt: AppLaunchConfirmationModalFragment$key;
  appName: string;
  onRequestClose: () => void;
}

/**
 * Confirmation modal for apps that require user acknowledgment before launching.
 * Used for nniboard and mlflow-ui apps that need to run before tunneling.
 *
 * This matches the legacy behavior of `_openAppLaunchConfirmationDialog` in
 * backend-ai-app-launcher.ts
 */
const AppLaunchConfirmationModal: React.FC<AppLaunchConfirmationModalProps> = ({
  sessionFrgmt,
  appName,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const session = useFragment(
    graphql`
      fragment AppLaunchConfirmationModalFragment on ComputeSessionNode {
        id
        row_id
        name
        ...useBackendAIAppLauncherFragment
      }
    `,
    sessionFrgmt,
  );

  const { launchAppWithNotification } = useBackendAIAppLauncher(session);

  const handleConfirmAndRun = async () => {
    onRequestClose();

    await launchAppWithNotification({
      app: appName,
      onPrepared(workerInfo) {
        // Open app in new window after preparation
        if (workerInfo.appConnectUrl) {
          setTimeout(() => {
            window.open(workerInfo.appConnectUrl?.href, '_blank');
          }, 1000);
        }
      },
    });
  };

  return (
    <BAIModal
      title={t('session.appLauncher.AppMustBeRun')}
      onCancel={onRequestClose}
      footer={null}
      {...modalProps}
    >
      <BAIFlex direction="column" gap="md" align="stretch">
        <Typography.Paragraph>
          {t('session.appLauncher.AppMustBeRunDialog')}
        </Typography.Paragraph>
        <Typography.Paragraph>
          {t('dialog.ask.DoYouWantToProceed')}
        </Typography.Paragraph>

        <BAIButton
          type="primary"
          size="large"
          action={handleConfirmAndRun}
          block
        >
          {t('session.appLauncher.ConfirmAndRun')}
        </BAIButton>
      </BAIFlex>
    </BAIModal>
  );
};

export default AppLaunchConfirmationModal;
