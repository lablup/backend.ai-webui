/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  v2PermissionToKey,
  type V2AllowedVfolderHostEntry,
} from 'backend.ai-ui';

/**
 * Display label mapping for the canonical 8 permission keys. The actual column
 * set is sourced from `vfolder_host_permissions.vfolder_host_permission_list`
 * at render time so the UI is forward-compatible with new permission keys;
 * this map is only consulted for display labels.
 *
 * `categoryKey` is currently unused for rendering — kept here because the
 * backend semantics group permissions this way and a future UI revision may
 * want to surface the grouping.
 */
export const PERMISSION_DISPLAY_MAP: Record<
  string,
  { labelKey: string; categoryKey: string }
> = {
  'create-vfolder': {
    labelKey: 'storageHost.permission.Create',
    categoryKey: 'storageHost.permission.Volume',
  },
  'delete-vfolder': {
    labelKey: 'storageHost.permission.Delete',
    categoryKey: 'storageHost.permission.Volume',
  },
  'modify-vfolder': {
    labelKey: 'storageHost.permission.Modify',
    categoryKey: 'storageHost.permission.Volume',
  },
  'mount-in-session': {
    labelKey: 'storageHost.permission.Mount',
    categoryKey: 'storageHost.permission.Folder',
  },
  'download-file': {
    labelKey: 'storageHost.permission.Download',
    categoryKey: 'storageHost.permission.Folder',
  },
  'upload-file': {
    labelKey: 'storageHost.permission.Upload',
    categoryKey: 'storageHost.permission.Folder',
  },
  'invite-others': {
    labelKey: 'storageHost.permission.Invite',
    categoryKey: 'storageHost.permission.UserFolder',
  },
  'set-user-specific-permission': {
    labelKey: 'storageHost.permission.SetPermission',
    categoryKey: 'storageHost.permission.ProjectFolder',
  },
};

/**
 * Parse the `allowed_vfolder_hosts` JSONString returned by the backend.
 * Returns a record mapping each storage host name to its enabled permission
 * keys, or an empty object when the input is missing or unparseable.
 */
export const parseAllowedHosts = (
  raw: string | null | undefined,
): Record<string, string[]> => {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * Rebuild the `allowed_vfolder_hosts` JSONString preserving entries for all
 * storage hosts other than `storageHostId`, and replacing the entry for
 * `storageHostId` with the given enabled keys. Returns the JSON-stringified
 * payload ready to pass to a `modify_*` mutation.
 */
export const buildAllowedHostsPayload = (
  currentRaw: string | null | undefined,
  storageHostId: string,
  enabledKeys: string[],
): string => {
  const existing = parseAllowedHosts(currentRaw);
  return JSON.stringify({ ...existing, [storageHostId]: enabledKeys });
};

/**
 * True when the enabled set has `mount-in-session` but is missing one of
 * `download-file` / `upload-file`. Intent is to warn the user before saving
 * a state that effectively mounts the folder but blocks file I/O.
 */
export const hasMountWithoutFileOps = (
  enabled: ReadonlySet<string>,
): boolean => {
  if (!enabled.has('mount-in-session')) return false;
  return !enabled.has('download-file') || !enabled.has('upload-file');
};

/* === V2 (Strawberry) helpers ===
 *
 * `ProjectV2.storage.allowedVfolderHosts` and
 * `KeypairResourcePolicyV2.allowedVfolderHosts` return a structured
 * `[VFolderHostPermissionEntry!]!` array instead of the V1 JSONString. The
 * permission elements are `VFolderHostPermissionV2` enum values
 * (`CREATE_VFOLDER`, `MOUNT_IN_SESSION`, …) — convert them to the canonical
 * kebab keys used by `PERMISSION_DISPLAY_MAP` and the V1 mutations' payload.
 *
 * The conversion itself lives in BUI (`helper/vfolderHostPermission.ts`)
 * because BUI components render V2 host permissions too; it is re-exported
 * here so app-side call sites keep one import path.
 *
 * Domain still uses the V1 path because `DomainV2` does not expose
 * `allowedVfolderHosts` (only `ProjectV2` / `KeypairResourcePolicyV2` do).
 */
export { v2PermissionToKey, type V2AllowedVfolderHostEntry };

/**
 * Rebuild the V1 `allowed_vfolder_hosts` JSONString from V2 structured
 * entries, with the entry for `storageHostId` replaced by `enabledKeys`
 * (kebab keys). Other hosts' entries are preserved verbatim.
 */
export const buildAllowedHostsPayloadFromV2 = (
  allowedVfolderHosts:
    ReadonlyArray<V2AllowedVfolderHostEntry> | null | undefined,
  storageHostId: string,
  enabledKeys: string[],
): string => {
  const merged: Record<string, string[]> = {};
  for (const entry of allowedVfolderHosts ?? []) {
    merged[entry.host] = entry.permissions.map(v2PermissionToKey);
  }
  merged[storageHostId] = enabledKeys;
  return JSON.stringify(merged);
};
