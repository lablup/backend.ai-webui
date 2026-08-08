/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx TICKET 25 visual-gate harness — mounts the REAL migrated
 `*Nodes` components (nothing re-created here) against a mock Relay
 environment + a stubbed backend client, so light/dark screenshots compare the
 actual modules.

   ?case=users       BAIUserNodes on BAITableAstryx — sorting, resize,
                     selection, column settings, CSV export, pagination
   ?case=scheduling  BAISchedulingHistoryTable — controlled `expandable` with
                     a NESTED BAISubStepNodes table in the detail row
   ?case=groups      synthetic multi-level-header + expandedRowRender demo
                     rendered directly on BAITableAstryx (no repo call site
                     uses antd column groups — see the ticket's matrix)
   &mode=dark        dark scheme (default light)

 Serve (PORT POLICY for this worktree: 5715-5724):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts \
     --port 5715 --strictPort
   -> http://127.0.0.1:5715/theme-probe/table25.html?case=users&mode=dark
*/
// The stub MUST evaluate before any module that imports react/src/hooks.
// eslint-disable-next-line import/order
import './table25-env';
import en from '../../resources/i18n/en.json';
import { BAIAppProvider } from '../src/app-shim';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import {
  TableProbeScheduling,
  TableProbeUsers,
} from '../src/diagnostics/TableAstryxProbe';
import '../src/index.css';
import { ThemeShimProvider } from '../src/theme-shim';
import { Theme } from '@astryxdesign/core/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Probe-only: the app couples antd's dark mode via ConfigProvider
// (DefaultProviders). Legacy antd surfaces still live around these tables, so
// keep it wired or the shots misrepresent the app.
import { ConfigProvider, theme as antdTheme } from 'antd';
import {
  BAIClientProvider,
  BAITableAstryx,
  type BAIColumnsType,
} from 'backend.ai-ui';
import i18next from 'i18next';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v6';
import React, { Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initReactI18next } from 'react-i18next';
import { RelayEnvironmentProvider } from 'react-relay';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils';

void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'users';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

window.localStorage.setItem(
  'backendaiwebui.settings.themeMode',
  JSON.stringify(mode),
);

/* ----- mock Relay environment --------------------------------------------- */

const environment = createMockEnvironment();
let idCounter = 0;
const SCHEDULING_RESULTS = ['SUCCESS', 'FAILURE', 'SUCCESS', 'EXPIRED'];
let resultCounter = 0;
const fieldResolvers = {
  String(context: { name?: string | null }) {
    if (context.name === 'email') return 'probe-user@backend.ai';
    if (context.name === 'username') return 'probe-user';
    if (context.name === 'full_name') return 'Probe User';
    if (context.name === 'domain_name') return 'default';
    if (context.name === 'resource_policy') return 'default-policy';
    if (context.name === 'role') return 'admin';
    if (context.name === 'status') return 'active';
    if (context.name === 'message') return 'scheduler picked agent i-0001';
    if (context.name === 'phase') return 'SCHEDULING';
    if (context.name === 'fromStatus') return 'PENDING';
    if (context.name === 'toStatus') return 'SCHEDULED';
    if (context.name === 'step') return 'predicate-check';
    if (context.name === 'errorCode') return 'E-1042';
    if (context.name === 'result') {
      resultCounter += 1;
      return SCHEDULING_RESULTS[resultCounter % SCHEDULING_RESULTS.length];
    }
    // `DateTime` is declared as a custom scalar mapped to `string`
    // (relay-base.config.js), so MockPayloadGenerator resolves it through the
    // String resolver — an arbitrary mock string renders as "Invalid Date".
    if (
      context.name === 'created_at' ||
      context.name === 'modified_at' ||
      context.name === 'createdAt' ||
      context.name === 'updatedAt' ||
      context.name === 'startedAt' ||
      context.name === 'endedAt'
    ) {
      return '2026-08-07T09:12:34Z';
    }
    // `count` / `attempts` are Ints, but the generator still routes unknown
    // scalars here; return numbers cast to the String resolver's signature.
    if (context.name === 'count') return 42 as unknown as string;
    if (context.name === 'attempts') return 2 as unknown as string;
    return undefined as unknown as string;
  },
  Boolean() {
    return true;
  },
  Int(context: { name?: string | null }) {
    if (context.name === 'count') return 42;
    if (context.name === 'attempts') return 2;
    return 1;
  },
  DateTime() {
    return '2026-08-07T09:12:34Z';
  },
  // `toLocalId` atob-decodes every `id`; MockPayloadGenerator's default id
  // string is not valid base64.
  ID(context: { type?: string | null }) {
    idCounter += 1;
    return btoa(
      `${context.type ?? 'Node'}:00000000-0000-0000-0000-00000000000${idCounter}`,
    );
  },
};
setInterval(() => {
  for (const op of environment.mock.getAllOperations()) {
    try {
      environment.mock.resolve(
        op,
        MockPayloadGenerator.generate(op, fieldResolvers),
      );
    } catch {
      // already resolved / not resolvable this tick — retried next
    }
  }
}, 150);

/* ----- synthetic column-group + expandable case ---------------------------- */

interface GroupRow extends Record<string, unknown> {
  id: string;
  name: string;
  cpu: number;
  mem: number;
  status: string;
  note: string;
}

const groupRows: Array<GroupRow> = [
  { id: 'a', name: 'alpha', cpu: 4, mem: 16, status: 'RUNNING', note: 'ok' },
  { id: 'b', name: 'bravo', cpu: 8, mem: 32, status: 'PENDING', note: 'queued' },
  { id: 'c', name: 'charlie', cpu: 2, mem: 8, status: 'ERROR', note: 'failed' },
];

const GroupsCase: React.FC = () => {
  'use memo';
  const [expandedRowKeys, setExpandedRowKeys] = useState<Array<React.Key>>([
    'b',
  ]);
  const columns: BAIColumnsType<GroupRow> = [
    { key: 'name', title: 'Name', dataIndex: 'name', fixed: 'left', required: true },
    {
      key: 'resources',
      title: 'Resources',
      children: [
        { key: 'cpu', title: 'CPU', dataIndex: 'cpu', sorter: true },
        { key: 'mem', title: 'Memory (GiB)', dataIndex: 'mem', sorter: true },
      ],
    },
    { key: 'status', title: 'Status', dataIndex: 'status' },
    { key: 'note', title: 'Note', dataIndex: 'note' },
  ];
  return (
    <div style={{ padding: 24 }}>
      <BAITableAstryx<GroupRow>
        resizable
        rowKey="id"
        dataSource={groupRows}
        columns={columns}
        order="-cpu"
        pagination={{ current: 1, pageSize: 10, total: groupRows.length }}
        tableSettings={{ columnOverrides: {}, onColumnOverridesChange: () => {} }}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
          expandedRowRender: (record) => (
            <div>
              Detail panel for <strong>{record.name}</strong> — this row is
              rendered by the custom `expansion` plugin as a single full-span
              cell.
            </div>
          ),
        }}
      />
    </div>
  );
};

/* ----- cases ---------------------------------------------------------------- */

const cases: Record<string, React.ReactNode> = {
  users: <TableProbeUsers />,
  scheduling: <TableProbeScheduling />,
  groups: <GroupsCase />,
};

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
              {cases[which] ?? cases.users}
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
            clientPromise={Promise.resolve((globalThis as any).backendaiclient)}
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
