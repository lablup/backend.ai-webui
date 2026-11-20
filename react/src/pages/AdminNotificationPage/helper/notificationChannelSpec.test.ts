/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_SMTP_PORT,
  DEFAULT_SMTP_TIMEOUT,
  buildNotificationChannelSpecInput,
} from './notificationChannelSpec';
import { describe, expect, it } from 'vitest';

describe('buildNotificationChannelSpecInput', () => {
  it('sends only the webhook branch, with the URL trimmed', () => {
    expect(
      buildNotificationChannelSpecInput({
        channelType: 'WEBHOOK',
        webhookUrl: '  https://hooks.example.com/abc  ',
        smtpHost: 'ignored.example.com',
      }),
    ).toEqual({ webhook: { url: 'https://hooks.example.com/abc' } });
  });

  it('fills the SMTP defaults and omits auth when no credentials are given', () => {
    expect(
      buildNotificationChannelSpecInput({
        channelType: 'EMAIL',
        smtpHost: 'smtp.example.com',
        fromEmail: 'noreply@example.com',
        toEmails: ['ops@example.com'],
      }),
    ).toEqual({
      email: {
        smtp: {
          host: 'smtp.example.com',
          port: DEFAULT_SMTP_PORT,
          useTls: true,
          timeout: DEFAULT_SMTP_TIMEOUT,
        },
        message: {
          fromEmail: 'noreply@example.com',
          toEmails: ['ops@example.com'],
          subjectTemplate: null,
        },
        auth: null,
      },
    });
  });

  it('dedupes and trims recipients and keeps the given SMTP settings', () => {
    const spec = buildNotificationChannelSpecInput({
      channelType: 'EMAIL',
      smtpHost: 'smtp.example.com',
      smtpPort: 465,
      smtpUseTls: false,
      smtpTimeout: 10,
      fromEmail: 'noreply@example.com',
      toEmails: [' a@example.com', 'a@example.com', '', 'b@example.com '],
      subjectTemplate: '  [{{ session_name }}] ended ',
    });
    expect(spec.email?.smtp).toEqual({
      host: 'smtp.example.com',
      port: 465,
      useTls: false,
      timeout: 10,
    });
    expect(spec.email?.message.toEmails).toEqual([
      'a@example.com',
      'b@example.com',
    ]);
    expect(spec.email?.message.subjectTemplate).toBe(
      '[{{ session_name }}] ended',
    );
  });

  it('sends auth when either the username or the password is set', () => {
    expect(
      buildNotificationChannelSpecInput({
        channelType: 'EMAIL',
        smtpHost: 'smtp.example.com',
        fromEmail: 'noreply@example.com',
        toEmails: ['ops@example.com'],
        smtpUsername: ' mailer ',
        smtpPassword: 's3cret',
      }).email?.auth,
    ).toEqual({ username: 'mailer', password: 's3cret' });
    expect(
      buildNotificationChannelSpecInput({
        channelType: 'EMAIL',
        smtpHost: 'smtp.example.com',
        fromEmail: 'noreply@example.com',
        toEmails: ['ops@example.com'],
        smtpPassword: 'only-password',
      }).email?.auth,
    ).toEqual({ username: null, password: 'only-password' });
  });
});
