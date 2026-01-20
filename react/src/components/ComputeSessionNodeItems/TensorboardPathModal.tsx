import { App, Form, Input, Typography } from 'antd';
import {
  BAIButton,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { TensorboardPathModalFragment$key } from 'src/__generated__/TensorboardPathModalFragment.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';
import { useBackendAIAppLauncher } from 'src/hooks/useBackendAIAppLauncher';

interface TensorboardPathModalProps extends BAIModalProps {
  sessionFrgmt: TensorboardPathModalFragment$key;
  onRequestClose: () => void;
}

const TensorboardPathModal: React.FC<TensorboardPathModalProps> = ({
  sessionFrgmt,
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const baiClient = useSuspendedBackendaiClient();
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const session = useFragment(
    graphql`
      fragment TensorboardPathModalFragment on ComputeSessionNode {
        id
        row_id
        name
        ...useBackendAIAppLauncherFragment
      }
    `,
    sessionFrgmt,
  );

  const { launchAppWithNotification, closeWsproxy } =
    useBackendAIAppLauncher(session);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const path = values.tensorboardPath || '/home/work/logs';

      // 1. Shutdown existing tensorboard service
      await baiClient.shutdown_service(session?.row_id, 'tensorboard');

      // 2. Close existing wsproxy connection for tensorboard
      // This matches legacy behavior: shutdown_service -> _close_wsproxy -> _open_wsproxy
      await closeWsproxy('tensorboard').catch(() => {
        logger.log(
          'failed to close existing wsproxy for tensorboard, continuing anyway',
        );
      });

      // 3. Launch new tensorboard with --logdir argument
      await launchAppWithNotification({
        app: 'tensorboard',
        args: { '--logdir': path },
        onPrepared(workerInfo) {
          // Open tensorboard in new window
          if (workerInfo.appConnectUrl) {
            window.open(workerInfo.appConnectUrl.href, '_blank');
          }
        },
      });

      onRequestClose();
    } catch (error) {
      logger.error('Failed to launch tensorboard:', error);
      message.error(getErrorMessage(error as Error));
    }
  };

  return (
    <BAIModal
      title={t('session.TensorboardPath')}
      onCancel={onRequestClose}
      footer={null}
      {...modalProps}
    >
      <BAIFlex direction="column" gap="md" align="stretch">
        <Typography.Paragraph>
          {t('session.InputTensorboardPath')}
        </Typography.Paragraph>

        <Form
          form={form}
          layout="vertical"
          initialValues={{
            tensorboardPath: '/home/work/logs',
          }}
        >
          <Form.Item name="tensorboardPath">
            <Input placeholder={t('session.DefaultTensorboardPath')} />
          </Form.Item>
        </Form>

        <BAIButton type="primary" size="large" action={handleSubmit}>
          {t('session.UseThisPath')}
        </BAIButton>
      </BAIFlex>
    </BAIModal>
  );
};

export default TensorboardPathModal;
