/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// The storage step's writes (ADR 0013), migrated as-is from
// `SessionLauncherStorageStep` (V-09) and
// `SessionLauncherFormIncompatibleValueChecker` (P-28).
import {
  defineSlice,
  getIn,
  type LauncherValues,
  type Patch,
  type PatchWrite,
} from '../model';
import type { VFolderMountConfigValue } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export const VFOLDER_MOUNTS = ['vfolderMounts'];
/** The deprecated mount-by-name field; only P-28 reads it. */
export const LEGACY_MOUNTS = ['mounts'];

const SET_FIELD: PatchWrite = { method: 'setFieldValue' };

const reasonOf = (id: string) => `sessionLauncher.rule.${id}`;

export type FolderCreatedPayload = { vfolderId: string; name: string };

export const storageSlice = defineSlice({
  name: 'storage',
  fields: [VFOLDER_MOUNTS, LEGACY_MOUNTS],
  inputs: {},
  intents: {
    // V-09: a folder created from the step is appended unless already mounted.
    // [bug-compat] H23: `setFieldValue`, so it reaches the URL only on the next sync.
    folderCreated: (
      values: LauncherValues,
      { vfolderId, name }: FolderCreatedPayload,
    ): Patch[] => {
      const mounts =
        (getIn(values, VFOLDER_MOUNTS) as VFolderMountConfigValue[]) ?? [];
      if (_.some(mounts, (mount) => mount.vfolderId === vfolderId)) return [];
      return [
        {
          path: VFOLDER_MOUNTS,
          value: [
            ...mounts,
            { vfolderId, name, mountDestination: '', subpath: '' },
          ],
          policy: 'force',
          reason: reasonOf('V-09'),
          write: SET_FIELD,
        },
      ];
    },
    // P-28: the checker's effect warns about a legacy `mounts` value, then
    // dispatches this to drop it; the write keeps that effect's timing.
    legacyMountsDiscarded: (): Patch[] => [
      {
        path: LEGACY_MOUNTS,
        value: undefined,
        policy: 'force',
        reason: reasonOf('P-28'),
        write: SET_FIELD,
      },
    ],
  },
  rules: [],
});
