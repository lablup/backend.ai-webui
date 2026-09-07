/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';

type BaseExtra = null;

export type UtilizationExtra = {
  // Keyed by the configured resource slots (`cpu_util`, `mem`, `cuda_util`, …);
  // the manager reports only the slots the session actually has.
  resources: Record<string, number[]>;
  thresholds_check_operator: 'and' | 'or';
};

export type IdleCheckItem = {
  extra: BaseExtra | UtilizationExtra;
  remaining: number | null;
  remaining_time_type: 'expire_after' | 'grace_period';
};

export type IdleChecks = {
  network_timeout?: IdleCheckItem;
  session_lifetime?: IdleCheckItem;
  utilization?: IdleCheckItem;
};

export type UtilizationCheckerResult = {
  color: 'red' | 'orange' | 'green';
  /**
   * The utilization percentage the color pivots on: red is bounded above by
   * this value, orange/green by the green cutoff. Exposed so callers can show
   * the exact "%" that produced the color.
   */
  boundary: number;
};

export type ReclamationColor = UtilizationCheckerResult['color'];

export function getUtilizationCheckerColor(
  resource: number[],
): UtilizationCheckerResult {
  const [utilization, threshold] = resource;
  if (utilization < threshold * 2) {
    return { color: 'red', boundary: threshold * 2 };
  } else if (utilization < threshold * 10) {
    return { color: 'orange', boundary: threshold * 10 };
  }
  return { color: 'green', boundary: threshold * 10 };
}

// Severity ordering: red (most severe) < orange < green (least severe).
const RECLAMATION_SEVERITY: Record<ReclamationColor, number> = {
  red: 0,
  orange: 1,
  green: 2,
};

// Legend rows in display order: safe (green), warning (yellow), at risk (red).
export const RECLAMATION_LEGENDS: {
  color: ReclamationColor;
  descKey: string;
}[] = [
  { color: 'green', descKey: 'session.ReclamationStatusLegendGreen' },
  { color: 'orange', descKey: 'session.ReclamationStatusLegendYellow' },
  { color: 'red', descKey: 'session.ReclamationStatusLegendRed' },
];

/**
 * Derive the overall reclamation-risk color from the per-resource
 * utilization/threshold pairs, honoring `thresholds_check_operator`:
 * - `or`  → the session is reclaimed if ANY resource is under its threshold,
 *           so the WORST (most severe) resource color wins.
 * - `and` → the session is reclaimed only if ALL resources are under their
 *           thresholds, so the BEST (least severe) resource color wins.
 *
 * Resources with no data (negative utilization, rendered as "-") are excluded.
 */
export function getOverallReclamation(
  resources: Record<string, number[]>,
  thresholds_check_operator: 'and' | 'or',
): UtilizationCheckerResult | undefined {
  const entries = Object.values(resources)
    .filter(([utilization]) => utilization >= 0)
    .map((resource) => getUtilizationCheckerColor(resource));

  if (_.isEmpty(entries)) {
    return undefined;
  }

  const pick = thresholds_check_operator === 'or' ? _.minBy : _.maxBy;
  return pick(entries, (entry) => RECLAMATION_SEVERITY[entry.color]);
}

/**
 * Tag color for one idle check: by remaining time for the time-based checks,
 * by the overall reclamation color for the utilization check (so the tag
 * matches the badge shown next to it).
 */
export function getIdleChecksTagColor(
  result: IdleCheckItem,
  criteria: 'remaining' | 'utilization',
): ReclamationColor | undefined {
  if (criteria === 'remaining') {
    if (!result.remaining || result.remaining < 3600) {
      return 'red';
    } else if (result.remaining < 3600 * 4) {
      return 'orange';
    } else {
      return 'green';
    }
  }

  if (result.extra && (!result.remaining || result.remaining < 3600 * 4)) {
    return getOverallReclamation(
      result.extra.resources,
      result.extra.thresholds_check_operator,
    )?.color;
  }

  return undefined;
}

/**
 * Astryx `StatusDot` variant and status label for each reclamation color.
 */
export const useReclamationColorMap = (): Record<
  ReclamationColor,
  { variant: 'success' | 'warning' | 'error'; label: string }
> => {
  const { t } = useTranslation();
  return {
    red: {
      variant: 'error',
      label: t('session.ReclamationStatusAtRisk'),
    },
    orange: {
      variant: 'warning',
      label: t('session.ReclamationStatusWarning'),
    },
    green: {
      variant: 'success',
      label: t('session.ReclamationStatusSafe'),
    },
  };
};
