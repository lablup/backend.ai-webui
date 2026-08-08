/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 23 shot harness — real mount module. Loaded dynamically by
 `chatai.tsx` AFTER the stub `globalThis.backendaiclient` is installed
 (module-level `backendaiClientPromise` in ../src/hooks reads it at import).

 The Relay layer runs against `relay-test-utils`' mock environment with
 queued `MockPayloadGenerator` resolvers, using the app's own compiled query
 artifacts — no probe-only queries, so the relay-compiler output is untouched.
*/
import en from '../../resources/i18n/en.json';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import '../src/index.css';
import AIAgentPage from '../src/pages/AIAgentPage';
import ChatPage from '../src/pages/ChatPage';
import ModelStoreListPageV2 from '../src/pages/ModelStoreListPageV2';
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
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'ai-agent';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// ---------------------------------------------------------------------------
// Relay mock data
// ---------------------------------------------------------------------------
const MODEL_CARD_ROWS = [
  {
    id: 'model-card-0001',
    name: 'meta-llama/Llama-3.1-8B-Instruct',
    metadata: {
      title: 'Llama 3.1 8B Instruct',
      task: 'text-generation',
      author: 'Meta',
    },
    updatedAt: '2026-07-20T00:00:00.000Z',
    createdAt: '2026-06-01T00:00:00.000Z',
    availablePresets: { count: 2 },
  },
  {
    id: 'model-card-0002',
    name: 'stabilityai/stable-diffusion-xl',
    metadata: {
      title: 'Stable Diffusion XL',
      task: 'text-to-image',
      author: 'Stability AI',
    },
    updatedAt: '2026-07-18T00:00:00.000Z',
    createdAt: '2026-05-15T00:00:00.000Z',
    availablePresets: { count: 0 },
  },
  {
    id: 'model-card-0003',
    name: 'BAAI/bge-large-en',
    metadata: {
      title: 'BGE Large EN (embeddings)',
      task: 'feature-extraction',
      author: 'BAAI',
    },
    updatedAt: '2026-07-10T00:00:00.000Z',
    createdAt: '2026-04-01T00:00:00.000Z',
    availablePresets: { count: 1 },
  },
];

// `toLocalId`/`toGlobalId` (backend.ai-ui) round-trip Relay global IDs
// through base64 (`btoa`/`atob`) — mock node ids must be real global ids,
// not plain strings, or the app's own decode throws.
const toMockGlobalId = (type: string, id: string) => btoa(`${type}:${id}`);

const environment = createMockEnvironment();
const MOCK_RESOLVERS = {
  Query: () => ({
    domainV2: {
      projects: {
        edges: [
          {
            node: {
              id: toMockGlobalId('ProjectNode', 'project-model-store-0001'),
              basicInfo: { name: 'model-store' },
            },
          },
        ],
      },
    },
    myDeployments: { edges: [], count: 0 },
  }),
  ModelCardV2Connection: () => ({
    count: MODEL_CARD_ROWS.length,
    edges: MODEL_CARD_ROWS.map((node) => ({ node })),
  }),
  // `useViewer` (BUI) `atob`-decodes `encoded_user_role` — without an
  // explicit resolver, MockPayloadGenerator's auto-generated string is not
  // valid base64 and throws (intermittently, depending on the random
  // charset it lands on).
  Viewer: () => ({
    user: { email: 'probe@lablup.com' },
    encoded_user_role: btoa('superadmin'),
  }),
};
for (let i = 0; i < 40; i += 1) {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, MOCK_RESOLVERS),
  );
}

const INITIAL_PATH: Record<string, string> = {
  'ai-agent': '/project/default/ai-agent',
  'model-store': '/project/default/model-store',
  'chat-empty': '/project/default/chat',
};

const cases: Record<string, React.ReactNode> = {
  'ai-agent': <AIAgentPage />,
  'model-store': <ModelStoreListPageV2 />,
  'chat-empty': <ChatPage />,
};

document.body.style.background = isDark ? '#141414' : '#ffffff';
document.body.style.padding = which === 'chat-empty' ? '0' : '16px';
if (which === 'chat-empty') {
  document.body.style.height = '100vh';
  document.body.style.margin = '0';
}

// Hooks in the tree (`useProjectPath` -> `useMatches`) need a DATA router
// (ticket-16 pattern) — a plain `<MemoryRouter>` throws "useMatches must be
// used within a data router".
const router = createMemoryRouter([
  {
    path: '*',
    element: (
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
            <Theme theme={backendAiBrandTheme} mode={isDark ? 'dark' : 'light'}>
              <BAIClientProvider
                clientPromise={Promise.resolve(
                  (globalThis as any).backendaiclient,
                )}
                anonymousClientFactory={() =>
                  (globalThis as any).backendaiclient
                }
              >
                <div
                  style={
                    which === 'chat-empty'
                      ? {
                          height: '100vh',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }
                      : undefined
                  }
                >
                  <Suspense>{cases[which] ?? cases['ai-agent']}</Suspense>
                </div>
              </BAIClientProvider>
            </Theme>
          </App>
        </ConfigProvider>
      </NuqsAdapter>
    ),
  },
], { initialEntries: [INITIAL_PATH[which] ?? '/project/default/ai-agent'] });

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={environment}>
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </RelayEnvironmentProvider>,
);
