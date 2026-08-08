/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 27 probe — backend client stub. MUST be imported FIRST in
 `select27.tsx`: `react/src/hooks`' `backendaiClientPromise` inspects
 `globalThis.backendaiclient` at module-evaluation time. Same stub as
 `select26-env.ts` (ticket 26), duplicated rather than shared so each probe
 stays self-contained.
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
