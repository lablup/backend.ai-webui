import { useSessionNodeLiveStatSessionFragment$key } from '../__generated__/useSessionNodeLiveStatSessionFragment.graphql';
import { Big } from 'big.js';
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
      try {
        return JSON.parse(edge?.node?.live_stat || '{}');
      } catch (e) {
        console.error('Failed to parse live_stat:', e);
        return {};
      }
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
      // Sum numeric fields using Big.js for better precision
      const summed: ResourceStatItem = {} as ResourceStatItem;
      sumFields.forEach((field) => {
        const sum = items.reduce((acc, item) => {
          const value = _.get(item, field) ?? '0';
          try {
            return acc.plus(new Big(value));
          } catch (e) {
            console.error(`Failed to parse value for ${field}:`, value, e);
            return acc;
          }
        }, new Big(0));
        summed[field] = sum.toString();
      });
      // Average numeric fields using Big.js
      avgFields.forEach((field) => {
        const sum = items.reduce((acc, item) => {
          const value = _.get(item, field) ?? '0';
          try {
            return acc.plus(new Big(value));
          } catch (e) {
            console.error(`Failed to parse value for ${field}:`, value, e);
            return acc;
          }
        }, new Big(0));
        const avg = items.length > 0 ? sum.div(items.length) : new Big(0);
        summed[field] = avg.toString();
      });
      // Calculate pct as (current / capacity) * 100 using Big.js
      const current = new Big(summed.current ?? '0');
      const capacity = new Big(summed.capacity ?? '0');
      summed.pct = capacity.gt(0)
        ? current.div(capacity).times(100).toFixed(2)
        : '0';
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
