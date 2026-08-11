/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusPopoverFragment$key } from '../../__generated__/SessionReclamationStatusPopoverFragment.graphql';
import { toFixedFloorWithoutTrailingZeros } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import type { IdleChecks } from './SessionIdleChecks';
import { Divider } from '@astryxdesign/core/Divider';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { useMemoizedJSONParse, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type UtilizationCheckerResult = {
  color: 'red' | 'orange' | 'green';
  /**
   * The utilization percentage the color pivots on: red is bounded above by
   * this value, orange/green by the green cutoff. Exposed so callers can show
   * the exact "%" that produced the color.
   */
  boundary: number;
};

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

type ReclamationColor = UtilizationCheckerResult['color'];

// Severity ordering: red (most severe) < orange < green (least severe).
const RECLAMATION_SEVERITY: Record<ReclamationColor, number> = {
  red: 0,
  orange: 1,
  green: 2,
};

// Legend rows in display order: safe (green), warning (yellow), at risk (red).
const RECLAMATION_LEGENDS: { color: ReclamationColor; descKey: string }[] = [
  { color: 'green', descKey: 'session.ReclamationStatusLegendGreen' },
  { color: 'orange', descKey: 'session.ReclamationStatusLegendYellow' },
  { color: 'red', descKey: 'session.ReclamationStatusLegendRed' },
];

/**
 * Derive the overall reclamation-risk color from the per-resource
 * utilization/threshold pairs, honoring `thresholds_check_operator`.
 *
 * The idle reclamation checker deletes a session when the operator condition is
 * met across resources:
 * - `or`  → the session is reclaimed if ANY resource is under its threshold,
 *           so the WORST (most severe) resource color wins.
 * - `and` → the session is reclaimed only if ALL resources are under their
 *           thresholds, so a single comfortable resource keeps it safe and the
 *           BEST (least severe) resource color wins.
 *
 * Each resource is classified via `getUtilizationCheckerColor`; resources with
 * no data (negative utilization, rendered as "-") are excluded.
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
 * Astryx `StatusDot` variant and status label for each reclamation color.
 * (astryx ticket 17: antd `Badge color={token}` dots became `StatusDot`s, so
 * the map now carries the closed-enum variant instead of a theme token.)
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

interface SessionReclamationStatusPopoverProps {
  sessionFrgmt: SessionReclamationStatusPopoverFragment$key | null | undefined;
}

/**
 * Info icon opening a popover that explains the idle-reclamation state: an
 * operator-aware condition sentence, one traffic-light row per resource with
 * its current average vs. threshold, and a legend describing each level.
 * Renders nothing while the utilization checker has no measurement data yet
 * (e.g. during the grace period).
 */
const SessionReclamationStatusPopover: React.FC<
  SessionReclamationStatusPopoverProps
> = ({ sessionFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const colorMap = useReclamationColorMap();

  const session = useFragment(
    graphql`
      fragment SessionReclamationStatusPopoverFragment on ComputeSessionNode {
        id
        idle_checks
      }
    `,
    sessionFrgmt,
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(session?.idle_checks, {
    fallbackValue: {},
  });

  const extra = idleChecks.utilization?.extra;
  if (!extra) {
    return null;
  }
  const { resources, thresholds_check_operator: thresholdsCheckOperator } =
    extra;

  return (
    // antd hover-triggered Popover (mouseEnterDelay 0) -> Astryx HoverCard
    // (MAPPING.md §3.7: hover trigger branch; Astryx Popover is click-only).
    <HoverCard
      delay={0}
      content={
        <BAIFlex direction="column" align="stretch" gap="xxs">
          <Text>
            {thresholdsCheckOperator === 'or'
              ? t('session.ReclamationStatusConditionAnyDesc')
              : t('session.ReclamationStatusConditionAllDesc')}
          </Text>
          {_.map(resources, (resource, key) => {
            const deviceName = ['cpu_util', 'mem'].includes(key)
              ? _.split(key, '_')[0]
              : _.split(key, '_').slice(0, -1).join('-') + '.device';
            const [util, threshold] = resource;
            const resourceStatus =
              util >= 0 ? getUtilizationCheckerColor(resource) : undefined;
            const resourceMeta = resourceStatus
              ? colorMap[resourceStatus.color]
              : undefined;
            return (
              <BAIFlex key={key} gap="xxs" align="center">
                <StatusDot
                  variant={resourceMeta?.variant ?? 'neutral'}
                  label={resourceMeta?.label ?? '-'}
                />
                <Text>
                  {`${mergedResourceSlots?.[deviceName]?.human_readable_name ?? deviceName} ${resourceMeta?.label ?? '-'}`}
                </Text>
                <Text color="secondary">
                  {t('session.ReclamationStatusCurrentVsThreshold', {
                    current:
                      util >= 0
                        ? toFixedFloorWithoutTrailingZeros(util, 1)
                        : '-',
                    threshold,
                  })}
                </Text>
              </BAIFlex>
            );
          })}
          <Divider />
          <Text color="secondary">
            {t('session.ReclamationStatusLegendTitle')}
          </Text>
          {RECLAMATION_LEGENDS.map(({ color, descKey }) => (
            <BAIFlex key={color} gap="xxs" align="center">
              <StatusDot
                variant={colorMap[color].variant}
                label={colorMap[color].label}
              />
              <Text>{`${colorMap[color].label}: ${t(descKey)}`}</Text>
            </BAIFlex>
          ))}
        </BAIFlex>
      }
    >
      <Info
        style={{ color: 'var(--color-text-secondary)', cursor: 'pointer' }}
        size="1em"
      />
    </HoverCard>
  );
};

export default SessionReclamationStatusPopover;
