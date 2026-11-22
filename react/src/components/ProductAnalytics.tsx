/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Build flag, domainConfig.analytics and privacy defaults: docs/adr/0036-opt-in-posthog-analytics-build.md
import { getActAsTarget } from '../helper/actAs';
import type { UserRole } from '../helper/userRole';
import { useMyAppConfig } from '../hooks/useAppConfig';
import { LogLevel, useBAILogger } from 'backend.ai-ui';
import posthog, { type CaptureResult, type Properties } from 'posthog-js';
import { useEffect, useEffectEvent } from 'react';

const URL_PROPERTY_KEYS = [
  '$current_url',
  '$referrer',
  '$initial_current_url',
  '$initial_referrer',
  '$session_entry_url',
  '$session_entry_referrer',
  '$external_click_url',
];
const EXCEPTION_DEDUPE_WINDOW_MS = 5 * 60 * 1000;

let isStarted = false;
const lastExceptionSentAt = new Map<string, number>();

const stripUrlQueryAndHash = (properties?: Properties) => {
  if (!properties) return;
  for (const key of URL_PROPERTY_KEYS) {
    const value = properties[key];
    if (typeof value === 'string') {
      properties[key] = value.split(/[?#]/)[0];
    }
  }
  for (const [key, value] of Object.entries(properties)) {
    if (/^\$web_vitals_.+_event$/.test(key) && value) {
      stripUrlQueryAndHash(value);
    }
  }
};

const isDuplicateException = (event: CaptureResult) => {
  const exceptions: Array<{
    type?: string;
    value?: string;
    stacktrace?: {
      frames?: Array<{ filename?: string; lineno?: number; colno?: number }>;
    };
  }> = event.properties.$exception_list ?? [];
  const key = JSON.stringify(
    exceptions.map((exception) => [
      exception.type,
      exception.value,
      exception.stacktrace?.frames?.map(
        (frame) => `${frame.filename}:${frame.lineno}:${frame.colno}`,
      ),
    ]),
  );
  const now = Date.now();
  for (const [sentKey, sentAt] of lastExceptionSentAt) {
    if (now - sentAt >= EXCEPTION_DEDUPE_WINDOW_MS) {
      lastExceptionSentAt.delete(sentKey);
    }
  }
  const lastSentAt = lastExceptionSentAt.get(key);
  if (
    lastSentAt !== undefined &&
    now - lastSentAt < EXCEPTION_DEDUPE_WINDOW_MS
  ) {
    return true;
  }
  lastExceptionSentAt.set(key, now);
  return false;
};

const registerPlatform = () => {
  posthog.register({ platform: globalThis.isElectron ? 'electron' : 'web' });
};

// Account identifiers stay in the browser; only the role is registered (ADR 0036).
const syncUserRoleProperty = () => {
  const client = globalThis.backendaiclient;
  if (!client?.user_uuid) {
    posthog.unregister('role');
    return;
  }
  const role: UserRole = client.is_superadmin
    ? 'superadmin'
    : client.is_admin
      ? 'admin'
      : 'user';
  posthog.register({ role });
};

type AnalyticsConfig = {
  posthogKey?: unknown;
  posthogHost?: unknown;
};

const isHttpsUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const ProductAnalytics: React.FC = () => {
  'use memo';
  const { logger } = useBAILogger();
  const [analyticsConfig] = useMyAppConfig<AnalyticsConfig>(
    'domainConfig',
    'analytics',
  );
  const apiKey =
    typeof analyticsConfig?.posthogKey === 'string'
      ? analyticsConfig.posthogKey
      : undefined;
  const apiHost = isHttpsUrl(analyticsConfig?.posthogHost)
    ? analyticsConfig.posthogHost
    : undefined;

  const start = useEffectEvent(() => {
    if (isStarted || !apiKey || !apiHost || getActAsTarget()) return;
    isStarted = true;

    posthog.init(apiKey, {
      api_host: apiHost,
      persistence: 'localStorage',
      person_profiles: 'never',
      capture_pageview: 'history_change',
      capture_pageleave: true,
      autocapture: true,
      disable_capture_url_hashes: true,
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false,
      },
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*',
      },
      before_send: (event) => {
        if (event.event === '$exception' && isDuplicateException(event)) {
          return null;
        }
        stripUrlQueryAndHash(event.properties);
        stripUrlQueryAndHash(event.$set);
        stripUrlQueryAndHash(event.$set_once);
        return event;
      },
    });
    registerPlatform();

    logger.use({
      afterLog: (context) => {
        if (context.level !== LogLevel.ERROR) return;
        const error = context.args.find((arg) => arg instanceof Error);
        if (!error) return;
        const reported = new Error(error.message);
        reported.name = error.name;
        reported.stack = error.stack;
        posthog.captureException(reported, {
          logger_context: context.metadata?.context,
        });
      },
    });

    syncUserRoleProperty();
    document.addEventListener('backend-ai-connected', syncUserRoleProperty);
    document.addEventListener('backend-ai-logout', () => {
      posthog.reset();
      registerPlatform();
    });
  });

  useEffect(() => {
    start();
  }, [apiKey, apiHost]);

  return null;
};

export default ProductAnalytics;
