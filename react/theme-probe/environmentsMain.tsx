/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 19 shot harness — real mount module. Loaded dynamically by
 `environments.tsx` AFTER the stub `globalThis.backendaiclient` is installed
 (module-level `backendaiClientPromise` in ../src/hooks reads it at import).

 The Relay layer runs against `relay-test-utils`' mock environment with
 queued `MockPayloadGenerator` resolvers, using the app's own compiled query
 artifacts — no probe-only queries, so the relay-compiler output is untouched.
*/
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import '../src/index.css';
import EnvironmentPage from '../src/pages/EnvironmentPage';
import MyEnvironmentPage from '../src/pages/MyEnvironmentPage';
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
import { BrowserRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'images';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// ---------------------------------------------------------------------------
// Relay mock data — deterministic rows for the three Environments tabs and
// the My Environment (customized images) page.
// ---------------------------------------------------------------------------
const IMAGE_ROWS = [
  {
    id: 'img-0001',
    name: 'multiarch/python',
    humanized_name: 'multiarch/python',
    tag: '3.9-ubuntu20.04',
    registry: 'cr.backend.ai',
    architecture: 'x86_64',
    digest:
      'sha256:8f4e5c2b7d1a9e3f6c0b5a8d2e7f4c1b9a6d3e0f7c2b5a8d1e4f7c0b3a6d9e2f',
    installed: true,
    labels: [
      {
        key: 'ai.backend.service-ports',
        value: 'jupyter:http:8090,vscode:http:8180',
      },
      { key: 'ai.backend.resource.preferred.shmem', value: '64m' },
    ],
    resource_limits: [
      { key: 'cpu', min: '1', max: null },
      { key: 'mem', min: '1g', max: null },
      { key: 'cuda.device', min: '0', max: null },
    ],
    namespace: 'multiarch/python',
    base_image_name: 'ubuntu',
    tags: [
      { key: 'ubuntu', value: '20.04' },
      { key: 'py', value: '3.9' },
    ],
    version: '3.9',
  },
  {
    id: 'img-0002',
    name: 'multiarch/ftl',
    humanized_name: 'multiarch/ftl',
    tag: '24.03-ubuntu22.04',
    registry: 'cr.backend.ai',
    architecture: 'aarch64',
    digest:
      'sha256:1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    installed: false,
    labels: [{ key: 'ai.backend.service-ports', value: 'jupyter:http:8090' }],
    resource_limits: [
      { key: 'cpu', min: '2', max: null },
      { key: 'mem', min: '2g', max: null },
    ],
    namespace: 'multiarch/ftl',
    base_image_name: 'ubuntu',
    tags: [{ key: 'ubuntu', value: '22.04' }],
    version: '24.03',
  },
  {
    id: 'img-0003',
    name: 'stable/ngc-pytorch',
    humanized_name: 'stable/ngc-pytorch',
    tag: '23.07-pytorch2.0',
    registry: 'cr.backend.ai',
    architecture: 'x86_64',
    digest:
      'sha256:9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    installed: true,
    labels: [
      { key: 'ai.backend.customized-image.name', value: 'my-fine-tune' },
    ],
    resource_limits: [
      { key: 'cpu', min: '4', max: null },
      { key: 'mem', min: '8g', max: null },
      { key: 'cuda.device', min: '1', max: null },
    ],
    namespace: 'stable/ngc-pytorch',
    base_image_name: 'pytorch',
    tags: [
      { key: 'pytorch', value: '2.0' },
      { key: 'customized_a1b2c3', value: 'hash' },
    ],
    version: '23.07',
  },
];

const CUSTOMIZED_IMAGE_ROWS = IMAGE_ROWS.map((row, i) => ({
  ...row,
  id: `cimg-000${i + 1}`,
  tag: `${row.tag}-customized_a1b2c3`,
  labels: [
    ...row.labels,
    { key: 'ai.backend.customized-image.name', value: `probe-image-${i + 1}` },
  ],
  supported_accelerators: 'cuda',
}));

const REGISTRY_ROWS = [
  {
    id: 'reg-0001',
    row_id: 'reg-row-0001',
    registry_name: 'cr.backend.ai',
    name: 'cr.backend.ai',
    url: 'https://cr.backend.ai',
    type: 'harbor2',
    project: 'stable',
    username: 'probe-admin',
    password: null,
    ssl_verify: true,
    extra: null,
    is_global: true,
  },
  {
    id: 'reg-0002',
    row_id: 'reg-row-0002',
    registry_name: 'docker.io',
    name: 'docker.io',
    url: 'https://registry-1.docker.io',
    type: 'docker',
    project: 'library',
    username: null,
    password: null,
    ssl_verify: true,
    extra: null,
    is_global: true,
  },
];

const PRESET_ROWS = [
  {
    id: 'preset-0001',
    name: 'cpu-small',
    resource_slots: JSON.stringify({ cpu: '4', mem: '8589934592' }),
    shared_memory: '1073741824',
    scaling_group_name: 'default',
  },
  {
    id: 'preset-0002',
    name: 'gpu-large',
    resource_slots: JSON.stringify({
      cpu: '16',
      mem: '68719476736',
      'cuda.device': '2',
    }),
    shared_memory: null,
    scaling_group_name: null,
  },
];

const environment = createMockEnvironment();
const MOCK_RESOLVERS = {
  Query: () => ({
    customized_images: CUSTOMIZED_IMAGE_ROWS,
    resource_presets: PRESET_ROWS,
    domain: {
      name: 'default',
      allowed_docker_registries: ['cr.backend.ai'],
    },
  }),
  ImageConnection: () => ({
    count: IMAGE_ROWS.length,
    edges: IMAGE_ROWS.map((node) => ({ node })),
  }),
  ContainerRegistryConnection: () => ({
    count: REGISTRY_ROWS.length,
    edges: REGISTRY_ROWS.map((node) => ({ node })),
  }),
};
for (let i = 0; i < 40; i += 1) {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, MOCK_RESOLVERS),
  );
}

const cases: Record<string, React.ReactNode> = {
  images: <EnvironmentPage />,
  presets: <EnvironmentPage />,
  registries: <EnvironmentPage />,
  customized: <MyEnvironmentPage />,
};

document.body.style.background = isDark ? '#141414' : '#ffffff';
document.body.style.padding = '16px';

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={environment}>
    <QueryClientProvider client={new QueryClient()}>
      <BrowserRouter>
        <NuqsAdapter>
          {/* Both mode switches, explicitly: antd (frontier components inside
              the area) and Astryx (converted components). */}
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
                  <Suspense>{cases[which] ?? cases.images}</Suspense>
                </BAIClientProvider>
              </Theme>
            </App>
          </ConfigProvider>
        </NuqsAdapter>
      </BrowserRouter>
    </QueryClientProvider>
  </RelayEnvironmentProvider>,
);
