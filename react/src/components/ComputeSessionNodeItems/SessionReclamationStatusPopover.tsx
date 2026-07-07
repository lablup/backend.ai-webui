/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusPopoverFragment$key } from '../../__generated__/SessionReclamationStatusPopoverFragment.graphql';
import { toFixedFloorWithoutTrailingZeros } from '../../helper';
import type { IdleChecks } from './SessionIdleChecks';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Badge, Divider, Popover, Typography, theme } from 'antd';
import {
  useResourceSlotsDetails,
  useMemoizedJSONParse,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  resources: Record<string, number[]> | number[],
  thresholds_check_operator: 'and' | 'or' | null = null,
): UtilizationCheckerResult | undefined {
  // Determine color based on single device utilization.
  // resources: [number, number]
  if (!thresholds_check_operator) {
    const [utilization, threshold] = resources as number[];
    if (utilization < threshold * 2) {
      return { color: 'red', boundary: threshold * 2 };
    } else if (utilization < threshold * 10) {
      return { color: 'orange', boundary: threshold * 10 };
    } else {
      return { color: 'green', boundary: threshold * 10 };
    }
  }
  // Determine color based on multiple device utilization.
  // resources: Record<string, [number, number]>
  const classify = ([utilization, threshold]: number[]) => {
    const redBoundary = Math.min(threshold * 2, threshold + 5);
    const greenBoundary = Math.min(threshold * 10, threshold + 10);
    if (utilization < redBoundary) {
      return { color: 'red', boundary: redBoundary } as const;
    } else if (utilization < greenBoundary) {
      return { color: 'orange', boundary: greenBoundary } as const;
    }
    return { color: 'green', boundary: greenBoundary } as const;
  };

  let result: UtilizationCheckerResult | undefined = undefined;
  if (thresholds_check_operator === 'and') {
    _.every(resources, (resource: number[]) => {
      result = classify(resource);
      return true;
    });
  }

  if (thresholds_check_operator === 'or') {
    _.some(resources, (resource: number[]) => {
      result = classify(resource);
      return true;
    });
  }

  return result;
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
  const entries = _.compact(
    Object.values(resources)
      .filter(([utilization]) => utilization >= 0)
      .map((resource) => getUtilizationCheckerColor(resource)),
  );

  if (_.isEmpty(entries)) {
    return undefined;
  }

  const pick = thresholds_check_operator === 'or' ? _.minBy : _.maxBy;
  return pick(entries, (entry) => RECLAMATION_SEVERITY[entry.color]);
}

/** Badge color token and status label for each reclamation color. */
export const useReclamationColorMap = (): Record<
  ReclamationColor,
  { token: string; label: string }
> => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  return {
    red: {
      token: token.colorError,
      label: t('session.ReclamationStatusAtRisk'),
    },
    orange: {
      token: token.colorWarning,
      label: t('session.ReclamationStatusWarning'),
    },
    green: {
      token: token.colorSuccess,
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
  const { token } = theme.useToken();
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
    <Popover
      mouseEnterDelay={0}
      content={
        <BAIFlex direction="column" align="stretch" gap="xxs">
          <Typography.Text>
            {thresholdsCheckOperator === 'or'
              ? t('session.ReclamationStatusConditionAnyDesc')
              : t('session.ReclamationStatusConditionAllDesc')}
          </Typography.Text>
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
                <Badge color={resourceMeta?.token ?? token.colorTextDisabled} />
                <Typography.Text>
                  {`${mergedResourceSlots?.[deviceName]?.human_readable_name ?? deviceName} ${resourceMeta?.label ?? '-'}`}
                </Typography.Text>
                <Typography.Text type="secondary">
                  {t('session.ReclamationStatusCurrentVsThreshold', {
                    current:
                      util >= 0
                        ? toFixedFloorWithoutTrailingZeros(util, 1)
                        : '-',
                    threshold,
                  })}
                </Typography.Text>
              </BAIFlex>
            );
          })}
          <Divider style={{ margin: `${token.marginXXS}px 0` }} />
          <Typography.Text type="secondary">
            {t('session.ReclamationStatusLegendTitle')}
          </Typography.Text>
          {RECLAMATION_LEGENDS.map(({ color, descKey }) => (
            <BAIFlex key={color} gap="xxs" align="center">
              <Badge color={colorMap[color].token} />
              <Typography.Text>
                {`${colorMap[color].label}: ${t(descKey)}`}
              </Typography.Text>
            </BAIFlex>
          ))}
        </BAIFlex>
      }
    >
      <InfoCircleOutlined
        style={{ color: token.colorTextSecondary, cursor: 'pointer' }}
      />
    </Popover>
  );
};

export default SessionReclamationStatusPopover;
