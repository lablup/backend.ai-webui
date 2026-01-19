import { SessionIdleChecksNodeFragment$key } from '../../__generated__/SessionIdleChecksNodeFragment.graphql';
import { SessionIdleChecksQuery } from '../../__generated__/SessionIdleChecksQuery.graphql';
import {
  formatDurationAsDays,
  toFixedFloorWithoutTrailingZeros,
} from '../../helper';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip, Typography, theme } from 'antd';
import {
  useResourceSlotsDetails,
  useMemoizedJSONParse,
  BAIFlex,
  BAIDoubleTag,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

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
  fetchKeyForLegacyLoadQuery?: string;
}

export function getUtilizationCheckerColor(
  resources: Record<string, number[]> | number[],
  thresholds_check_operator: 'and' | 'or' | null = null,
) {
  // Determine color based on single device utilization.
  // resources: [number, number]
  if (!thresholds_check_operator) {
    const [utilization, threshold] = resources as number[];
    if (utilization < threshold * 2) {
      return 'red';
    } else if (utilization < threshold * 10) {
      return 'orange';
    } else {
      return 'green';
    }
  }
  // Determine color based on multiple device utilization.
  // resources: Record<string, [number, number]>
  let color: string | undefined = undefined;
  if (thresholds_check_operator === 'and') {
    _.every(resources, ([utilization, threshold]: number[]) => {
      if (utilization < Math.min(threshold * 2, threshold + 5)) {
        color = 'red';
        return true;
      } else if (utilization < Math.min(threshold * 10, threshold + 10)) {
        color = 'orange';
        return true;
      } else {
        color = 'green';
        return true;
      }
    });
  }

  if (thresholds_check_operator === 'or') {
    _.some(resources, ([utilization, threshold]: number[]) => {
      if (utilization < Math.min(threshold * 2, threshold + 5)) {
        color = 'red';
        return true;
      } else if (utilization < Math.min(threshold * 10, threshold + 10)) {
        color = 'orange';
        return true;
      } else {
        color = 'green';
        return true;
      }
    });
  }

  return color;
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
    );
  }

  return undefined;
}

const SessionIdleChecks: React.FC<SessionIdleChecksProps> = ({
  sessionNodeFrgmt = null,
  direction = 'row',
  fetchKeyForLegacyLoadQuery,
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const sessionNode = useFragment(
    graphql`
      fragment SessionIdleChecksNodeFragment on ComputeSessionNode {
        id
        idle_checks @since(version: "24.12.0")
      }
    `,
    sessionNodeFrgmt,
  );

  const { session } = useLazyLoadQuery<SessionIdleChecksQuery>(
    graphql`
      query SessionIdleChecksQuery($sessionID: UUID!) {
        session: compute_session(id: $sessionID) {
          id
          idle_checks @since(version: "24.09.0")
        }
      }
    `,
    {
      sessionID: sessionNode?.id || '',
    },
    {
      fetchKey: fetchKeyForLegacyLoadQuery,
      fetchPolicy: sessionNode?.idle_checks ? 'store-only' : 'network-only',
    },
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(
    sessionNode?.idle_checks || session?.idle_checks,
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
              {key === 'utilization' && (
                <Tooltip
                  title={
                    <>
                      {`${t('session.Utilization')} / ${t('session.Threshold')} (%)`}
                      <br />
                      {_.map(value.extra?.resources, (resource, key) => {
                        const deviceName = ['cpu_util', 'mem'].includes(key)
                          ? _.split(key, '_')[0]
                          : _.split(key, '_')[0] + '.device';
                        const [utilization, threshold] = resource;
                        return (
                          <BAIFlex key={key} gap={'xs'}>
                            <Typography.Text
                              style={{ color: token.colorWhite }}
                            >{`${mergedResourceSlots?.[deviceName]?.human_readable_name}:`}</Typography.Text>
                            <Typography.Text
                              style={{
                                color: getUtilizationCheckerColor(resource),
                              }}
                            >
                              {`${utilization >= 0 ? toFixedFloorWithoutTrailingZeros(utilization, 1) : '-'} / ${threshold}`}
                            </Typography.Text>
                            <br />
                          </BAIFlex>
                        );
                      })}
                    </>
                  }
                >
                  <InfoCircleOutlined
                    style={{
                      color: token.colorTextSecondary,
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
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
