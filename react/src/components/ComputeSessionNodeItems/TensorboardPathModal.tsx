/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { TensorboardPathModalFragment$key } from '../../__generated__/TensorboardPathModalFragment.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useBackendAIAppLauncher } from '../../hooks/useBackendAIAppLauncher';
import { Button } from '@astryxdesign/core/Button';
import { Text } from '@astryxdesign/core/Text';
// FRONTIER (ticket 17 / ticket 34): Form + Form.Item + Input stay on the antd
// form engine (locked SHIM decision).
import { Input } from 'antd';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface TensorboardPathModalProps extends BAIModalProps {
  sessionFrgmt: TensorboardPathModalFragment$key;
  onRequestClose: () => void;
  port?: number;
  openToPublic?: boolean;
  allowedClientIps?: Array<string>;
}

const TensorboardPathModal: React.FC<TensorboardPathModalProps> = ({
  sessionFrgmt,
  onRequestClose,
  port,
  openToPublic,
  allowedClientIps,
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
        port,
        openToPublic,
        allowedClientIps,
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
        <Text as="p" display="block">
          {t('session.InputTensorboardPath')}
        </Text>

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

        <Button
          variant="primary"
          size="lg"
          label={t('session.UseThisPath')}
          clickAction={handleSubmit}
        />
      </BAIFlex>
    </BAIModal>
  );
};

export default TensorboardPathModal;
