/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  NotificationChannelSpecInput,
  NotificationChannelType,
} from '../../../__generated__/NotificationChannelSettingModalCreateMutation.graphql';
import * as _ from 'lodash-es';

export const NOTIFICATION_CHANNEL_TYPES: ReadonlyArray<NotificationChannelType> =
  ['WEBHOOK', 'EMAIL'];

export const DEFAULT_SMTP_PORT = 587;
// The manager's own default for SMTPConnectionInput.timeout, in seconds.
export const DEFAULT_SMTP_TIMEOUT = 30;

export type NotificationChannelSpecFormValues = {
  channelType: NotificationChannelType;
  webhookUrl?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUseTls?: boolean;
  smtpTimeout?: number;
  smtpUsername?: string;
  smtpPassword?: string;
  fromEmail?: string;
  toEmails?: string[];
  subjectTemplate?: string;
};

const trimmedOrNull = (value: string | undefined) => {
  const trimmed = _.trim(value ?? '');
  return trimmed ? trimmed : null;
};

/** Builds the one-of spec input the manager expects from the form values. */
export const buildNotificationChannelSpecInput = (
  values: NotificationChannelSpecFormValues,
): NotificationChannelSpecInput => {
  if (values.channelType === 'WEBHOOK') {
    return { webhook: { url: _.trim(values.webhookUrl ?? '') } };
  }
  const username = trimmedOrNull(values.smtpUsername);
  const password = values.smtpPassword ? values.smtpPassword : null;
  return {
    email: {
      smtp: {
        host: _.trim(values.smtpHost ?? ''),
        port: values.smtpPort ?? DEFAULT_SMTP_PORT,
        useTls: values.smtpUseTls ?? true,
        timeout: values.smtpTimeout ?? DEFAULT_SMTP_TIMEOUT,
      },
      message: {
        fromEmail: _.trim(values.fromEmail ?? ''),
        toEmails: _.uniq(
          _.filter(_.map(values.toEmails, _.trim), (email) => !!email),
        ),
        subjectTemplate: trimmedOrNull(values.subjectTemplate),
      },
      auth: username || password ? { username, password } : null,
    },
  };
};
