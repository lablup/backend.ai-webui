/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { ANNOUNCEMENT_QUERY_KEY } from '../hooks/useAnnouncement';
import AnnouncementMarkdown from './AnnouncementMarkdown';
import BAICodeEditor from './BAICodeEditor';
import { useQueryClient } from '@tanstack/react-query';
import { App, Form, Switch, theme } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface AnnouncementFormValues {
  enabled: boolean;
  message: string;
}

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
  initialMessage?: string;
  initialEnabled?: boolean;
}

// Height of the markdown editor. The modal is sized like the file browser, so
// the editor and preview get plenty of vertical room. The preview box matches
// the editor's outer height (this value + the editor wrapper's 1px border).
const EDITOR_HEIGHT = '78vh';

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  initialMessage,
  initialEnabled,
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

  const [form] = Form.useForm<AnnouncementFormValues>();
  // Drive the live preview and the message field's required marker off the
  // form store so there is a single source of truth (no parallel useState).
  const enabled = Form.useWatch('enabled', form) ?? initialEnabled ?? true;
  const message = Form.useWatch('message', form) ?? '';

  const updateMutation = useTanMutation({
    mutationFn: (values: AnnouncementFormValues) => {
      return baiClient.service.update_announcement(
        values.enabled,
        values.message,
      );
    },
  });

  return (
    <BAIModal
      width="90%"
      style={{ maxWidth: 1900 }}
      title={t('summary.EditAnnouncement')}
      okText={t('button.Save')}
      confirmLoading={updateMutation.isPending}
      onCancel={() => onRequestClose()}
      onOk={async () => {
        let values: AnnouncementFormValues;
        try {
          values = await form.validateFields();
        } catch {
          // Validation errors are shown inline on the fields.
          return;
        }
        updateMutation.mutate(values, {
          onSuccess: () => {
            appMessage.success(t('summary.AnnouncementUpdated'));
            queryClient.invalidateQueries({
              queryKey: ANNOUNCEMENT_QUERY_KEY,
            });
            onRequestClose(true);
          },
          onError: (error) => {
            appMessage.error(getErrorMessage(error));
            logger.error(error);
          },
        });
      }}
      {...modalProps}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          enabled: initialEnabled ?? true,
          message: initialMessage ?? '',
        }}
      >
        <BAIFlex direction="column" align="stretch" gap="sm">
          <Form.Item
            label={t('summary.AnnouncementEnabled')}
            name="enabled"
            valuePropName="checked"
            required
            style={{ marginBottom: 0 }}
          >
            <Switch />
          </Form.Item>
          <BAIFlex direction="row" align="stretch" gap="sm" wrap="wrap">
            <Form.Item
              label={t('summary.AnnouncementMessage')}
              name="message"
              required={enabled}
              dependencies={['enabled']}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    // The backend rejects enabling an announcement with an
                    // empty message ("Empty message not allowed to enable
                    // announcement"); enforce the same rule client-side.
                    if (getFieldValue('enabled') && !value?.trim()) {
                      return Promise.reject(
                        new Error(t('summary.AnnouncementMessageRequired')),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <BAICodeEditor
                language="markdown"
                editable
                lineWrapping
                height={EDITOR_HEIGHT}
              />
            </Form.Item>
            <Form.Item
              label={t('summary.AnnouncementPreview')}
              required
              style={{ flex: 1, minWidth: 0, marginBottom: 0 }}
            >
              <div
                style={{
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  padding: token.padding,
                  // Match the editor's outer height (its inner height + the
                  // editor wrapper's 1px top/bottom border).
                  height: `calc(${EDITOR_HEIGHT} + 2px)`,
                  boxSizing: 'border-box',
                  overflow: 'auto',
                }}
              >
                <AnnouncementMarkdown>{message}</AnnouncementMarkdown>
              </div>
            </Form.Item>
          </BAIFlex>
        </BAIFlex>
      </Form>
    </BAIModal>
  );
};

export default AnnouncementEditModal;
