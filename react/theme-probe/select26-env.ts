/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 26 probe — backend client stub. MUST be imported FIRST in
 `select26.tsx`: `react/src/hooks`' `backendaiClientPromise` inspects
 `globalThis.backendaiclient` at module-evaluation time.
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
  supports: () => false,
  isManagerVersionCompatibleWith: () => true,
  _config: {
    accessKey: 'PROBEACCESSKEY',
    domainName: 'default',
    maskUserInfo: false,
  },
};

export {};
