/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 21 probe — backend client stub, extending the ticket-16 stub with the
 extra methods the Users/Credentials/ResourcePolicy area's hooks call
 (`useTOTPSupported`, `useCSVExport`, `useCurrentUserRole`). MUST be imported
 FIRST in `users21.tsx` — `react/src/hooks`' `backendaiClientPromise`
 inspects `globalThis.backendaiclient` at module-evaluation time.
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
  // `bulk-create-user` -> true so the toolbar's split button (primary
  // "Create User" + DropdownMenu-driven "..." bulk actions) actually renders
  // in the probe — that split-button conversion (Space.Compact ->
  // ButtonGroup, Dropdown -> DropdownMenu) is the point of the `toolbar` case.
  supports: (feature: string) => feature === 'bulk-create-user',
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
