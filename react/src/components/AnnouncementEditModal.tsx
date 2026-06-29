/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import BAICodeEditor from './BAICodeEditor';
import { useQueryClient } from '@tanstack/react-query';
import { App, Form, Switch, Typography, theme } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import Markdown from 'markdown-to-jsx';
import { useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  initialMessage?: string;
}

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  initialMessage,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message: appMessage } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const baiClient = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState(initialMessage ?? '');
  const [enabled, setEnabled] = useState(true);

  const syncMessageOnOpen = useEffectEvent((open?: boolean) => {
    if (open) {
      setMessage(initialMessage ?? '');
    }
  });
  useEffect(() => {
    syncMessageOnOpen(modalProps.open);
  }, [modalProps.open]);

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
      width={800}
      title={t('summary.EditAnnouncement')}
      okText={t('button.Save')}
      confirmLoading={updateMutation.isPending}
      onCancel={() => onRequestClose()}
      onOk={() => {
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
      destroyOnHidden
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="sm">
        <Form layout="vertical">
          <Form.Item label={t('summary.AnnouncementEnabled')}>
            <Switch checked={enabled} onChange={setEnabled} />
          </Form.Item>
          <Form.Item
            label={t('summary.AnnouncementMessage')}
            help={t('summary.AnnouncementMarkdownHelp')}
            style={{ marginBottom: 0 }}
          >
            <BAICodeEditor
              language="markdown"
              editable
              value={message}
              onChange={setMessage}
              lineWrapping
              height={240}
            />
          </Form.Item>
        </Form>
        {message ? (
          <BAIFlex direction="column" align="stretch" gap="xxs">
            <Typography.Text type="secondary">
              {t('summary.AnnouncementPreview')}
            </Typography.Text>
            <div
              style={{
                border: `1px solid ${token.colorBorder}`,
                borderRadius: token.borderRadius,
                padding: token.padding,
              }}
            >
              <div style={{ marginBottom: token.marginSM * -1 }}>
                <Markdown
                  options={{
                    overrides: {
                      p: {
                        props: {
                          style: {
                            marginTop: 0,
                            marginBottom: token.marginSM,
                          },
                        },
                      },
                    },
                  }}
                >
                  {/* add dummy <p> to remove unnecessary margin bottom  */}
                  {message + '<p></p>'}
                </Markdown>
              </div>
            </div>
          </BAIFlex>
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default AnnouncementEditModal;
