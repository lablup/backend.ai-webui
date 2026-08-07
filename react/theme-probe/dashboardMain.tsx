/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 15 shot harness — real mount module. Loaded dynamically by
 `dashboard.tsx` AFTER the stub `globalThis.backendaiclient` is installed
 (module-level `backendaiClientPromise` in ../src/hooks reads it at import).

 The Relay layer runs against `relay-test-utils`' mock environment with
 queued `MockPayloadGenerator` resolvers, using the app's own compiled query
 artifacts (`__generated__/*.graphql.ts`) — no probe-only queries, so the
 relay-compiler output is untouched.
*/
import en from '../../resources/i18n/en.json';
import AgentStatsQueryNode from '../src/__generated__/DashboardPageQuery.graphql';
import AgentStats from '../src/components/AgentStats';
import BAIBoard, { BAIBoardItem } from '../src/components/BAIBoard';
import QuotaPerStorageVolumeDashboardItem from '../src/components/QuotaPerStorageVolumeDashboardItem';
import SessionCountDashboardItem from '../src/components/SessionCountDashboardItem';
import StorageStatusPanelCard from '../src/components/StorageStatusPanelCard';
import AgentSummaryPage from '../src/pages/AgentSummaryPage';
import '../src/index.css';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App, ConfigProvider, theme as antdTheme } from 'antd';
import { BAIClientProvider, filterOutEmpty } from 'backend.ai-ui';
import i18next from 'i18next';
import { NuqsAdapter } from 'nuqs/adapters/react';
import React, { Suspense, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'board';
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// ---------------------------------------------------------------------------
// Relay mock environment: every operation resolves through the same
// mock-resolver table (session counts, agent stats, vfolder policies,
// agent summary rows).
// ---------------------------------------------------------------------------
const environment = createMockEnvironment();
const MOCK_RESOLVERS = {
  ComputeSessionConnection: () => ({ count: 7 }),
  AgentResource: () => ({
    capacity: { cpu: 256, mem: 2199023255552, 'cuda.device': 16 },
    used: { cpu: 176, mem: 1319413953331, 'cuda.device': 9 },
    free: { cpu: 80, mem: 879609302221, 'cuda.device': 7 },
  }),
  UserResourcePolicy: () => ({ max_vfolder_count: 10 }),
  ProjectResourcePolicy: () => ({ max_vfolder_count: 20 }),
  AgentSummaryList: () => ({
    items: [1, 2, 3].map((n) => ({
      id: `i-agent-${n}`,
      status: 'ALIVE',
      architecture: 'x86_64',
      available_slots: JSON.stringify({
        cpu: '64',
        mem: '274877906944',
        'cuda.device': '8',
      }),
      occupied_slots: JSON.stringify({
        cpu: `${16 * n}`,
        mem: `${68719476736 * n}`,
        'cuda.device': `${2 * n}`,
      }),
      scaling_group: 'default',
      schedulable: n !== 3,
    })),
    total_count: 3,
  }),
};
for (let i = 0; i < 30; i += 1) {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, MOCK_RESOLVERS),
  );
}

/**
 * Board case — the DashboardPage board-item population, on the real BAIBoard.
 * The page-level query artifact is reused so `queryRef` reaches the fragment
 * components exactly like DashboardPage passes it.
 */
const BoardCase: React.FC = () => {
  const queryRef = useLazyLoadQuery<any>(AgentStatsQueryNode as any, {
    scopeId: 'project:project-uuid-0001',
    resourceGroup: 'default',
    skipTotalResourceWithinResourceGroup: true,
    isSuperAdmin: true,
    agentNodeFilter:
      'schedulable == true & status == "ALIVE" & scaling_group == "default"',
  });

  // Flip the fetchKey once after mount so StorageStatusPanelCard's
  // `useUpdateEffect` pulls the stubbed invitations (badge-count state).
  const [folderFetchKey, setFolderFetchKey] = useState('initial');
  useEffect(() => {
    const timer = setTimeout(() => setFolderFetchKey('probe'), 50);
    return () => clearTimeout(timer);
  }, []);

  const items: Array<BAIBoardItem> = filterOutEmpty([
    {
      id: 'mySession',
      rowSpan: 2,
      columnSpan: 2,
      definition: { minRowSpan: 2, minColumnSpan: 2 },
      data: {
        content: (
          <Suspense>
            <SessionCountDashboardItem
              queryRef={queryRef}
              title="Active Sessions"
            />
          </Suspense>
        ),
      },
    },
    {
      id: 'folderStatus',
      rowSpan: 2,
      columnSpan: 2,
      definition: { minRowSpan: 2, minColumnSpan: 2 },
      data: {
        content: (
          <Suspense>
            <StorageStatusPanelCard
              fetchKey={folderFetchKey}
              onRequestBadgeClick={() => {}}
            />
          </Suspense>
        ),
      },
    },
    {
      id: 'quotaPerStorageVolume',
      rowSpan: 2,
      columnSpan: 2,
      definition: { minRowSpan: 2, minColumnSpan: 2 },
      data: {
        content: (
          <Suspense>
            <QuotaPerStorageVolumeDashboardItem />
          </Suspense>
        ),
      },
    },
    queryRef.AgentStatsFragment && {
      id: 'agentStats',
      rowSpan: 2,
      columnSpan: 2,
      definition: { minRowSpan: 2, minColumnSpan: 2 },
      data: {
        content: (
          <Suspense>
            <AgentStats queryRef={queryRef.AgentStatsFragment} />
          </Suspense>
        ),
      },
    },
  ]);

  return (
    <BAIBoard
      movable
      resizable
      bordered
      items={items}
      onItemsChange={() => {}}
    />
  );
};

/** Summary case — the real AgentSummaryPage (tabbed card + list). */
const SummaryCase: React.FC = () => (
  <Suspense>
    <AgentSummaryPage />
  </Suspense>
);

const cases: Record<string, React.ReactNode> = {
  board: <BoardCase />,
  summary: <SummaryCase />,
};

document.body.style.background = isDark ? '#141414' : '#ffffff';
document.body.style.padding = '16px';

createRoot(document.getElementById('root')!).render(
  <RelayEnvironmentProvider environment={environment}>
    <QueryClientProvider client={new QueryClient()}>
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
                <Suspense>{cases[which] ?? cases.board}</Suspense>
              </BAIClientProvider>
            </Theme>
          </App>
        </ConfigProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  </RelayEnvironmentProvider>,
);
