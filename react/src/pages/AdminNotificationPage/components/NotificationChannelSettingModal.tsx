/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { NotificationChannelSettingModalCreateMutation } from '../../../__generated__/NotificationChannelSettingModalCreateMutation.graphql';
import { NotificationChannelSettingModalFragment$key } from '../../../__generated__/NotificationChannelSettingModalFragment.graphql';
import { NotificationChannelSettingModalUpdateMutation } from '../../../__generated__/NotificationChannelSettingModalUpdateMutation.graphql';
import { App } from '../../../app-shim';
import { Form, FormInstance } from '../../../form-engine';
import {
  DEFAULT_SMTP_PORT,
  DEFAULT_SMTP_TIMEOUT,
  NOTIFICATION_CHANNEL_TYPES,
  NotificationChannelSpecFormValues,
  buildNotificationChannelSpecInput,
} from '../helper/notificationChannelSpec';
import './NotificationChannelSettingModal.css';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  BAINumberInput,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISwitch,
  BAITagsInput,
  BAITextArea,
  BAITextInput,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

type NotificationChannelFormValues = NotificationChannelSpecFormValues & {
  name: string;
  description?: string;
  enabled: boolean;
  replaceSpec?: boolean;
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
const ChannelSpecFormItems: React.FC = () => {
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
            type: 'url',
            message: t('externalNotification.WebhookUrlInvalid'),
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

const NotificationChannelSettingModal: React.FC<
  NotificationChannelSettingModalProps
> = ({ channelFrgmt, onRequestClose, ...baiModalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const formRef = useRef<FormInstance<NotificationChannelFormValues>>(null);

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
            id
            name
            description
            channelType
            enabled
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

  const handleOk = () =>
    formRef.current
      ?.validateFields()
      .then((values) => {
        const description = _.trim(values.description ?? '') || null;
        if (channel) {
          commitUpdate({
            variables: {
              input: {
                id: channel.entityId,
                name: _.trim(values.name),
                description,
                enabled: values.enabled,
                ...(values.replaceSpec
                  ? {
                      spec: buildNotificationChannelSpecInput({
                        ...values,
                        channelType: channel.channelType,
                      }),
                    }
                  : {}),
              },
            },
            onCompleted: (_res, errors) => handleResult(errors),
            onError: handleError,
          });
          return;
        }
        commitCreate({
          variables: {
            input: {
              name: _.trim(values.name),
              description,
              channelType: values.channelType,
              enabled: values.enabled,
              spec: buildNotificationChannelSpecInput(values),
            },
          },
          onCompleted: (_res, errors) => handleResult(errors),
          onError: handleError,
        });
      })
      .catch(() => {});

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
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          name: channel?.name,
          description: channel?.description ?? undefined,
          channelType: channel?.channelType ?? 'WEBHOOK',
          enabled: channel?.enabled ?? true,
          replaceSpec: false,
          smtpPort: DEFAULT_SMTP_PORT,
          smtpUseTls: true,
          smtpTimeout: DEFAULT_SMTP_TIMEOUT,
          toEmails: [],
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
        {channel ? (
          <>
            <Form.Item
              label={t('externalNotification.ReplaceConnectionSettings')}
              name="replaceSpec"
              extra={t('externalNotification.ReplaceConnectionSettingsExtra')}
            >
              <BAISwitch
                aria-label={t('externalNotification.ReplaceConnectionSettings')}
              />
            </Form.Item>
            <Form.Item dependencies={['replaceSpec']} noStyle>
              {({ getFieldValue }) =>
                getFieldValue('replaceSpec') ? (
                  <>
                    <BAIAlert
                      type="warning"
                      showIcon
                      className="notification-channel-alert"
                      description={t(
                        'externalNotification.ReplaceConnectionSettingsWarning',
                      )}
                    />
                    <ChannelSpecFormItems />
                  </>
                ) : null
              }
            </Form.Item>
          </>
        ) : (
          <ChannelSpecFormItems />
        )}
      </Form>
    </BAIModal>
  );
};

export default NotificationChannelSettingModal;
