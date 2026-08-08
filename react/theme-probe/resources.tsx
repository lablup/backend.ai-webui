/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 20 shot harness bootstrap — installs the stub Backend.AI client on
 `globalThis.backendaiclient` BEFORE `../src/hooks` evaluates (its
 module-level `backendaiClientPromise` reads it at import time), then loads
 the real mount module dynamically. Same two-file split as ticket 15's
 dashboard.tsx/dashboardMain.tsx.

 Serve under the theme-probe Vite harness (no app shell, auth, or backend):

   cd react && pnpm exec vite --config theme-probe/vite.config.mts --port 5665
   -> http://127.0.0.1:5665/theme-probe/resources.html?case=agent
   -> http://127.0.0.1:5665/theme-probe/resources.html?case=resourceGroup
*/
const stubClient = {
  ready: true,
  current_group: 'default',
  current_group_id: () => 'project-uuid-0001',
  email: 'probe@lablup.com',
  user_uuid: 'user-uuid-0001',
  accessKey: 'PROBEKEY',
  is_superadmin: true,
  _config: {
    hideAgents: false,
    domainName: 'default',
  },
  supports: () => true,
  isManagerVersionCompatibleWith: () => true,
  isAPIVersionCompatibleWith: () => true,
  newSignedRequest: (method: string, url: string) => ({ method, url }),
  _wrapWithPromise: () => Promise.resolve({}),
  utils: {
    elapsedTime: () => '00:12:34',
  },
};

// @ts-ignore — the app reads this global (see react/src/hooks/index.tsx).
globalThis.backendaiclient = stubClient;

void import('./resourcesMain');
