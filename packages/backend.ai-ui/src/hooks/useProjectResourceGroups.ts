import { useSuspenseTanQuery } from '../helper/reactQueryAlias';
import { useBAISignedRequestWithPromise } from './useBAISignedRequestWithPromise';
import * as _ from 'lodash-es';

export interface ScalingGroupItem {
  name: string;
}

/**
 * Thrown when the vfolder host info fetch (`/folders/_/hosts`) inside
 * `useProjectResourceGroups` fails. Tagging the failure lets callers wrap
 * the hook with a dedicated error boundary that can distinguish this
 * specific case from unrelated render errors and surface a targeted
 * message (and discriminate it from the parallel scaling-groups fetch
 * failure, which is re-thrown as-is so an outer boundary handles it).
 */
export class StorageHostFetchError extends Error {
  readonly originalError: unknown;
  constructor(originalError: unknown) {
    super(
      originalError instanceof Error
        ? originalError.message
        : 'Failed to fetch storage host information.',
    );
    this.name = 'StorageHostFetchError';
    this.originalError = originalError;
  }
}

interface VolumeInfo {
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups?: string[];
}

type ProjectResourceGroupsQueryResult =
  | [
      {
        scaling_groups: ScalingGroupItem[];
      },
      {
        allowed: string[];
        default: string;
        volume_info: {
          [key: string]: VolumeInfo;
        };
      },
    ]
  | null;

interface UseProjectResourceGroupsOptions {
  /**
   * Optional additional filter applied after SFTP scaling groups are excluded.
   * Receives the resource group (scaling group) name and should return `true`
   * to keep it in the result.
   */
  filter?: (resourceGroupName: string) => boolean;
}

/**
 * Fetches the resource groups accessible to the given project for the current
 * user, excluding SFTP-only scaling groups. Shared by
 * `BAIProjectResourceGroupSelect` and any caller that needs to reason about
 * the available resource groups (e.g. to decide whether to show a selector or
 * auto-deploy). Both call sites use the same React Query key so a single
 * network request is made per `projectName`.
 *
 * If `projectName` is empty/falsy, the hook short-circuits and returns an
 * empty list without issuing any network request — callers that haven't yet
 * resolved the current project can pass `''` safely.
 */
export const useProjectResourceGroups = (
  projectName: string,
  options?: UseProjectResourceGroupsOptions,
) => {
  'use memo';
  const baiRequestWithPromise = useBAISignedRequestWithPromise();

  const { data } = useSuspenseTanQuery<ProjectResourceGroupsQueryResult>({
    queryKey: ['ResourceGroupSelectQuery', projectName],
    queryFn: async () => {
      // Short-circuit when there is no project context yet — avoids hitting
      // `/scaling-groups?group=` and `/folders/_/hosts` with an unscoped query.
      if (!projectName) {
        return null;
      }
      const search = new URLSearchParams();
      search.set('group', projectName);
      // Run both fetches concurrently but discriminate failures: a host-info
      // failure is tagged with `StorageHostFetchError` so a dedicated boundary
      // can surface it, while a scaling-groups failure is re-thrown as-is and
      // bubbles up to the generic error boundary. Host-info failure takes
      // precedence when both fail because SFTP filtering depends on it and
      // the result is otherwise unusable.
      const [scalingGroupsResult, hostsResult] = await Promise.allSettled([
        baiRequestWithPromise({
          method: 'GET',
          url: `/scaling-groups?${search.toString()}`,
        }),
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders/_/hosts`,
        }),
      ]);
      if (hostsResult.status === 'rejected') {
        throw new StorageHostFetchError(hostsResult.reason);
      }
      if (scalingGroupsResult.status === 'rejected') {
        throw scalingGroupsResult.reason;
      }
      return [
        scalingGroupsResult.value,
        hostsResult.value,
      ] as unknown as NonNullable<ProjectResourceGroupsQueryResult>;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const sftpResourceGroups = _.flatMap(
    data?.[1]?.volume_info,
    (item) => item?.sftp_scaling_groups ?? [],
  );

  const resourceGroups = _.filter(
    data?.[0]?.scaling_groups ?? [],
    (item: ScalingGroupItem) => {
      if (_.includes(sftpResourceGroups, item.name)) {
        return false;
      }
      if (options?.filter) {
        return options.filter(item.name);
      }
      return true;
    },
  );

  return { resourceGroups };
};
