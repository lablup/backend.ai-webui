/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusCellFragment$key } from '../../__generated__/SessionReclamationStatusCellFragment.graphql';
import { SessionReclamationStatusCellPolicyQuery } from '../../__generated__/SessionReclamationStatusCellPolicyQuery.graphql';
import { toFixedFloorWithoutTrailingZeros } from '../../helper';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import { IdleChecks, getUtilizationCheckerColor } from './SessionIdleChecks';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Badge, Spin, Tooltip, Typography, theme } from 'antd';
import {
  useResourceSlotsDetails,
  useMemoizedJSONParse,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

type ReclamationColor = 'red' | 'orange' | 'green';

// Severity ordering: red (most severe) < orange < green (least severe).
const RECLAMATION_SEVERITY: Record<ReclamationColor, number> = {
  red: 0,
  orange: 1,
  green: 2,
};

/**
 * Derive a single overall reclamation-risk color from the per-resource
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
 * Per-resource colors reuse `getUtilizationCheckerColor` (single-device path)
 * so the thresholds stay consistent with the session-detail idle-check display.
 * Resources with no data (negative utilization, rendered as "-") are excluded.
 */
export function getOverallReclamationColor(
  resources: Record<string, number[]>,
  thresholds_check_operator: 'and' | 'or',
): ReclamationColor | undefined {
  const colors = Object.values(resources)
    .filter(([utilization]) => utilization >= 0)
    .map(
      (resource) => getUtilizationCheckerColor(resource) as ReclamationColor,
    );

  if (_.isEmpty(colors)) {
    return undefined;
  }

  const pick = thresholds_check_operator === 'or' ? _.minBy : _.maxBy;
  return pick(colors, (color) => RECLAMATION_SEVERITY[color]);
}

/**
 * Lazily fetches the session's keypair resource policy `idle_timeout` (network
 * idle timeout, in seconds). Mounted only when the tooltip opens, so the query
 * fires on first hover; the enclosing <Suspense> renders the loading state.
 *
 * Single round-trip: `keypair(access_key)` yields the policy name, and
 * `keypair_resource_policies` yields every policy's idle_timeout, matched
 * client-side by name (avoids a name → policy waterfall).
 */
const SessionReclamationPolicyInfo: React.FC<{ accessKey: string }> = ({
  accessKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const data = useLazyLoadQuery<SessionReclamationStatusCellPolicyQuery>(
    graphql`
      query SessionReclamationStatusCellPolicyQuery($accessKey: String) {
        keypair(access_key: $accessKey) {
          resource_policy
        }
        keypair_resource_policies {
          name
          idle_timeout
        }
      }
    `,
    { accessKey },
    { fetchPolicy: 'store-or-network' },
  );

  const idleTimeout = _.find(
    data.keypair_resource_policies,
    (policy) => policy?.name === data.keypair?.resource_policy,
  )?.idle_timeout;

  return (
    <Typography.Text style={{ color: token.colorWhite }}>
      {`${t('session.IdleTimeout')}: ${idleTimeout != null ? `${idleTimeout}s` : '-'}`}
    </Typography.Text>
  );
};

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
  // Latched to true on the first tooltip hover so the policy query mounts once.
  const [tooltipOpened, setTooltipOpened] = useState(false);

  const session = useFragment(
    graphql`
      fragment SessionReclamationStatusCellFragment on ComputeSessionNode {
        id
        access_key
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

  // No utilization idle checker configured for this session → nothing to show.
  if (!utilization || !resources) {
    return <>-</>;
  }

  const overallColor = getOverallReclamationColor(
    resources,
    extra.thresholds_check_operator,
  );

  if (!overallColor) {
    return <>-</>;
  }

  const colorMap: Record<
    ReclamationColor,
    { token: string; label: string; legend: string }
  > = {
    red: {
      token: token.colorError,
      label: t('session.ReclamationStatusAtRisk'),
      legend: t('session.ReclamationStatusLegendRed'),
    },
    orange: {
      token: token.colorWarning,
      label: t('session.ReclamationStatusWarning'),
      legend: t('session.ReclamationStatusLegendYellow'),
    },
    green: {
      token: token.colorSuccess,
      label: t('session.ReclamationStatusSafe'),
      legend: t('session.ReclamationStatusLegendGreen'),
    },
  };
  const { token: badgeColor, label, legend } = colorMap[overallColor];

  return (
    <BAIFlex gap="xxs" align="center">
      <Badge color={badgeColor} />
      <Typography.Text>{label}</Typography.Text>
      <Tooltip
        onOpenChange={(open) => {
          if (open) setTooltipOpened(true);
        }}
        title={
          <BAIFlex direction="column" align="stretch" gap="xxs">
            <Typography.Text style={{ color: token.colorWhite }}>
              {t('session.ReclamationStatusTooltipTitle')}
            </Typography.Text>
            {_.map(resources, (resource, key) => {
              const deviceName = ['cpu_util', 'mem'].includes(key)
                ? _.split(key, '_')[0]
                : _.split(key, '_').slice(0, -1).join('-') + '.device';
              const [util, threshold] = resource;
              return (
                <BAIFlex key={key} gap="xs">
                  <Typography.Text style={{ color: token.colorWhite }}>
                    {`${mergedResourceSlots?.[deviceName]?.human_readable_name ?? deviceName}:`}
                  </Typography.Text>
                  <Typography.Text style={{ color: token.colorWhite }}>
                    {`${util >= 0 ? toFixedFloorWithoutTrailingZeros(util, 1) : '-'} / ${threshold}`}
                  </Typography.Text>
                </BAIFlex>
              );
            })}
            <Typography.Text style={{ color: token.colorWhite }}>
              {legend}
            </Typography.Text>
            {tooltipOpened && session?.access_key ? (
              <ErrorBoundaryWithNullFallback>
                <Suspense
                  fallback={
                    <BAIFlex gap="xs">
                      <Spin size="small" />
                      <Typography.Text style={{ color: token.colorWhite }}>
                        {`${t('session.IdleTimeout')}: …`}
                      </Typography.Text>
                    </BAIFlex>
                  }
                >
                  <SessionReclamationPolicyInfo
                    accessKey={session.access_key}
                  />
                </Suspense>
              </ErrorBoundaryWithNullFallback>
            ) : null}
          </BAIFlex>
        }
      >
        <InfoCircleOutlined
          style={{ color: token.colorTextSecondary, cursor: 'pointer' }}
        />
      </Tooltip>
    </BAIFlex>
  );
};

export default SessionReclamationStatusCell;
