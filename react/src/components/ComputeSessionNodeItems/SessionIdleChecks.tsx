/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionIdleChecksNodeFragment$key } from '../../__generated__/SessionIdleChecksNodeFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import SessionReclamationStatusPopover, {
  getUtilizationCheckerColor,
} from './SessionReclamationStatusPopover';
import { Typography } from 'antd';
import { useMemoizedJSONParse, BAIFlex, BAIDoubleTag } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type BaseExtra = null;
type UtilizationExtra = {
  resources: {
    cpu_util: number[];
    mem: number[];
    cuda_util: number[];
    cuda_mem: number[];
    ipu_util: number[];
    ipu_mem: number[];
  };
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

interface SessionIdleChecksProps {
  sessionNodeFrgmt: SessionIdleChecksNodeFragment$key | null;
  direction?: 'row' | 'column';
}

export function getIdleChecksTagColor(
  result: IdleCheckItem,
  criteria: 'remaining' | 'utilization',
) {
  // Determine color based on remaining time.
  if (criteria === 'remaining') {
    if (!result.remaining || result.remaining < 3600) {
      return 'red';
    } else if (result.remaining < 3600 * 4) {
      return 'orange';
    } else {
      return 'green';
    }
  }

  // Determine color based on utilization.
  if (result.extra && (!result.remaining || result.remaining < 3600 * 4)) {
    return getUtilizationCheckerColor(
      result.extra.resources,
      result.extra.thresholds_check_operator,
    )?.color;
  }

  return undefined;
}

const SessionIdleChecks: React.FC<SessionIdleChecksProps> = ({
  sessionNodeFrgmt = null,
  direction = 'row',
}) => {
  const { t } = useTranslation();

  const sessionNode = useFragment(
    graphql`
      fragment SessionIdleChecksNodeFragment on ComputeSessionNode {
        id
        idle_checks
      }
    `,
    sessionNodeFrgmt,
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(
    sessionNode?.idle_checks,
    {
      fallbackValue: {},
    },
  );

  const getIdleCheckTitle = (key: keyof IdleChecks) => {
    if (key === 'network_timeout') return t('session.NetworkIdleTimeout');
    else if (key === 'session_lifetime') return t('session.MaxSessionLifetime');
    else return t('session.UtilizationIdleTimeout');
  };

  const getRemainingTimeTypeLabel = (Type: 'expire_after' | 'grace_period') => {
    if (Type === 'expire_after') {
      return t('session.ExpiresAfter');
    } else {
      return t('session.GracePeriod');
    }
  };

  return (
    <BAIFlex direction={direction} align="stretch" gap="sm">
      {_.map(idleChecks, (value: IdleCheckItem, key: keyof IdleChecks) => {
        if (!value.remaining) return null;

        return (
          <BAIFlex
            key={key}
            style={{ flex: 1 }}
            direction="column"
            align="stretch"
          >
            <BAIFlex gap={'xxs'}>
              <Typography.Text>{getIdleCheckTitle(key)}</Typography.Text>
              {key === 'utilization' && value.extra && (
                <SessionReclamationStatusPopover
                  resources={value.extra.resources}
                  thresholdsCheckOperator={
                    value.extra.thresholds_check_operator
                  }
                />
              )}
            </BAIFlex>

            {value.remaining >= 0 ? (
              // TODO: support real-time update by using useIntervalValue when idle_checks returns remaining time as date
              <BAIDoubleTag
                values={[
                  {
                    label: getRemainingTimeTypeLabel(value.remaining_time_type),
                    color: getIdleChecksTagColor(
                      value,
                      key === 'utilization' ? 'utilization' : 'remaining',
                    ),
                  },
                  {
                    label: formatDurationAsDays(
                      new Date().toISOString(),
                      new Date(
                        new Date().getTime() + (value.remaining || 0) * 1000,
                      ).toISOString(),
                    ),
                    color: getIdleChecksTagColor(
                      value,
                      key === 'utilization' ? 'utilization' : 'remaining',
                    ),
                  },
                ]}
              />
            ) : (
              <Typography.Text type="danger">
                {t('session.TimeoutExceeded')}
              </Typography.Text>
            )}
          </BAIFlex>
        );
      })}
    </BAIFlex>
  );
};

export default SessionIdleChecks;
