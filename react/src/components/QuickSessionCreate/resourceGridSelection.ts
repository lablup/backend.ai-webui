/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionLauncherFormValue } from '../../pages/SessionLauncherPage';
import { getAutomaticShmem } from '../SessionFormItems/resourceAllocationRules';
import { atom } from 'jotai';
import * as _ from 'lodash-es';

/** What the user dragged on the resource-group grid; memory in GiB. */
export interface ResourceGridSelection {
  resourceGroup: string;
  cpu: number;
  memGiB: number;
  acceleratorType?: string;
  accelerator: number;
}

export const resourceGridSelectionAtom = atom<ResourceGridSelection | null>(
  null,
);

export const isEmptyResourceGridSelection = (
  selection: ResourceGridSelection | null,
) =>
  !selection ||
  (selection.cpu <= 0 && selection.memGiB <= 0 && selection.accelerator <= 0);

/** The quick-create form values a selection starts from. */
export const toQuickCreateInitialValues = (
  selection: ResourceGridSelection,
): DeepPartial<SessionLauncherFormValue> => {
  const mem =
    selection.memGiB > 0 ? `${_.round(selection.memGiB, 6)}g` : undefined;
  return {
    resourceGroup: selection.resourceGroup,
    allocationPreset: 'custom',
    resource: _.omitBy(
      {
        cpu: selection.cpu > 0 ? selection.cpu : undefined,
        mem,
        shmem: mem ? getAutomaticShmem(mem, '0g') : undefined,
        acceleratorType:
          selection.accelerator > 0 ? selection.acceleratorType : undefined,
        accelerator:
          selection.accelerator > 0 ? selection.accelerator : undefined,
      },
      _.isUndefined,
    ),
  };
};
