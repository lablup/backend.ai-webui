/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useSessionResourcePresetsQuery,
  useSessionResourcePresetsQuery$data,
} from '../__generated__/useSessionResourcePresetsQuery.graphql';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { FetchPolicy } from 'relay-runtime';

export type PresetAvailabilityV2 = NonNullable<
  useSessionResourcePresetsQuery$data['checkPresetAvailabilityV2']
>['presets'][number];

/**
 * The `checkPresetAvailabilityV2` presets a session can launch with in
 * `resourceGroupName` (global ones included), as the API returns them.
 * Pass `skip` while the resource group is not known yet; it returns `[]` then.
 */
export const useSessionResourcePresets = ({
  projectId,
  resourceGroupName,
  skip,
  fetchKey,
  fetchPolicy = 'store-or-network',
}: {
  projectId: string;
  resourceGroupName?: string | null;
  skip: boolean;
  fetchKey?: string | number;
  fetchPolicy?: FetchPolicy;
}): ReadonlyArray<PresetAvailabilityV2> => {
  'use memo';
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
              # Aliased so Relay keys each row by its query path: id is the
              # preset id, shared by every resource group's answer.
              presetId: id
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
        skip,
      },
      { fetchKey, fetchPolicy },
    );

  return checkPresetAvailabilityV2?.presets ?? [];
};
