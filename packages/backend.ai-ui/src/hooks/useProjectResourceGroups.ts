import { useSuspenseTanQuery } from '../helper/reactQueryAlias';
import { useBAISignedRequestWithPromise } from './useBAISignedRequestWithPromise';
import _ from 'lodash';

export interface ScalingGroupItem {
  name: string;
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
  const baiRequestWithPromise = useBAISignedRequestWithPromise();

  const { data } = useSuspenseTanQuery<ProjectResourceGroupsQueryResult>({
    queryKey: ['ResourceGroupSelectQuery', projectName],
    queryFn: () => {
      // Short-circuit when there is no project context yet — avoids hitting
      // `/scaling-groups?group=` and `/folders/_/hosts` with an unscoped query.
      if (!projectName) {
        return Promise.resolve(null);
      }
      const search = new URLSearchParams();
      search.set('group', projectName);
      return Promise.all([
        baiRequestWithPromise({
          method: 'GET',
          url: `/scaling-groups?${search.toString()}`,
        }),
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders/_/hosts`,
        }),
      ]);
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
