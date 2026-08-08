/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 25 probe — backend client stub. MUST be imported FIRST in
 `table25.tsx`: `react/src/hooks`' `backendaiClientPromise` inspects
 `globalThis.backendaiclient` at module-evaluation time, and BUI's
 `useConnectedBAIClient` reads it through `BAIClientProvider`.
*/
(globalThis as any).backendaiclient = {
  ready: true,
  email: 'probe@backend.ai',
  full_name: 'Probe User',
  user_uuid: 'probe-user-uuid',
  current_group: 'default',
  current_group_id: () => 'probe-project-uuid',
  is_admin: true,
  is_superadmin: true,
  supports: () => true,
  isManagerVersionCompatibleWith: () => true,
  isManagerSupportingTOTP: async () => false,
  user: {
    get: async () => ({ role: 'superadmin' }),
  },
  _config: {
    accessKey: 'PROBEACCESSKEY',
    domainName: 'default',
    enableModelFolders: true,
    fasttrackEndpoint: null,
    maskUserInfo: false,
  },
};

export {};
