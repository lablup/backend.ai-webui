/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  DEFAULT_SMTP_PORT,
  DEFAULT_SMTP_TIMEOUT,
  buildNotificationChannelSpecInput,
  isHttpUrl,
  decideSpecUpdate,
  specFormValuesFromSaved,
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

  it('sends auth only when both the username and the password are set', () => {
    const email = {
      channelType: 'EMAIL' as const,
      smtpHost: 'smtp.example.com',
      fromEmail: 'noreply@example.com',
      toEmails: ['ops@example.com'],
    };
    expect(
      buildNotificationChannelSpecInput({
        ...email,
        smtpUsername: ' mailer ',
        smtpPassword: 's3cret',
      }).email?.auth,
    ).toEqual({ username: 'mailer', password: 's3cret' });
    expect(
      buildNotificationChannelSpecInput({
        ...email,
        smtpPassword: 'only-password',
      }).email?.auth,
    ).toBeNull();
  });
});

describe('isHttpUrl', () => {
  it('accepts only absolute http and https URLs', () => {
    expect(isHttpUrl('https://hooks.slack.com/services/T/B/X')).toBe(true);
    expect(isHttpUrl('http://webhook:8080/hook')).toBe(true);
    expect(isHttpUrl('hooks.example.com/abc')).toBe(false);
    expect(isHttpUrl('ftp://example.com/x')).toBe(false);
  });
});

describe('specFormValuesFromSaved', () => {
  it('fills the email fields from a saved spec', () => {
    expect(
      specFormValuesFromSaved({
        smtp: {
          host: 'smtp.example.com',
          port: 465,
          useTls: false,
          timeout: 10,
        },
        message: {
          fromEmail: 'noreply@example.com',
          toEmails: ['ops@example.com'],
          subjectTemplate: null,
        },
        auth: { username: 'mailer' },
      }),
    ).toEqual({
      webhookUrl: undefined,
      smtpHost: 'smtp.example.com',
      smtpPort: 465,
      smtpUseTls: false,
      smtpTimeout: 10,
      smtpUsername: 'mailer',
      fromEmail: 'noreply@example.com',
      toEmails: ['ops@example.com'],
      subjectTemplate: undefined,
    });
  });

  it('fills only the URL from a saved webhook spec', () => {
    expect(
      specFormValuesFromSaved({ url: 'https://hooks.example.com/abc' }),
    ).toMatchObject({ webhookUrl: 'https://hooks.example.com/abc' });
  });
});

describe('decideSpecUpdate', () => {
  const email = ({
    host = 'smtp.example.com',
    username,
    password,
  }: {
    host?: string;
    username?: string;
    password?: string;
  }) => ({
    channelType: 'EMAIL' as const,
    smtpHost: host,
    fromEmail: 'noreply@example.com',
    toEmails: ['ops@example.com'],
    smtpUsername: username,
    smtpPassword: password,
  });

  it('leaves an unchanged connection out of the update', () => {
    expect(
      decideSpecUpdate({
        values: email({ username: 'mailer' }),
        savedValues: email({ username: 'mailer' }),
        hasSavedAuth: true,
      }),
    ).toEqual({ includesSpec: false, needsPassword: false });
  });

  it('asks for the password again when a connection with auth changes', () => {
    expect(
      decideSpecUpdate({
        values: email({ host: 'mail.example.com', username: 'mailer' }),
        savedValues: email({ username: 'mailer' }),
        hasSavedAuth: true,
      }),
    ).toEqual({ includesSpec: true, needsPassword: true });
  });

  it('asks for the password when only the username changes', () => {
    expect(
      decideSpecUpdate({
        values: email({ username: 'other' }),
        savedValues: email({ username: 'mailer' }),
        hasSavedAuth: true,
      }),
    ).toEqual({ includesSpec: true, needsPassword: true });
  });

  it('lets a cleared username remove authentication', () => {
    expect(
      decideSpecUpdate({
        values: email({}),
        savedValues: email({ username: 'mailer' }),
        hasSavedAuth: true,
      }),
    ).toEqual({ includesSpec: true, needsPassword: false });
  });

  it('sends the spec when only a new password is typed', () => {
    expect(
      decideSpecUpdate({
        values: email({ username: 'mailer', password: 'new' }),
        savedValues: email({ username: 'mailer' }),
        hasSavedAuth: true,
      }),
    ).toEqual({ includesSpec: true, needsPassword: false });
  });

  it('compares webhook URLs after trimming', () => {
    expect(
      decideSpecUpdate({
        values: {
          channelType: 'WEBHOOK',
          webhookUrl: ' https://a.example.com ',
        },
        savedValues: {
          channelType: 'WEBHOOK',
          webhookUrl: 'https://a.example.com',
        },
        hasSavedAuth: false,
      }).includesSpec,
    ).toBe(false);
  });
});
