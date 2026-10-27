/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// Build flag, env vars and privacy defaults: docs/adr/0017-opt-in-posthog-analytics-build.md
import { LogLevel, useBAILogger } from 'backend.ai-ui';
import posthog, { type CaptureResult, type Properties } from 'posthog-js';
import { useEffect, useEffectEvent } from 'react';

const URL_PROPERTY_KEYS = [
  '$current_url',
  '$referrer',
  '$initial_current_url',
  '$initial_referrer',
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

const identifyCurrentUser = () => {
  const client = globalThis.backendaiclient;
  const userId: string | undefined = client?.user_uuid;
  if (!client || !userId) return;
  if (posthog._isIdentified() && posthog.get_distinct_id() !== userId) {
    posthog.reset();
  }
  posthog.identify(userId, {
    role: client.is_superadmin
      ? 'superadmin'
      : client.is_admin
        ? 'admin'
        : 'user',
    domain: client._config?.domainName,
  });
};

const ProductAnalytics: React.FC = () => {
  'use memo';
  const { logger } = useBAILogger();

  const start = useEffectEvent(() => {
    const apiKey = import.meta.env.VITE_POSTHOG_KEY;
    const apiHost = import.meta.env.VITE_POSTHOG_HOST;
    if (isStarted || !apiKey || !apiHost) return;
    isStarted = true;

    posthog.init(apiKey, {
      api_host: apiHost,
      persistence: 'localStorage',
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
    posthog.register({ platform: globalThis.isElectron ? 'electron' : 'web' });

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

    identifyCurrentUser();
    document.addEventListener('backend-ai-connected', identifyCurrentUser);
    document.addEventListener('backend-ai-logout', () => posthog.reset());
  });

  useEffect(() => {
    start();
  }, []);

  return null;
};

export default ProductAnalytics;
