/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 probe — backend client stub. MUST be imported FIRST in
 `ticket16.tsx`: `react/src/hooks`' `backendaiClientPromise` inspects
 `globalThis.backendaiclient` at module-evaluation time, so the stub has to
 exist before any component module (which transitively imports the hooks)
 evaluates.
*/
const volumeInfo = {
  'local:volume1': {
    backend: 'vfs',
    capabilities: ['quota'],
    usage: { percentage: 42 },
    sftp_scaling_groups: [],
  },
};

(globalThis as any).backendaiclient = {
  ready: true,
  email: 'probe@backend.ai',
  full_name: 'Probe User',
  user_uuid: 'probe-user-uuid',
  current_group: 'default',
  current_group_id: () => 'probe-project-uuid',
  supports: () => false,
  isManagerVersionCompatibleWith: () => true,
  _config: {
    accessKey: 'PROBEACCESSKEY',
    domainName: 'default',
    enableModelFolders: true,
    fasttrackEndpoint: null,
    maskUserInfo: false,
  },
  vfolder: {
    list_hosts: async () => ({
      default: 'local:volume1',
      allowed: ['local:volume1'],
      volume_info: volumeInfo,
    }),
    list_allowed_types: async () => ['user', 'group'],
    list_invitees: async () => ({ shared: [] }),
    delete_by_id: async () => ({}),
    restore_from_trash_bin: async () => ({}),
    delete_from_trash_bin: async () => ({}),
    rename: async () => ({}),
    update_folder: async () => ({}),
    invite: async () => ({}),
    modify_invitee_permission: async () => ({}),
  },
};

export {};
