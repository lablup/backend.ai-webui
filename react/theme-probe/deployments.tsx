/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 18 harness — mounts REAL Deployments-area components (nothing
 re-created here) with a relay-test-utils mock environment, so before/after
 shots compare the actual modules in light AND dark:

   ?case=revision  DeploymentRevisionDetail   (Descriptions → MetadataList)
   ?case=replica   ReplicaStatusTag           (antd Tag → Astryx Badge)
   ?case=drawer    DeploymentRevisionDetailDrawer (antd Drawer → lab Drawer)

   &theme=dark     dark mode — wraps in the brand <Theme mode="dark"> AND
                   antd ConfigProvider darkAlgorithm (for the antd "before"
                   state), mirroring how the app switches both layers.

 Serve (ticket 18 port policy — 5645-5654 only):
   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5645
   -> http://127.0.0.1:5645/theme-probe/deployments.html?case=revision
*/
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import ReplicaStatusTag, {
  type ReplicaStatus,
} from '../src/components/ReplicaStatusTag';
import { DeploymentsProbeRevision } from '../src/diagnostics/DeploymentsAstryxProbe';
import { ThemeModeProvider } from '../src/hooks/useThemeMode';
import '../src/index.css';
import { Theme } from '@astryxdesign/core/theme';
import { ConfigProvider, theme as antdTheme } from 'antd';
import i18next from 'i18next';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter } from 'react-router-dom';
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'revision';
const mode = params.get('theme') === 'dark' ? 'dark' : 'light';

// `useThemeMode` (consumed by e.g. SourceCodeView for its syntax theme) reads
// this JSON-serialized localStorage key; align it with the probe's mode
// BEFORE mounting so both theme layers agree.
window.localStorage.setItem(
  'backendaiwebui.settings.themeMode',
  JSON.stringify(mode),
);

const environment = createMockEnvironment();
environment.mock.queueOperationResolver((operation) =>
  MockPayloadGenerator.generate(operation, {
    Node: () => ({ __typename: 'ModelRevision' }),
    ModelRevision: () => ({
      revisionNumber: 3,
      createdAt: '2026-08-01T09:30:00Z',
      clusterConfig: { mode: 'single-node', size: 1 },
      resourceSlots: [
        { slotName: 'cpu', quantity: '4' },
        { slotName: 'mem', quantity: '17179869184' },
        { slotName: 'cuda.shares', quantity: '2' },
      ],
      resourceConfig: {
        resourceOpts: { entries: [{ name: 'shmem', value: '64m' }] },
      },
      modelRuntimeConfig: {
        runtimeVariant: { name: 'vllm' },
        inferenceRuntimeConfig: { max_model_len: 4096 },
        environ: {
          entries: [
            { name: 'HF_HOME', value: '/models/.cache' },
            { name: 'TP_SIZE', value: '2' },
          ],
        },
        runtimeVariantPresetValues: [
          {
            presetId: 'preset-1',
            value: 'bfloat16',
            preset: {
              name: 'dtype',
              displayName: 'DType',
              targetSpec: { key: '--dtype' },
            },
          },
        ],
      },
      modelMountConfig: {
        vfolderId: 'vf-1',
        mountDestination: '/models',
        definitionPath: 'model-definition.yaml',
        vfolder: { name: 'llama3-weights' },
      },
      extraMounts: [
        {
          vfolderId: 'vf-2',
          mountDestination: '/data',
          mountPerm: 'ro',
          vfolder: { name: 'shared-datasets' },
        },
      ],
      imageV2: {
        identity: {
          canonicalName: 'cr.backend.ai/stable/vllm:0.9.1-cuda12.4',
          architecture: 'x86_64',
        },
      },
      modelDefinition: {
        models: [
          {
            name: 'llama3-8b',
            modelPath: '/models/llama3-8b',
            service: {
              startCommand: ['vllm', 'serve', '/models/llama3-8b'],
              shell: '/bin/bash',
              port: 8000,
              preStartActions: [],
              healthCheck: {
                path: '/health',
                initialDelay: 30,
                maxRetries: 10,
                interval: 10,
                maxWaitTime: 300,
                expectedStatusCode: 200,
              },
            },
          },
        ],
      },
    }),
  }),
);

const REPLICA_STATUSES: ReplicaStatus[] = [
  'HEALTHY',
  'UNHEALTHY',
  'DEGRADED',
  'NOT_CHECKED',
  'PROVISIONING',
  'WARMING_UP',
  'RUNNING',
  'TERMINATING',
  'TERMINATED',
  'FAILED_TO_START',
];

const ReplicaCase: React.FC = () => (
  <div
    style={{
      padding: 24,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
    }}
  >
    {REPLICA_STATUSES.map((status) => (
      <ReplicaStatusTag key={status} status={status} />
    ))}
  </div>
);

const cases: Record<string, React.ReactNode> = {
  revision: <DeploymentsProbeRevision />,
  replica: <ReplicaCase />,
  drawer: <DeploymentsProbeRevision inDrawer />,
};

const App: React.FC = () => (
  <Theme theme={backendAiBrandTheme} mode={mode}>
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
      }}
    >
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-background-app)',
          color: 'var(--color-text-primary)',
        }}
      >
        <MemoryRouter>
          <ThemeModeProvider>
            <NuqsAdapter>
              <RelayEnvironmentProvider environment={environment}>
                <Suspense fallback={<div>loading…</div>}>
                  {cases[which] ?? cases.revision}
                </Suspense>
              </RelayEnvironmentProvider>
            </NuqsAdapter>
          </ThemeModeProvider>
        </MemoryRouter>
      </div>
    </ConfigProvider>
  </Theme>
);

createRoot(document.getElementById('root')!).render(<App />);
