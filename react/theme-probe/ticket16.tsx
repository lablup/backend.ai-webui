/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 visual-gate harness — mounts the REAL Data/VFolder components
 (nothing re-created here) with a mock Relay environment + a stubbed backend
 client, so before/after light/dark screenshots compare the actual modules.

   ?case=frame    page chrome: card + tabs + segmented filter + filter bar
   ?case=nodes    VFolderNodes (V1 list) with 3 mocked folders
   ?case=create   FolderCreateModalV2 (open)
   ?case=confirm  typed destructive confirm (BAIDeleteConfirmModal)
   &mode=dark     dark scheme (default light)

 Serve (PORT POLICY: 5625-5634):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts \
     --port 5625 --strictPort
   -> http://127.0.0.1:5625/theme-probe/ticket16.html?case=nodes&mode=dark
*/
// The stub MUST evaluate before any module that imports react/src/hooks.
// eslint-disable-next-line import/order
import './ticket16-env';
import en from '../../resources/i18n/en.json';
import type { VFolderNodeListPageQuery } from '../src/__generated__/VFolderNodeListPageQuery.graphql';
import queryRequest from '../src/__generated__/VFolderNodeListPageQuery.graphql';
import { BAIAppProvider } from '../src/app-shim';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import FolderCreateModalV2 from '../src/components/FolderCreateModalV2';
import VFolderNodes from '../src/components/VFolderNodes';
import BAIDeleteConfirmModal from '../src/components/astryx-bui/BAIDeleteConfirmModalAstryx';
import '../src/index.css';
import { ThemeShimProvider } from '../src/theme-shim';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Probe-only: the app couples antd's dark mode via ConfigProvider
// (DefaultProviders). Without it the FRONTIER surfaces (BAITable etc.) would
// render light inside a dark probe — the exact mixed-surface hazard SKILL.md
// describes — and the shots would misrepresent the app.
import { ConfigProvider, theme as antdTheme } from 'antd';
import { BAIClientProvider } from 'backend.ai-ui';
import i18next from 'i18next';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { createOperationDescriptor } from 'relay-runtime';
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'frame';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

/* ----- mock Relay data ---------------------------------------------------- */

const environment = createMockEnvironment();
// Catch-all: any child query (roles, explorer, deploy presets…) resolves
// with generated mocks instead of suspending forever. `encoded_user_role`
// must be valid base64 (`useViewer` atob-decodes it).
// `queueOperationResolver` serves ONE queued operation per registration, so a
// short interval drains whatever is pending instead.
const catchAllResolvers = {
  String(context: { name?: string | null }) {
    if (context.name === 'encoded_user_role') return btoa('user');
    return undefined as unknown as string;
  },
};
setInterval(() => {
  for (const op of environment.mock.getAllOperations()) {
    try {
      environment.mock.resolve(
        op,
        MockPayloadGenerator.generate(op, catchAllResolvers),
      );
    } catch {
      // already resolved / not resolvable — ignore
    }
  }
}, 150);

const FOLDER_FIXTURES = [
  {
    name: 'training-data',
    status: 'ready',
    usage_mode: 'general',
    ownership_type: 'user',
    permissions: ['read_attribute', 'delete_vfolder', 'mount_rw'],
  },
  {
    name: 'llama-weights',
    status: 'ready',
    usage_mode: 'model',
    ownership_type: 'user',
    permissions: ['read_attribute', 'delete_vfolder', 'mount_rw'],
  },
  {
    name: 'shared-project-docs',
    status: 'delete-pending',
    usage_mode: 'general',
    ownership_type: 'group',
    permissions: ['read_attribute'],
  },
];

