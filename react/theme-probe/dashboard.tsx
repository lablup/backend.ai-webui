/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 15 shot harness — mounts the REAL Dashboard/Summary area components
 (nothing re-created) with a stubbed Backend.AI client + a Relay mock
 environment, so before/after shots compare actual modules without a backend:

   ?case=board    BAIBoard + SessionCountDashboardItem + StorageStatusPanelCard
                  + QuotaPerStorageVolumeDashboardItem + AgentStats
                  (the DashboardPage board-item population)
   ?case=summary  AgentSummaryPage (tabbed card + AgentSummaryList table)

 Colour mode follows `prefers-color-scheme` (Playwright's `colorScheme`).

 Serve under the theme-probe Vite harness (no app shell, auth, or backend):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5615
   -> http://127.0.0.1:5615/theme-probe/dashboard.html?case=board

 The stub client is installed on `globalThis.backendaiclient` BEFORE the app
 hook modules evaluate (their module-level `backendaiClientPromise` reads it at
 import time), which is why the real mount lives behind a dynamic import.
*/

// ---------------------------------------------------------------------------
// Stub Backend.AI client — the minimal surface the mounted area components
// actually touch. Must exist before `../src/hooks` evaluates.
// ---------------------------------------------------------------------------
const RESOURCE_SLOT_DETAILS = {
  cpu: {
    slot_name: 'cpu',
    description: 'CPU',
    human_readable_name: 'CPU',
    display_unit: 'Core',
    number_format: { binary: false, round_length: 0 },
    display_icon: 'cpu',
  },
  mem: {
    slot_name: 'mem',
    description: 'Memory',
    human_readable_name: 'RAM',
    display_unit: 'GiB',
    number_format: { binary: true, round_length: 0 },
    display_icon: 'memory',
  },
  'cuda.device': {
    slot_name: 'cuda.device',
    description: 'CUDA GPU',
    human_readable_name: 'GPU',
    display_unit: 'GPU',
    number_format: { binary: false, round_length: 2 },
    display_icon: 'gpu1',
  },
};

const stubClient = {
  ready: true,
  current_group: 'default',
  current_group_id: () => 'project-uuid-0001',
  email: 'probe@lablup.com',
  user_uuid: 'user-uuid-0001',
  accessKey: 'PROBEKEY',
  _config: {
    hideAgents: false,
    domainName: 'default',
  },
  supports: () => true,
  isManagerVersionCompatibleWith: () => true,
  isAPIVersionCompatibleWith: () => true,
  newSignedRequest: (method: string, url: string) => ({ method, url }),
  _wrapWithPromise: (req: { url: string }) => {
    if (req.url.startsWith('/config/resource-slots/details')) {
      return Promise.resolve(RESOURCE_SLOT_DETAILS);
    }
    return Promise.resolve({});
  },
  scalingGroup: {
    list: () =>
      Promise.resolve({ scaling_groups: [{ name: 'default' }] }),
  },
  vfolder: {
    list: () =>
      Promise.resolve([
        { is_owner: true, ownership_type: 'user', status: 'ready' },
        { is_owner: true, ownership_type: 'user', status: 'ready' },
        { is_owner: false, ownership_type: 'group', status: 'ready' },
        { is_owner: false, ownership_type: 'user', status: 'ready' },
      ]),
    list_hosts: () => Promise.resolve({ volume_info: {} }),
    invitations: () =>
      Promise.resolve({ invitations: [{ id: 'inv-1' }, { id: 'inv-2' }] }),
  },
};

// @ts-ignore — the app reads this global (see react/src/hooks/index.tsx).
globalThis.backendaiclient = stubClient;

// The hook modules read the global at import time — mount dynamically AFTER
// the stub exists.
void import('./dashboardMain');
