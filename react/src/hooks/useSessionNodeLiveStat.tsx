import { useSessionNodeLiveStatSessionFragment$key } from '../__generated__/useSessionNodeLiveStatSessionFragment.graphql';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';

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
            }
          }
        }
      }
    `,
    kernelFrgmt,
  );

  const firstKernelNode = session?.kernel_nodes?.edges[0]?.node;
  const liveStat: SessionLiveStats = useMemo(() => {
    return JSON.parse(firstKernelNode?.live_stat ?? '{}');
  }, [firstKernelNode?.live_stat]);

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
