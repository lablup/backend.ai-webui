/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAICodeEditor from './BAICodeEditor';
import { useQueryClient } from '@tanstack/react-query';
import { App, Form, Switch, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import Markdown from 'markdown-to-jsx';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  // Collapse the first/last block margins so the preview content sits flush
  // with the box padding, keeping top/bottom spacing equal to left/right.
  markdownPreview: css`
    & > *:first-child {
      margin-top: 0;
    }
    & > *:last-child {
      margin-bottom: 0;
    }
  `,
}));

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  initialMessage?: string;
  initialEnabled?: boolean;
}

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  initialMessage,
  initialEnabled,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { styles } = useStyles();
  const { token } = theme.useToken();
  const { message: appMessage } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const baiClient = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();

  // The modal is wrapped in BAIUnmountAfterClose by its parent, so it remounts
  // on every open — these initializers always reflect the latest announcement.
  const [message, setMessage] = useState(initialMessage ?? '');
  const [enabled, setEnabled] = useState(initialEnabled ?? true);

  const updateMutation = useTanMutation({
    mutationFn: ({
      enabled,
      message,
    }: {
      enabled: boolean;
      message: string;
    }) => {
      return baiClient.service.update_announcement(enabled, message);
    },
  });

  return (
    <BAIModal
      width={960}
      title={t('summary.EditAnnouncement')}
      okText={t('button.Save')}
      confirmLoading={updateMutation.isPending}
      onCancel={() => onRequestClose()}
      onOk={() => {
        // The backend rejects enabling an announcement with an empty message
        // ("Empty message not allowed to enable announcement"); guard here so
        // the user gets immediate feedback instead of a server error.
        if (enabled && !message.trim()) {
          appMessage.error(t('summary.AnnouncementMessageRequired'));
          return;
        }
        updateMutation.mutate(
          { enabled, message },
          {
            onSuccess: () => {
              appMessage.success(t('summary.AnnouncementUpdated'));
              queryClient.invalidateQueries({
                queryKey: ['baiClient', 'service', 'get_announcement'],
              });
              onRequestClose(true);
            },
            onError: (error) => {
              appMessage.error(getErrorMessage(error));
              logger.error(error);
            },
          },
        );
      }}
      {...modalProps}
    >
      <Form layout="vertical">
        <BAIFlex direction="column" align="stretch" gap="sm">
          <Form.Item
            label={t('summary.AnnouncementEnabled')}
            required
            style={{ marginBottom: 0 }}
          >
            <Switch checked={enabled} onChange={setEnabled} />
          </Form.Item>
          <BAIFlex direction="row" align="stretch" gap="sm" wrap="wrap">
            <Form.Item
              label={t('summary.AnnouncementMessage')}
              required={enabled}
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <BAICodeEditor
                language="markdown"
                editable
                value={message}
                onChange={setMessage}
                lineWrapping
                height={280}
              />
            </Form.Item>
            <Form.Item
              label={t('summary.AnnouncementPreview')}
              required
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <div
                className={styles.markdownPreview}
                style={{
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  padding: token.padding,
                  height: 280,
                  overflow: 'auto',
                }}
              >
                <Markdown>{message || ''}</Markdown>
              </div>
            </Form.Item>
          </BAIFlex>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default AnnouncementEditModal;
