/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { convertToBinaryUnit } from '../../../helper';
import type { RemainingSlots } from './resourceLimits';
import * as _ from 'lodash-es';

export interface ClusterCapacity {
  /** How many containers of the current size fit in what remains; `undefined` when nothing bounds it. */
  maxImmediateClusterSize: number | undefined;
  /** Where the "remaining" slider mark goes, clamped to `max_containers_per_session`. */
  remainingMarkValue: number | undefined;
}

/** R-42: immediate cluster capacity for the current per-container resources. */
export const computeClusterCapacity = ({
  remaining,
  resource,
  maxContainersPerSession,
}: {
  remaining: RemainingSlots;
  resource:
    | {
        cpu?: number;
        mem?: string;
        accelerator?: number;
        acceleratorType?: string;
      }
    | undefined;
  maxContainersPerSession: number | null | undefined;
}): ClusterCapacity => {
  const maxClusterCandidates: number[] = [];
  if (Number.isFinite(remaining.cpu) && (resource?.cpu as number) > 0) {
    maxClusterCandidates.push(
      Math.floor(remaining.cpu! / (resource?.cpu as number)),
    );
  }
  if (Number.isFinite(remaining.mem) && resource?.mem) {
    const memBytes = convertToBinaryUnit(resource.mem, '')?.number || 0;
    if (memBytes > 0) {
      maxClusterCandidates.push(Math.floor(remaining.mem! / memBytes));
    }
  }
  const accelType = resource?.acceleratorType;
  const accelValue = resource?.accelerator || 0;
  if (
    accelType &&
    accelValue > 0 &&
    Number.isFinite(remaining.accelerators[accelType])
  ) {
    maxClusterCandidates.push(
      Math.floor(remaining.accelerators[accelType]! / accelValue),
    );
  }
  const maxImmediateClusterSize =
    maxClusterCandidates.length > 0 ? _.min(maxClusterCandidates) : undefined;

  const remainingMarkValue =
    _.isNumber(maxImmediateClusterSize) && maxImmediateClusterSize >= 1
      ? _.isNumber(maxContainersPerSession)
        ? Math.min(maxImmediateClusterSize, maxContainersPerSession)
        : maxImmediateClusterSize
      : undefined;

  return { maxImmediateClusterSize, remainingMarkValue };
};

export interface ClusterSizeIssues {
  /** R-43: multi-node × 1 is sent as single-node (PAY-05). */
  multiNodeSizeOne: boolean;
  /** R-43: more containers than fit right now (only with `showRemainingWarning`). */
  exceedsImmediateCapacity: boolean;
}

/** R-43: the cluster-size warnings (both `warningOnly`). */
export const clusterSizeIssues = ({
  clusterMode,
  clusterSize,
  maxImmediateClusterSize,
  showRemainingWarning,
}: {
  clusterMode: string | undefined;
  clusterSize: number;
  maxImmediateClusterSize: number | undefined;
  showRemainingWarning: boolean;
}): ClusterSizeIssues => ({
  multiNodeSizeOne: clusterMode === 'multi-node' && clusterSize === 1,
  exceedsImmediateCapacity:
    showRemainingWarning &&
    clusterSize > 1 &&
    _.isNumber(maxImmediateClusterSize) &&
    maxImmediateClusterSize >= 1 &&
    clusterSize > maxImmediateClusterSize,
});
