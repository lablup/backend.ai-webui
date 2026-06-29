/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import {
  ANNOUNCEMENT_QUERY_KEY,
  useSuspenseGetAnnouncement,
} from '../hooks/useSuspenseGetAnnouncement';
import BAICodeEditor from './BAICodeEditor';
import { useQueryClient } from '@tanstack/react-query';
import { App, Form, FormInstance, Skeleton, Switch, theme } from 'antd';
import { createStyles } from 'antd-style';
import {
  BAIModal,
  BAIModalProps,
  BAIFlex,
  useErrorMessageResolver,
  useBAILogger,
} from 'backend.ai-ui';
import Markdown from 'markdown-to-jsx';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css }) => ({
  // Collapse the first/last block margins so the preview sits flush with the
  // box padding, keeping top/bottom spacing equal to left/right.
  markdownPreview: css`
    & > *:first-child {
      margin-top: 0;
    }
    & > *:last-child {
      margin-bottom: 0;
    }
  `,
}));

// Height of the markdown editor. The modal is sized like the file browser, so
// the editor and preview get plenty of vertical room. The preview box matches
// the editor's outer height (this value + the editor wrapper's 1px border).
const EDITOR_HEIGHT = '78vh';

interface AnnouncementFormValues {
  enabled: boolean;
  message: string;
}

interface AnnouncementEditModalProps extends BAIModalProps {
  onRequestClose: (success?: boolean) => void;
}

const AnnouncementEditModal: React.FC<AnnouncementEditModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message: appMessage } = App.useApp();
  const { logger } = useBAILogger();
  const { getErrorMessage } = useErrorMessageResolver();

  const baiClient = useSuspendedBackendaiClient();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<AnnouncementFormValues>();

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
      <Suspense fallback={<Skeleton active />}>
        <AnnouncementEditModalFields form={form} />
      </Suspense>
    </BAIModal>
  );
};

const AnnouncementEditModalFields: React.FC<{
  form: FormInstance<AnnouncementFormValues>;
}> = ({ form }) => {
  'use memo';

  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { styles } = useStyles();

  // The modal owns its data: fetch the current announcement directly so the
  // form reflects the server state without prop-drilling from the parent.
  const { data: announcement } = useSuspenseGetAnnouncement();
  const enabled =
    Form.useWatch('enabled', form) ?? announcement.enabled ?? true;
  const message = Form.useWatch('message', form) ?? '';

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        enabled: announcement.enabled ?? true,
        message: announcement.message ?? '',
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
                  // The backend rejects enabling an announcement with an empty
                  // message ("Empty message not allowed to enable
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
              className={styles.markdownPreview}
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
              <Markdown>{message}</Markdown>
            </div>
          </Form.Item>
        </BAIFlex>
      </BAIFlex>
    </Form>
  );
};

export default AnnouncementEditModal;
