/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationChannelSettingModalCreateMutation } from '../../../__generated__/NotificationChannelSettingModalCreateMutation.graphql';
import {
  NotificationChannelSettingModalFragment$data,
  NotificationChannelSettingModalFragment$key,
} from '../../../__generated__/NotificationChannelSettingModalFragment.graphql';
import { NotificationChannelSettingModalSpecQuery } from '../../../__generated__/NotificationChannelSettingModalSpecQuery.graphql';
import { NotificationChannelSettingModalUpdateMutation } from '../../../__generated__/NotificationChannelSettingModalUpdateMutation.graphql';
import { App } from '../../../app-shim';
import BAIErrorBoundary from '../../../components/BAIErrorBoundary';
import { Form, FormInstance } from '../../../form-engine';
import {
  DEFAULT_SMTP_PORT,
  DEFAULT_SMTP_TIMEOUT,
  NOTIFICATION_CHANNEL_TYPES,
  NotificationChannelSpecFormValues,
  buildNotificationChannelSpecInput,
  isHttpUrl,
  decideSpecUpdate,
  specFormValuesFromSaved,
} from '../helper/notificationChannelSpec';
import './NotificationChannelSettingModal.css';
import {
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAINumberInput,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISkeleton,
  BAISwitch,
  BAITagsInput,
  BAITextArea,
  BAITextInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  graphql,
  useFragment,
  useLazyLoadQuery,
  useMutation,
} from 'react-relay';

type NotificationChannelFormValues = NotificationChannelSpecFormValues & {
  name: string;
  description?: string;
  enabled: boolean;
};

