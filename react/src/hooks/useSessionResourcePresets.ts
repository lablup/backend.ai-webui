/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSessionResourcePresetsQuery } from '../__generated__/useSessionResourcePresetsQuery.graphql';
import type { ResourcePreset } from './useResourceLimitAndRemaining';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { FetchPolicy } from 'relay-runtime';

export interface SessionResourcePreset extends ResourcePreset {
  /** `null` for a global preset. */
  resource_group_name: string | null;
}

/**
 * The presets a session can launch with in `resourceGroupName` (global ones
 * included), from `checkPresetAvailabilityV2`. `allocatable` carries `available`.
 */
export const useSessionResourcePresets = ({
  projectId,
  resourceGroupName,
  fetchKey,
  fetchPolicy = 'store-or-network',
}: {
  projectId: string;
  resourceGroupName?: string | null;
  fetchKey?: string | number;
  fetchPolicy?: FetchPolicy;
}): SessionResourcePreset[] => {
  const { checkPresetAvailabilityV2 } =
    useLazyLoadQuery<useSessionResourcePresetsQuery>(
      graphql`
        query useSessionResourcePresetsQuery(
          $projectId: UUID!
          $resourceGroupName: String!
          $skip: Boolean!
        ) {
          checkPresetAvailabilityV2(
            input: {
              projectId: $projectId
              resourceGroupName: $resourceGroupName
            }
          ) @skip(if: $skip) {
            presets {
              id
              name
              resourceSlots {
                resourceType
                quantity
              }
              sharedMemory {
                expr
              }
              resourceGroupName
              available
            }
          }
        }
      `,
      {
        projectId,
        resourceGroupName: resourceGroupName ?? '',
        skip: !resourceGroupName,
      },
      { fetchKey, fetchPolicy },
    );

  const presets = checkPresetAvailabilityV2?.presets;
  return useMemo(
    () =>
      (presets ?? []).map((preset) => ({
        id: preset.id,
        name: preset.name,
        // Same shape as the REST `check-presets` slots: `Decimal` strings
        // such as "2.000" become "2", memory stays in bytes.
        resource_slots: Object.fromEntries(
          preset.resourceSlots.map((slot) => [
            slot.resourceType,
            String(parseFloat(String(slot.quantity))),
          ]),
        ) as ResourcePreset['resource_slots'],
        shared_memory: preset.sharedMemory?.expr ?? null,
        allocatable: preset.available,
        resource_group_name: preset.resourceGroupName ?? null,
      })),
    [presets],
  );
};
