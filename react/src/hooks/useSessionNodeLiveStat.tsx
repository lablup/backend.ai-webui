import { useSessionNodeLiveStatSessionFragment$key } from '../__generated__/useSessionNodeLiveStatSessionFragment.graphql';
import _ from 'lodash';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

interface ResourceStatItem {
  current: string;
  capacity: string;
  pct: string;
  unit_hint: string;
  'stats.max'?: string;
  'stats.avg'?: string;
  'stats.rate'?: string;
  [key: string]: string | undefined; // For any other potential stats fields
}

interface SessionLiveStats {
  cuda_util?: ResourceStatItem;
  cpu_util?: ResourceStatItem;
  cuda_mem?: ResourceStatItem;
  cpu_used?: ResourceStatItem;
  mem?: ResourceStatItem;
  io_read?: ResourceStatItem;
  io_write?: ResourceStatItem;
  net_rx?: ResourceStatItem;
  net_tx?: ResourceStatItem;
  io_scratch_size?: ResourceStatItem;
  [key: string]: ResourceStatItem | undefined; // For any other resource metrics that may be present
}

export const useSessionLiveStat = (
  kernelFrgmt: useSessionNodeLiveStatSessionFragment$key,
) => {
  const session = useFragment(
    graphql`
      fragment useSessionNodeLiveStatSessionFragment on ComputeSessionNode {
        id
        kernel_nodes {
          edges {
            node {
              live_stat
              cluster_role
            }
          }
        }
      }
    `,
    kernelFrgmt,
  );

  // TODO: replace this with session live_stat after implementation
  // Sum live_stat values across all kernel_nodes in client side for now.
  const liveStat: SessionLiveStats = useMemo(() => {
    const edges = session?.kernel_nodes?.edges ?? [];
    const statsList: SessionLiveStats[] = edges.map((edge) => {
      return JSON.parse(edge?.node?.live_stat || '{}');
    });
    // Use lodash to merge and sum values
    const allKeys: Array<keyof SessionLiveStats> = _.uniq(
      _.flatMap(statsList, (stats) => _.keys(stats)),
    );
    const merged: SessionLiveStats = {};
    allKeys.forEach((key) => {
      // Gather all ResourceStatItem objects for this key, narrow type
      const items = statsList
        .map((stats) => stats[key])
        .filter((item): item is ResourceStatItem => !!item);
      if (items.length === 0) return;
      // List of fields to sum
      const sumFields = ['current', 'capacity'];
      // List of fields to average
      const avgFields = ['stats.max', 'stats.avg', 'stats.rate'];
      // Sum numeric fields using lodash
      const summed: ResourceStatItem = {} as ResourceStatItem;
      sumFields.forEach((field) => {
        summed[field] = String(
          _.sumBy(items, (item) => Number(_.get(item, field) ?? '0')),
        );
      });
      // Average numeric fields using lodash
      avgFields.forEach((field) => {
        summed[field] = String(
          _.meanBy(items, (item) => Number(_.get(item, field) ?? '0')),
        );
      });
      // Calculate pct as (current / capacity) * 100
      const current = Number(summed.current ?? '0');
      const capacity = Number(summed.capacity ?? '0');
      summed.pct = capacity > 0 ? ((current / capacity) * 100).toFixed(2) : '0';
      // Use the first non-empty unit_hint
      summed.unit_hint = items.find((item) => item.unit_hint)?.unit_hint ?? '';
      // Copy any other fields from the first item (if exists)
      const firstItem = items[0];
      if (firstItem) {
        // Get all possible field paths including nested ones
        const allFieldPaths = [
          ...Object.keys(firstItem),
          ...avgFields.filter((field) => _.has(firstItem, field)),
        ];

        allFieldPaths.forEach((field) => {
          if (
            !sumFields.includes(field) &&
            !avgFields.includes(field) &&
            field !== 'unit_hint' &&
            field !== 'pct'
          ) {
            _.set(summed, field, _.get(firstItem, field) ?? '');
          }
        });
      }
      merged[key] = summed;
    });
    return merged;
  }, [session?.kernel_nodes?.edges]);

  const sortedLiveStatArray = useMemo(
    () =>
      _.keys(liveStat)
        .sort((a, b) => {
          const aUtil = a.includes('_util');
          const bUtil = b.includes('_util');
          const aMem = a.includes('_mem');
          const bMem = b.includes('_mem');

          if (aUtil && !bUtil) return -1;
          if (!aUtil && bUtil) return 1;
          if (aMem && !bMem) return -1;
          if (!aMem && bMem) return 1;

          return 0;
        })
        .map((key) => ({
          key,
          value: liveStat[key],
        })),
    [liveStat],
  );

  return { liveStat, sortedLiveStatArray };
};