let fixtureIndex = 0;
const variables = {
  scopeId: 'project:probe-project-uuid',
  offset: 0,
  first: 10,
  filter: null,
  order: '-created_at',
  permission: 'read_attribute',
  filterForActiveCount: null,
  filterForDeletedCount: null,
} as VFolderNodeListPageQuery['variables'];
const operation = createOperationDescriptor(queryRequest, variables);
const payload = MockPayloadGenerator.generate(operation, {
  VirtualFolderNode: () => {
    const fixture = FOLDER_FIXTURES[fixtureIndex % FOLDER_FIXTURES.length];
    fixtureIndex += 1;
    return {
      // A real-looking Relay global id — `toLocalId` atob-decodes it.
      id: btoa(
        `VirtualFolderNode:00000000-0000-0000-0000-00000000000${fixtureIndex}`,
      ),
      host: 'local:volume1',
      quota_scope_id: `user:probe-quota-${fixtureIndex}`,
      user: 'probe-user-uuid',
      user_email: 'probe@backend.ai',
      group: null,
      group_name: 'default',
      max_files: 0,
      max_size: null,
      created_at: '2026-08-01T09:00:00',
      last_used: null,
      num_files: 128,
      cur_size: '1073741824',
      cloneable: fixture.usage_mode === 'model',
      ...fixture,
    };
  },
});
environment.commitPayload(operation, (payload as { data?: object }).data ?? {});
const queryData = environment.lookup(operation.fragment).data as any;
const mockedNodes = (queryData?.vfolder_nodes?.edges ?? []).map(
  (edge: any) => edge.node,
);

/* ----- cases -------------------------------------------------------------- */

const NodesCase: React.FC = () => (
  <div style={{ padding: 24 }}>
    <VFolderNodes vfoldersFrgmt={mockedNodes} pagination={false} />
  </div>
);

const CreateCase: React.FC = () => (
  <FolderCreateModalV2 open onRequestClose={() => {}} />
);

const ConfirmCase: React.FC = () => (
  <BAIDeleteConfirmModal
    isOpen
    title="Delete forever?"
    description={`The folder "training-data" will be permanently deleted and cannot be restored.`}
    items={[{ key: '1', label: 'training-data' }]}
    requireConfirmInput
    confirmText="training-data"
    inputLabel="Please type training-data to confirm."
    inputPlaceholder="training-data"
    cannotBeUndoneText="WARNING: this cannot be undone!"
    actionLabel="Delete forever"
    cancelLabel="Cancel"
    onOpenChange={() => {}}
    onAction={() => {}}
  />
);

// Loaded lazily so the "before" (stashed) tree — which has no astryx page
// chrome — can still serve the other cases.
const FrameCase = React.lazy(() => import('./ticket16-frame'));

const cases: Record<string, React.ReactNode> = {
  frame: (
    <Suspense fallback={null}>
      <FrameCase />
    </Suspense>
  ),
  nodes: <NodesCase />,
  create: <CreateCase />,
  confirm: <ConfirmCase />,
};

// Hooks in the tree (`useProjectPath` -> `useMatches`) need a DATA router.
const router = createMemoryRouter([
  {
    path: '*',
    element: (
      <NuqsAdapter>
        <BAIAppProvider>
          <div
            style={{
              minHeight: '100vh',
              background: 'var(--color-background-body)',
              color: 'var(--color-text-primary)',
            }}
          >
            <Suspense fallback={<div>loading…</div>}>
              {cases[which] ?? cases.frame}
            </Suspense>
          </div>
        </BAIAppProvider>
      </NuqsAdapter>
    ),
  },
]);

createRoot(document.getElementById('root')!).render(
  <Theme theme={backendAiBrandTheme} mode={mode}>
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
    <ThemeShimProvider mode={mode}>
      <QueryClientProvider client={new QueryClient()}>
        <BAIClientProvider
          clientPromise={Promise.resolve(
            (globalThis as any).backendaiclient,
          )}
          anonymousClientFactory={() => (globalThis as any).backendaiclient}
        >
          <RelayEnvironmentProvider environment={environment}>
            <RouterProvider router={router} />
          </RelayEnvironmentProvider>
        </BAIClientProvider>
      </QueryClientProvider>
    </ThemeShimProvider>
    </ConfigProvider>
  </Theme>,
);
