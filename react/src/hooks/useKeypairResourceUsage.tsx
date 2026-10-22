/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../helper';
import { useResourceSlotsDetails } from './backendai';
import { useCurrentProjectValue } from './useCurrentProject';
import { useResourceLimitAndRemaining } from './useResourceLimitAndRemaining';
import { convertToNumber } from 'backend.ai-ui';
import * as _ from 'lodash-es';

export type KeypairResourceUsageRow = {
  key: string;
  name: string;
  /** Display values: memory in GiB, everything else as-is. */
  using: number;
  limit: number | null;
  unit: string;
  isAccelerator: boolean;
};

const toDisplay = (key: string, raw: string | number | null | undefined) => {
  const n = convertToNumber(raw);
  if (!Number.isFinite(n)) return n;
  if (key === 'mem') {
    return convertToBinaryUnit(_.toString(raw ?? 0), 'g', 1)?.number ?? 0;
  }
  return n;
};

/**
 * The user's keypair resource use against its policy limit, one row per
 * slot the current resource group offers. Suspends; reads the current
 * project, so keep it off project-agnostic pages.
 */
export const useKeypairResourceUsage = (fetchKey: string) => {
  'use memo';
  const currentProject = useCurrentProjectValue();
  const { resourceSlotsInRG } = useResourceSlotsDetails();
  const [{ checkPresetInfo, resourceLimitsWithoutResourceGroup }] =
    useResourceLimitAndRemaining({
      currentProjectName: currentProject.name ?? '',
      ignorePerContainerConfig: true,
      fetchKey,
    });

  const using = (checkPresetInfo?.keypair_using ?? {}) as Record<
    string,
    string | undefined
  >;
  const rows: KeypairResourceUsageRow[] = _.map(
    resourceSlotsInRG ?? {},
    (slot, key) => {
      const rawLimit =
        key === 'cpu'
          ? resourceLimitsWithoutResourceGroup.cpu?.max
          : key === 'mem'
            ? resourceLimitsWithoutResourceGroup.mem?.max
            : resourceLimitsWithoutResourceGroup.accelerators[key]?.max;
      const limit = toDisplay(key, rawLimit);
      return {
        key,
        name: slot?.human_readable_name ?? key,
        using: toDisplay(key, using[key] ?? 0),
        limit: Number.isFinite(limit) ? limit : null,
        unit: key === 'mem' ? 'GiB' : (slot?.display_unit ?? ''),
        isAccelerator: key !== 'cpu' && key !== 'mem',
      };
    },
  );
  return rows;
};
