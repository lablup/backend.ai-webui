/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSessionNodeLiveStatSessionFragment$key } from '../__generated__/useSessionNodeLiveStatSessionFragment.graphql';
import {
  mergeKernelLiveStats,
  parseLiveStat,
  SessionLiveStats,
} from '../helper/mergeKernelLiveStats';
import { useBAILogger } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { graphql, useFragment } from 'react-relay';

export type {
  ResourceStatItem,
  SessionLiveStats,
} from '../helper/mergeKernelLiveStats';

export const useSessionLiveStat = (
  kernelFrgmt: useSessionNodeLiveStatSessionFragment$key,
) => {
  'use memo';
  const { logger } = useBAILogger();

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

  const onError = (message: string, ...detail: unknown[]) =>
    logger.error(message, ...detail);

  // TODO: replace the client-side kernel merge with session live_stat once
  // the backend provides it.
  const edges = session?.kernel_nodes?.edges ?? [];
  const liveStat: SessionLiveStats = mergeKernelLiveStats(
    edges.map((edge) => parseLiveStat(edge?.node?.live_stat, onError)),
    onError,
  );

  const sortedLiveStatArray = _.keys(liveStat)
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
    }));

  return { liveStat, sortedLiveStatArray };
};
