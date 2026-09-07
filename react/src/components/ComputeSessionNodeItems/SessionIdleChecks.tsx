/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionIdleChecksNodeFragment$key } from '../../__generated__/SessionIdleChecksNodeFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import { SessionReclamationStatus } from './SessionReclamationStatusCell';
import {
  getIdleChecksTagColor,
  type IdleCheckItem,
  type IdleChecks,
} from './idleChecks';
import { Text } from '@astryxdesign/core/Text';
import * as stylex from '@stylexjs/stylex';
import {
  useMemoizedJSONParse,
  BAIFlex,
  BAIDoubleTag,
  BAIIntervalView,
  BAIQuestionIconWithTooltip,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface SessionIdleChecksProps {
  sessionNodeFrgmt: SessionIdleChecksNodeFragment$key | null;
  direction?: 'row' | 'column';
}

const styles = stylex.create({
  // antd `Typography.Text type="warning"` — Astryx TextColor has no warning
  // hue (MAPPING.md §3.4); the semantic warning token is applied directly.
  // `--color-warning` is a declared Astryx variable (verified, P19).
  warningText: {
    color: 'var(--color-warning)',
  },
});

const SessionIdleCheckItem: React.FC<{
  checkKey: keyof IdleChecks;
  value: IdleCheckItem;
}> = ({ checkKey, value }) => {
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
          <SessionReclamationStatus utilizationCheck={value} />
        ) : (
          <Text>{getIdleCheckTitle(checkKey)}</Text>
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
            <BAIQuestionIconWithTooltip
              title={
                <div style={{ whiteSpace: 'pre-line' }}>
                  {t('session.GracePeriodTooltip')}
                </div>
              }
            />
          )}
        </BAIFlex>
      ) : (
        <Text xstyle={styles.warningText}>
          {t('session.ReclamationStatusChecking')}
        </Text>
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

        return <SessionIdleCheckItem key={key} checkKey={key} value={value} />;
      })}
    </BAIFlex>
  );
};

export default SessionIdleChecks;
