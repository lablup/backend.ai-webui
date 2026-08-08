/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 20 shot harness — real mount module. Loaded dynamically by
 `resources.tsx` AFTER the stub `globalThis.backendaiclient` is installed.
 Mounts the REAL Resources-area components (nothing re-created) against a
 `relay-test-utils` mock environment, using the app's own compiled query
 artifacts (`__generated__/*.graphql.ts`) — no probe-only queries, so the
 relay-compiler output is untouched.

   ?case=agent          AgentDetailDrawer (open) — MetadataList, TabList+Tab,
                         BAICopyableText, ButtonGroup+IconButton, Grid
   ?case=resourceGroup  ResourceGroupInfoModal (open) — MetadataList x3, Badge
*/
import en from '../../resources/i18n/en.json';
import {
  ResourcesProbeAgent,
  ResourcesProbeResourceGroup,
} from '../src/diagnostics/ResourcesAstryxProbe';
import '../src/index.css';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import { BAIClientProvider } from 'backend.ai-ui';
import i18next from 'i18next';
import { NuqsAdapter } from 'nuqs/adapters/react';
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
const which = params.get('case') ?? 'agent';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// ---------------------------------------------------------------------------
// Relay mock environment.
// ---------------------------------------------------------------------------
const environment = createMockEnvironment();
const MOCK_RESOLVERS = {
  AgentNode: () => ({
    id: btoa('AgentNode:i-agent-001'),
    row_id: 'i-agent-001',
    addr: 'tcp://10.0.1.24:6001',
    status: 'ALIVE',
    status_changed: '2026-08-07T02:00:00+00:00',
    schedulable: true,
    first_contact: '2026-07-01T09:12:00+00:00',
    region: 'aws/ap-northeast-2',
    scaling_group: 'default',
    version: '25.9.0',
    architecture: 'x86_64',
    available_slots: JSON.stringify({
      cpu: '64',
      mem: '274877906944',
      'cuda.device': '8',
    }),
    occupied_slots: JSON.stringify({
      cpu: '16',
      mem: '68719476736',
      'cuda.device': '2',
    }),
    compute_plugins: JSON.stringify({
      cuda: { cuda_version: '12.2', version: '23.09.1' },
    }),
    // `UUIDFloatMap` (schema.graphql) — delivered as a parsed map, not a
    // JSON string (AgentResources reads it directly as Record<string,number>).
    gpu_alloc_map: { 'cuda:0': 1, 'cuda:1': 0.5 },
    live_stat: JSON.stringify({
      node: {
        cpu_util: { pct: 45 },
        mem: { current: 68719476736, capacity: 274877906944, pct: 25 },
        net_rx: { current: 1048576 },
        net_tx: { current: 524288 },
      },
      devices: {
        cpu_util: { '0': { pct: 40 }, '1': { pct: 50 } },
      },
    }),
  }),
  ScalingGroup: () => ({
    name: 'default',
    description: 'Default resource group for on-prem GPU nodes.',
    is_active: true,
    is_public: true,
    driver: 'static',
    driver_opts: JSON.stringify({}),
    scheduler: 'drf',
    scheduler_opts: JSON.stringify({
      allowed_session_types: ['batch', 'interactive'],
      pending_timeout: 3600,
      config: { num_retries_to_skip: 2 },
    }),
    wsproxy_addr: 'http://localhost:10200',
  }),
};
for (let i = 0; i < 30; i += 1) {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, MOCK_RESOLVERS),
  );
}

const cases: Record<string, React.ReactNode> = {
  agent: <ResourcesProbeAgent />,
  resourceGroup: <ResourcesProbeResourceGroup />,
};

document.body.style.background = isDark ? '#141414' : '#ffffff';
document.body.style.padding = '16px';

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={environment}>
    <QueryClientProvider client={new QueryClient()}>
      <NuqsAdapter>
        {/* Both mode switches, explicitly: antd (frontier components inside
            the area, e.g. BAIModal/BAIDrawer-adjacent chrome) and Astryx
            (converted components). */}
        <ConfigProvider
          theme={{
            algorithm: isDark
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          }}
        >
          <App>
            <Theme
              theme={backendAiBrandTheme}
              mode={isDark ? 'dark' : 'light'}
            >
              <BAIClientProvider
                clientPromise={Promise.resolve(
                  (globalThis as any).backendaiclient,
                )}
                anonymousClientFactory={() =>
                  (globalThis as any).backendaiclient
                }
              >
                <Suspense>{cases[which] ?? cases.agent}</Suspense>
              </BAIClientProvider>
            </Theme>
          </App>
        </ConfigProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  </RelayEnvironmentProvider>,
);
