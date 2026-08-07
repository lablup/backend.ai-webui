/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 17 harness entry — Sessions-area before/after visual gate.
 Mounts react/src/pages/AstryxSessionProbeCases against a mock Relay
 environment, wrapped in the brand Astryx Theme (light/dark via ?mode=).

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5635
   -> http://127.0.0.1:5635/theme-probe/sessions.html?case=tags&mode=light
*/
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import '../src/index.css';
import AstryxSessionProbeCases from '../src/pages/AstryxSessionProbeCases';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BAIClientProvider } from 'backend.ai-ui';
import i18next from 'i18next';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const caseName = params.get('case') ?? 'tags';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

const now = Date.now();
const SESSIONS: Record<string, Record<string, unknown>> = {
  running: {
    status: 'RUNNING',
    status_info: '',
    status_data: '{}',
    queue_position: null,
    created_at: new Date(now - 3600_000).toISOString(),
    starts_at: new Date(now - 3500_000).toISOString(),
    terminated_at: null,
    idle_checks: JSON.stringify({
      network_timeout: {
        extra: null,
        remaining: 5400,
        remaining_time_type: 'expire_after',
      },
      session_lifetime: {
        extra: null,
        remaining: 86000,
        remaining_time_type: 'grace_period',
      },
    }),
  },
  pending: {
    status: 'PENDING',
    status_info: '',
    status_data: '{}',
    queue_position: 2,
    created_at: new Date(now - 60_000).toISOString(),
  },
  error: {
    status: 'CANCELLED',
    status_info: 'failed-to-start',
    status_data: JSON.stringify({
      scheduler: {
        retries: 3,
        last_try: new Date(now - 120_000).toISOString(),
        failed_predicates: [
          { name: 'concurrency', msg: 'You cannot run more than 5 sessions' },
        ],
        passed_predicates: [{ name: 'reserved_time', msg: '' }],
      },
    }),
    queue_position: null,
    created_at: new Date(now - 240_000).toISOString(),
    name: 'probe-session-error',
    row_id: 'a1b2c3d4-0000-4000-8000-1234567890ab',
  },
};

const environment = createMockEnvironment();
environment.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, {
    ComputeSessionNode: (ctx) => {
      const alias = ctx.alias ?? 'running';
      return SESSIONS[alias] ?? SESSIONS.running;
    },
  }),
);

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Theme theme={backendAiBrandTheme} mode={mode}>
      <QueryClientProvider client={queryClient}>
        <BAIClientProvider
          // The HTML inline stub (globalThis.backendaiclient) is enough for
          // the mounted components; BUI just needs the context present.
          clientPromise={Promise.resolve(
            (globalThis as any).backendaiclient,
          )}
          anonymousClientFactory={() => (globalThis as any).backendaiclient}
        >
          <RelayEnvironmentProvider environment={environment}>
          <div
            id="probe-stage"
            style={{
              minHeight: '100vh',
              padding: 24,
              backgroundColor: 'var(--color-background-body)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Suspense fallback={<div id="probe-loading">loading…</div>}>
              <AstryxSessionProbeCases caseName={caseName} />
            </Suspense>
          </div>
          </RelayEnvironmentProvider>
        </BAIClientProvider>
      </QueryClientProvider>
    </Theme>
  </React.StrictMode>,
);
