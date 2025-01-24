import {
  getIdleChecksTagColor,
  getUtilizationCheckerColor,
  toFixedFloorWithoutTrailingZeros,
} from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import BAIIntervalView from '../BAIIntervalView';
import DoubleTag from '../DoubleTag';
import Flex from '../Flex';
import { SessionIdleChecksFragment$key } from './__generated__/SessionIdleChecksFragment.graphql';
import { SessionIdleChecksNodeFragment$key } from './__generated__/SessionIdleChecksNodeFragment.graphql';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

type BaseExtra = any | null;
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
  sessionNodeFrgmt?: SessionIdleChecksNodeFragment$key | null;
  sessionFrgmt?: SessionIdleChecksFragment$key | null;
  direction?: 'row' | 'column';
}

const SessionIdleChecks: React.FC<SessionIdleChecksProps> = ({
  sessionNodeFrgmt = null,
  sessionFrgmt = null,
  direction = 'row',
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();
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
  const session = useFragment(
    graphql`
      fragment SessionIdleChecksFragment on ComputeSession {
        id
        idle_checks @since(version: "24.09.0")
      }
    `,
    sessionFrgmt,
  );

  const idleChecks: IdleChecks = JSON.parse(
    sessionNode?.idle_checks || session?.idle_checks || '{}',
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
    <Flex direction={direction} align="stretch" gap="sm">
      {_.map(idleChecks, (value: IdleCheckItem, key: keyof IdleChecks) => {
        const startTime = new Date();
        if (!value.remaining) return null;

        return (
          <Flex
            key={key}
            style={{ flex: 1 }}
            direction="column"
            align="stretch"
          >
            <Flex gap={'xxs'}>
              <Typography.Text>{getIdleCheckTitle(key)}</Typography.Text>
              {key === 'utilization' && (
                <Tooltip
                  title={
                    <>
                      {`${t('session.Utilization')} / ${t('session.Threshold')} (%)`}
                      <br />
                      {_.map(value.extra.resources, (resource, key) => {
                        const deviceName = ['cpu_util', 'mem'].includes(key)
                          ? _.split(key, '_')[0]
                          : _.split(key, '_')[0] + '.device';
                        const [utilization, threshold] = resource;
                        return (
                          <Flex key={key} gap={'xs'}>
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
                          </Flex>
                        );
                      })}
                    </>
                  }
                >
                  <QuestionCircleOutlined
                    style={{
                      color: token.colorTextSecondary,
                      cursor: 'pointer',
                    }}
                  />
                </Tooltip>
              )}
            </Flex>

            {value.remaining >= 0 ? (
              <BAIIntervalView
                callback={() => {
                  return baiClient.utils.elapsedTime(
                    // FIXME: does not support calculating remaining time in real-time seconds
                    new Date(),
                    startTime.getTime() + (value.remaining || 0) * 1000,
                  );
                }}
                delay={1000}
                render={(intervalValue) => (
                  <DoubleTag
                    values={[
                      {
                        label: getRemainingTimeTypeLabel(
                          value.remaining_time_type,
                        ),
                        color: getIdleChecksTagColor(
                          value,
                          key === 'utilization' ? 'utilization' : 'remaining',
                        ),
                      },
                      {
                        label: intervalValue,
                        color: getIdleChecksTagColor(
                          value,
                          key === 'utilization' ? 'utilization' : 'remaining',
                        ),
                      },
                    ]}
                  />
                )}
              />
            ) : (
              <Typography.Text type="danger">
                {t('session.TimeoutExceeded')}
              </Typography.Text>
            )}
          </Flex>
        );
      })}
    </Flex>
  );
};

export default SessionIdleChecks;