interface NotificationChannelSettingModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel'
> {
  channelFrgmt?: NotificationChannelSettingModalFragment$key | null;
  onRequestClose: (success?: boolean) => void;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Mounted inside the Form, so the watches are fresh on every open.
const ChannelSpecFormItems: React.FC<{ hasSavedPassword: boolean }> = ({
  hasSavedPassword,
}) => {
  'use memo';
  const { t } = useTranslation();
  const form = Form.useFormInstance<NotificationChannelFormValues>();
  const channelType = Form.useWatch('channelType', form);

  if (!channelType) return null;
  if (channelType === 'WEBHOOK') {
    return (
      <Form.Item
        label={t('externalNotification.WebhookUrl')}
        name="webhookUrl"
        extra={t('externalNotification.WebhookUrlExtra')}
        rules={[
          {
            required: true,
            message: t('externalNotification.WebhookUrlRequired'),
          },
          {
            validator: async (_rule, value?: string) => {
              if (!value?.trim() || isHttpUrl(value.trim())) return;
              throw new Error(t('externalNotification.WebhookUrlInvalid'));
            },
          },
        ]}
      >
        <BAITextInput
          aria-label={t('externalNotification.WebhookUrl')}
          placeholder="https://hooks.example.com/..."
        />
      </Form.Item>
    );
  }

  return (
    <>
      <BAIFlex gap="sm" align="start">
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpHost')}
          name="smtpHost"
          rules={[
            {
              required: true,
              whitespace: true,
              message: t('externalNotification.SmtpHostRequired'),
            },
          ]}
        >
          <BAITextInput
            aria-label={t('externalNotification.SmtpHost')}
            placeholder="smtp.example.com"
          />
        </Form.Item>
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpPort')}
          name="smtpPort"
          rules={[{ required: true }]}
        >
          <BAINumberInput
            aria-label={t('externalNotification.SmtpPort')}
            width="100%"
            hasClear={false}
            min={1}
            max={65535}
            isIntegerOnly
          />
        </Form.Item>
      </BAIFlex>
      <BAIFlex gap="sm" align="start">
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpUseTls')}
          name="smtpUseTls"
        >
          <BAISwitch aria-label={t('externalNotification.SmtpUseTls')} />
        </Form.Item>
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpTimeout')}
          name="smtpTimeout"
          rules={[{ required: true }]}
        >
          <BAINumberInput
            aria-label={t('externalNotification.SmtpTimeout')}
            width="100%"
            hasClear={false}
            min={1}
            isIntegerOnly
            units={t('externalNotification.Seconds')}
          />
        </Form.Item>
      </BAIFlex>
      <BAIFlex gap="sm" align="start">
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpUsername')}
          name="smtpUsername"
          dependencies={['smtpPassword']}
          rules={[
            ({ getFieldValue }) => ({
              validator: async (_rule, value?: string) => {
                if (value?.trim() || !getFieldValue('smtpPassword')) return;
                throw new Error(
                  t('externalNotification.SmtpUsernameRequiredWithPassword'),
                );
              },
            }),
          ]}
        >
          <BAITextInput
            aria-label={t('externalNotification.SmtpUsername')}
            autoComplete="off"
          />
        </Form.Item>
        <Form.Item
          className="notification-channel-field"
          label={t('externalNotification.SmtpPassword')}
          name="smtpPassword"
          dependencies={['smtpUsername']}
          rules={[
            ({ getFieldValue }) => ({
              validator: async (_rule, value?: string) => {
                // Left empty with a saved password, the save asks for it only when needed.
                if (value || hasSavedPassword) return;
                if (!getFieldValue('smtpUsername')?.trim()) return;
                throw new Error(
                  t('externalNotification.SmtpPasswordRequiredWithUsername'),
                );
              },
            }),
          ]}
        >
          <BAITextInput
            type="password"
            aria-label={t('externalNotification.SmtpPassword')}
            autoComplete="new-password"
          />
        </Form.Item>
      </BAIFlex>
      <Form.Item
        label={t('externalNotification.FromEmail')}
        name="fromEmail"
        rules={[
          {
            required: true,
            message: t('externalNotification.FromEmailRequired'),
          },
          { type: 'email', message: t('externalNotification.EmailInvalid') },
        ]}
      >
        <BAITextInput
          aria-label={t('externalNotification.FromEmail')}
          placeholder="noreply@example.com"
        />
      </Form.Item>
      <Form.Item
        label={t('externalNotification.ToEmails')}
        name="toEmails"
        extra={t('externalNotification.ToEmailsExtra')}
        rules={[
          {
            validator: (_rule, value?: string[]) => {
              const emails = _.filter(value, (email) => !!_.trim(email));
              if (_.isEmpty(emails)) {
                return Promise.reject(
                  t('externalNotification.ToEmailsRequired'),
                );
              }
              const invalid = _.find(emails, (email) => !isEmail(email));
              return invalid
                ? Promise.reject(
                    t('externalNotification.EmailInvalidWithValue', {
                      email: invalid,
                    }),
                  )
                : Promise.resolve();
            },
          },
        ]}
      >
        <BAITagsInput
          tokenSeparators={[',', ' ']}
          aria-label={t('externalNotification.ToEmails')}
        />
      </Form.Item>
      <Form.Item
        label={t('externalNotification.SubjectTemplate')}
        name="subjectTemplate"
        extra={t('externalNotification.SubjectTemplateExtra')}
      >
        <BAITextInput aria-label={t('externalNotification.SubjectTemplate')} />
      </Form.Item>
    </>
  );
};

type SavedSpec = {
  values: Partial<NotificationChannelSpecFormValues>;
  hasSavedAuth: boolean;
};

type ChannelFormProps = {
  channel: NotificationChannelSettingModalFragment$data | null;
  formRef: React.RefObject<FormInstance<NotificationChannelFormValues> | null>;
  savedSpecRef: React.RefObject<SavedSpec | null>;
};

const ChannelForm: React.FC<
  ChannelFormProps & { savedSpec: SavedSpec | null }
> = ({ channel, formRef, savedSpecRef, savedSpec }) => {
  'use memo';
  const { t } = useTranslation();
  useEffect(() => {
    savedSpecRef.current = savedSpec;
  }, [savedSpec, savedSpecRef]);
  return (
    <Form
      ref={formRef}
      layout="vertical"
      initialValues={{
        name: channel?.name,
        description: channel?.description ?? undefined,
        channelType: channel?.channelType ?? 'WEBHOOK',
        enabled: channel?.enabled ?? true,
        smtpPort: DEFAULT_SMTP_PORT,
        smtpUseTls: true,
        smtpTimeout: DEFAULT_SMTP_TIMEOUT,
        toEmails: [],
        ..._.omitBy(savedSpec?.values ?? {}, _.isUndefined),
      }}
    >
      <Form.Item
        label={t('externalNotification.Name')}
        name="name"
        rules={[
          {
            required: true,
            whitespace: true,
            message: t('externalNotification.NameRequired'),
          },
          { max: 256 },
        ]}
      >
        <BAITextInput aria-label={t('externalNotification.Name')} />
      </Form.Item>
      <Form.Item
        label={t('externalNotification.Description')}
        name="description"
      >
        <BAITextArea
          aria-label={t('externalNotification.Description')}
          rows={2}
        />
      </Form.Item>
      <Form.Item
        label={t('externalNotification.ChannelType')}
        name="channelType"
      >
        <BAISegmentedControl
          aria-label={t('externalNotification.ChannelType')}
          disabled={!!channel}
        >
          {_.map(NOTIFICATION_CHANNEL_TYPES, (channelType) => (
            <BAISegmentedControlItem
              key={channelType}
              value={channelType}
              label={t(`externalNotification.channelTypes.${channelType}`)}
            />
          ))}
        </BAISegmentedControl>
      </Form.Item>
      <Form.Item label={t('externalNotification.Enabled')} name="enabled">
        <BAISwitch aria-label={t('externalNotification.Enabled')} />
      </Form.Item>
      <ChannelSpecFormItems hasSavedPassword={!!savedSpec?.hasSavedAuth} />
    </Form>
  );
};

/** Reads the saved spec only when a channel is edited, so the list never carries it. */
const EditChannelForm: React.FC<
  ChannelFormProps & { channel: NotificationChannelSettingModalFragment$data }
> = (props) => {
  'use memo';
  const { adminNotificationChannel } =
    useLazyLoadQuery<NotificationChannelSettingModalSpecQuery>(
      graphql`
        query NotificationChannelSettingModalSpecQuery($id: ID!) {
          adminNotificationChannel(id: $id) {
            spec {
              ... on WebhookSpec {
                url
              }
              ... on EmailSpec {
                smtp {
                  host
                  port
                  useTls
                  timeout
                }
                message {
                  fromEmail
                  toEmails
                  subjectTemplate
                }
                auth {
                  username
                }
              }
            }
          }
        }
      `,
      { id: props.channel.entityId },
      { fetchPolicy: 'network-only' },
    );
  const spec = adminNotificationChannel?.spec;
  return (
    <ChannelForm
      {...props}
      savedSpec={{
        values: specFormValuesFromSaved(spec),
        hasSavedAuth:
          props.channel.channelType === 'EMAIL' &&
          !!spec &&
          'auth' in spec &&
          !!spec.auth,
      }}
    />
  );
};

const NotificationChannelSettingModal: React.FC<
  NotificationChannelSettingModalProps
> = ({ channelFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<NotificationChannelFormValues>>(null);
  const savedSpecRef = useRef<SavedSpec | null>(null);

  const channel = useFragment(
    graphql`
      fragment NotificationChannelSettingModalFragment on NotificationChannel {
        id
        entityId
        name
        description
        channelType
        enabled
      }
    `,
    channelFrgmt ?? null,
  );

  const [commitCreate, isInFlightCreate] =
    useMutation<NotificationChannelSettingModalCreateMutation>(graphql`
      mutation NotificationChannelSettingModalCreateMutation(
        $input: CreateNotificationChannelInput!
      ) {
        adminCreateNotificationChannel(input: $input) {
          channel {
            id
            entityId
          }
        }
      }
    `);

  const [commitUpdate, isInFlightUpdate] =
    useMutation<NotificationChannelSettingModalUpdateMutation>(graphql`
      mutation NotificationChannelSettingModalUpdateMutation(
        $input: UpdateNotificationChannelInput!
      ) {
        updateNotificationChannel(input: $input) {
          channel {
            ...NotificationChannelSettingModalFragment
          }
        }
      }
    `);

  const handleResult = (errors: ReadonlyArray<{ message: string }> | null) => {
    if (errors && errors.length > 0) {
      message.error(errors[0]?.message || t('general.ErrorOccurred'));
      return;
    }
    message.success(t('externalNotification.ChannelSaved'));
    onRequestClose(true);
  };
  const handleError = (error: Error) => {
    message.error(error?.message || t('general.ErrorOccurred'));
  };

  const updateChannel = async () => {
    const form = formRef.current;
    if (!form || !channel) return;
    // The spec fields are validated only when the connection is sent.
    await form.validateFields(['name', 'description', 'enabled']);
    const values = form.getFieldsValue(true) as NotificationChannelFormValues;
    const formValues = { ...values, channelType: channel.channelType };
    const { includesSpec, needsPassword } = decideSpecUpdate({
      values: formValues,
      savedValues: {
        ...(savedSpecRef.current?.values ?? {}),
        channelType: channel.channelType,
      },
      hasSavedAuth: !!savedSpecRef.current?.hasSavedAuth,
    });
    if (includesSpec) await form.validateFields();
    if (needsPassword) {
      form.setFields([
        {
          name: 'smtpPassword',
          errors: [t('externalNotification.SmtpPasswordRequiredForChange')],
        },
      ]);
      form.scrollToField('smtpPassword', {
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }
    commitUpdate({
      variables: {
        input: {
          id: channel.entityId,
          name: _.trim(values.name),
          description: _.trim(values.description ?? '') || null,
          enabled: values.enabled,
          ...(includesSpec
            ? { spec: buildNotificationChannelSpecInput(formValues) }
            : {}),
        },
      },
      onCompleted: (_res, errors) => handleResult(errors),
      onError: handleError,
    });
  };

  const createChannel = async () => {
    const form = formRef.current;
    if (!form) return;
    const values = await form.validateFields();
    commitCreate({
      variables: {
        input: {
          name: _.trim(values.name),
          description: _.trim(values.description ?? '') || null,
          channelType: values.channelType,
          enabled: values.enabled,
          spec: buildNotificationChannelSpecInput(values),
        },
      },
      onCompleted: (_res, errors) => handleResult(errors),
      onError: handleError,
    });
  };

  const handleOk = () => {
    // A rejected validateFields is shown on the fields themselves.
    (channel ? updateChannel() : createChannel()).catch(_.noop);
  };

  return (
    <BAIModal
      {...baiModalProps}
      centered
      unmountOnClose
      title={
        channel
          ? t('externalNotification.EditChannel')
          : t('externalNotification.CreateChannel')
      }
      okText={channel ? t('button.Save') : t('button.Create')}
      confirmLoading={isInFlightCreate || isInFlightUpdate}
      onOk={handleOk}
      onCancel={() => onRequestClose(false)}
    >
      <BAIErrorBoundary>
        <Suspense fallback={<BAISkeleton rows={6} />}>
          {channel ? (
            <EditChannelForm
              channel={channel}
              formRef={formRef}
              savedSpecRef={savedSpecRef}
            />
          ) : (
            <ChannelForm
              channel={null}
              formRef={formRef}
              savedSpecRef={savedSpecRef}
              savedSpec={null}
            />
          )}
        </Suspense>
      </BAIErrorBoundary>
    </BAIModal>
  );
};

export default NotificationChannelSettingModal;
