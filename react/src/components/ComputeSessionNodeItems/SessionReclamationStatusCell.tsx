/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusCellFragment$key } from '../../__generated__/SessionReclamationStatusCellFragment.graphql';
import { toFixedFloorWithoutTrailingZeros } from '../../helper';
import {
  IdleChecks,
  UtilizationCheckerResult,
  getUtilizationCheckerColor,
} from './SessionIdleChecks';
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

interface SessionReclamationStatusCellProps {
  sessionFrgmt: SessionReclamationStatusCellFragment$key | null;
}

const SessionReclamationStatusCell: React.FC<
  SessionReclamationStatusCellProps
> = ({ sessionFrgmt }) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const session = useFragment(
    graphql`
      fragment SessionReclamationStatusCellFragment on ComputeSessionNode {
        id
        idle_checks @since(version: "24.12.0")
      }
    `,
    sessionFrgmt,
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(session?.idle_checks, {
    fallbackValue: {},
  });

  const utilization = idleChecks.utilization;
  const extra = utilization?.extra;
  const resources = extra?.resources;

  if (!utilization || !resources) {
    return <>-</>;
  }

  const overall = getOverallReclamation(
    resources,
    extra.thresholds_check_operator,
  );

  if (!overall) {
    return <>-</>;
  }

  const colorMap: Record<ReclamationColor, { token: string; label: string }> = {
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
  const { token: badgeColor, label } = colorMap[overall.color];

  return (
    <BAIFlex gap="xxs" align="center">
      <Badge color={badgeColor} />
      <Typography.Text>{label}</Typography.Text>
      <Popover
        content={
          <BAIFlex direction="column" align="stretch" gap="xxs">
            <Typography.Text>
              {extra.thresholds_check_operator === 'or'
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
                  <Badge
                    color={resourceMeta?.token ?? token.colorTextDisabled}
                  />
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
    </BAIFlex>
  );
};

export default SessionReclamationStatusCell;
