/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionIdleChecksNodeFragment$key } from '../../__generated__/SessionIdleChecksNodeFragment.graphql';
import { SessionReclamationStatusCellFragment$key } from '../../__generated__/SessionReclamationStatusCellFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import QuestionIconWithTooltip from '../QuestionIconWithTooltip';
import SessionReclamationStatusCell from './SessionReclamationStatusCell';
import { getOverallReclamation } from './SessionReclamationStatusPopover';
import { Typography } from 'antd';
import {
  useMemoizedJSONParse,
  BAIFlex,
  BAIDoubleTag,
  BAIIntervalView,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useMemo } from 'react';
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

  // Determine color based on utilization, matching the overall badge color
  // shown by SessionReclamationStatusCell.
  if (result.extra && (!result.remaining || result.remaining < 3600 * 4)) {
    return getOverallReclamation(
      result.extra.resources,
      result.extra.thresholds_check_operator,
    )?.color;
  }

  return undefined;
}

const SessionIdleCheckItem: React.FC<{
  checkKey: keyof IdleChecks;
  value: IdleCheckItem;
  sessionFrgmt: SessionReclamationStatusCellFragment$key | null | undefined;
}> = ({ checkKey, value, sessionFrgmt }) => {
  'use memo';
  const { t } = useTranslation();

  const remaining = value.remaining ?? 0;

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

  const tagColor = getIdleChecksTagColor(
    value,
    checkKey === 'utilization' ? 'utilization' : 'remaining',
  );

  // Anchor the countdown to a fixed deadline so the timer ticks down toward it
  // as wall-clock time advances. `idle_checks` returns the remaining seconds
  // relative to fetch time, so the deadline is only recomputed when that value
  // changes (e.g. on refetch), not on every one-second interval tick.
  const deadline = useMemo(
    () => dayjs().add(remaining, 'second').toISOString(),
    [remaining],
  );

  return (
    <BAIFlex style={{ flex: 1 }} direction="column" align="stretch">
      <BAIFlex gap={'xxs'}>
        {checkKey === 'utilization' ? (
          <SessionReclamationStatusCell sessionFrgmt={sessionFrgmt} />
        ) : (
          <Typography.Text>{getIdleCheckTitle(checkKey)}</Typography.Text>
        )}
      </BAIFlex>

      {remaining >= 0 ? (
        <BAIFlex gap="xxs" align="center">
          <BAIIntervalView
            delay={1000}
            callback={() =>
              dayjs(deadline).diff() > 0
                ? formatDurationAsDays(dayjs().toISOString(), deadline)
                : '00:00:00'
            }
            render={(remainingTime) => (
              <BAIDoubleTag
                values={[
                  {
                    label: getRemainingTimeTypeLabel(value.remaining_time_type),
                    color: tagColor,
                  },
                  {
                    label: remainingTime,
                    color: tagColor,
                  },
                ]}
              />
            )}
          />
          {value.remaining_time_type === 'grace_period' && (
            <QuestionIconWithTooltip
              title={
                <div style={{ whiteSpace: 'pre-line' }}>
                  {t('session.GracePeriodTooltip')}
                </div>
              }
            />
          )}
        </BAIFlex>
      ) : (
        <Typography.Text type="warning">
          {t('session.ReclamationStatusChecking')}
        </Typography.Text>
      )}
    </BAIFlex>
  );
};

const SessionIdleChecks: React.FC<SessionIdleChecksProps> = ({
  sessionNodeFrgmt = null,
  direction = 'row',
}) => {
  const sessionNode = useFragment(
    graphql`
      fragment SessionIdleChecksNodeFragment on ComputeSessionNode {
        id
        idle_checks
        ...SessionReclamationStatusCellFragment
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

  return (
    <BAIFlex direction={direction} align="stretch" gap="sm">
      {_.map(idleChecks, (value: IdleCheckItem, key: keyof IdleChecks) => {
        if (!value.remaining) return null;

        return (
          <SessionIdleCheckItem
            key={key}
            checkKey={key}
            value={value}
            sessionFrgmt={sessionNode}
          />
        );
      })}
    </BAIFlex>
  );
};

export default SessionIdleChecks;
