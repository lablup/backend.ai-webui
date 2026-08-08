/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 21 visual-gate harness — mounts the REAL Users/Credentials/
 ResourcePolicy area components (nothing re-created here) with a mock Relay
 environment + a stubbed backend client, so before/after light/dark
 screenshots compare the actual modules.

   ?case=credentials  AdminUserCredentialList (Tag -> Badge, Tooltip, Button)
   ?case=toolbar      AdminUserManagement     (DropdownMenu, ButtonGroup)
   ?case=keypair      KeypairResourcePolicyList (Button, Tooltip)
   &mode=dark          dark scheme (default light)

 Serve (PORT POLICY for this worktree: 5675-5684):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts \
     --port 5675 --strictPort
   -> http://127.0.0.1:5675/theme-probe/users21.html?case=credentials&mode=dark
*/
// The stub MUST evaluate before any module that imports react/src/hooks.
// eslint-disable-next-line import/order
import './users21-env';
import en from '../../resources/i18n/en.json';
import { BAIAppProvider } from '../src/app-shim';
import { backendAiBrandTheme } from '../src/astryx-theme/backendAiTheme';
import AdminUserCredentialList from '../src/components/AdminUserCredentialList';
import AdminUserManagement from '../src/components/AdminUserManagement';
import KeypairResourcePolicyList from '../src/components/KeypairResourcePolicyList';
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
import { MockPayloadGenerator, createMockEnvironment } from 'relay-test-utils';

// Real host-side keys so labels render exactly as in the app (P13).
void i18next.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  resources: { en: { translation: en } },
});

const params = new URLSearchParams(window.location.search);
const which = params.get('case') ?? 'credentials';
const mode = params.get('mode') === 'dark' ? 'dark' : 'light';

window.localStorage.setItem(
  'backendaiwebui.settings.themeMode',
  JSON.stringify(mode),
);

/* ----- mock Relay environment --------------------------------------------- */

const environment = createMockEnvironment();
// Catch-all: every component in this area fires its OWN top-level
// `useLazyLoadQuery` (AdminUserCredentialList, AdminUserManagement,
// KeypairResourcePolicyList), so — unlike ticket 16's single page-query
// harness — there is no single operation to seed ahead of time. Instead,
// drain WHATEVER is pending on an interval with sensible field-level mocks,
// same recipe as ticket 18's deployments probe / ticket 16's own catch-all.
let idCounter = 0;
const fieldResolvers = {
  String(context: { name?: string | null }) {
    if (context.name === 'encoded_user_role') return btoa('superadmin');
    if (context.name === 'email') return 'probe-user@backend.ai';
    if (context.name === 'username') return 'probe-user';
    if (context.name === 'full_name') return 'Probe User';
    if (context.name === 'name') return 'default-policy';
    // KeypairResourcePolicyList / *ResourcePolicySettingModal `JSON.parse`
    // these two fields directly — an arbitrary mock string is invalid JSON.
    if (context.name === 'total_resource_slots')
      return JSON.stringify({ cpu: '4', mem: '17179869184' });
    if (context.name === 'allowed_vfolder_hosts')
      return JSON.stringify({ 'local:volume1': ['create-vfolder'] });
    return undefined as unknown as string;
  },
  Boolean(context: { name?: string | null }) {
    if (context.name === 'is_active') return true;
    return undefined as unknown as boolean;
  },
  // `toLocalId` (BAINameActionCell / row keys) `atob`-decodes every `id` —
  // MockPayloadGenerator's default id string is not valid base64, so give it
  // a real-looking global id, same recipe as ticket 16's VirtualFolderNode.
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
      // already resolved / not resolvable this tick — ignore, retried next
    }
  }
}, 150);

/* ----- cases ---------------------------------------------------------------- */

const cases: Record<string, React.ReactNode> = {
  credentials: (
    <div style={{ padding: 24 }}>
      <AdminUserCredentialList />
    </div>
  ),
  toolbar: (
    <div style={{ padding: 24 }}>
      <AdminUserManagement />
    </div>
  ),
  keypair: (
    <div style={{ padding: 24 }}>
      <KeypairResourcePolicyList />
    </div>
  ),
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
              {cases[which] ?? cases.credentials}
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
