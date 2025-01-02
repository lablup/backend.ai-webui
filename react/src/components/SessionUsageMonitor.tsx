import {
  convertBinarySizeUnit,
  convertDecimalSizeUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import Flex from './Flex';
import { SessionUsageMonitorFragment$key } from './__generated__/SessionUsageMonitorFragment.graphql';
import {
  Progress,
  ProgressProps,
  Tooltip,
  Typography,
  theme,
  Row,
  Col,
} from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';

interface SessionUsageMonitorProps extends ProgressProps {
  sessionFrgmt: SessionUsageMonitorFragment$key | null;
  size?: 'small' | 'default';
}

const SessionUsageMonitor: React.FC<SessionUsageMonitorProps> = ({
  sessionFrgmt,
  size = 'default',
}) => {
  const { token } = theme.useToken();
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const sessionNode = useFragment(
    graphql`
      fragment SessionUsageMonitorFragment on ComputeSessionNode {
        kernel_nodes {
          edges {
            node {
              live_stat
              occupied_slots
            }
          }
        }
      }
    `,
    sessionFrgmt,
  );

  const firstKernelNode = _.get(sessionNode, 'kernel_nodes.edges[0].node');
  const occupiedSlots = useMemo(
    () => JSON.parse(firstKernelNode?.occupied_slots ?? '{}'),
    [firstKernelNode?.occupied_slots],
  );
  const resourceSlotNames = _.keysIn(occupiedSlots);
  const liveStat = JSON.parse(
    _.get(sessionNode, 'kernel_nodes.edges[0].node.live_stat') ?? '{}',
  );

  // to display util first, mem second
  const sortedLiveStat = useMemo(
    () =>
      Object.keys(liveStat)
        .sort((a, b) => {
          const aUtil = a.includes('_util');
          const bUtil = b.includes('_util');
          const aMem = a.includes('_mem');
          const bMem = b.includes('_mem');

          if (aUtil && !bUtil) return -1;
          if (!aUtil && bUtil) return 1;
          if (aMem && !bMem) return -1;
          if (!aMem && bMem) return 1;

          return 0;
        })
        .reduce((acc: { [key: string]: any }, key) => {
          acc[key] = liveStat[key];
          return acc;
        }, {}),
    [liveStat],
  );

  const displayMemoryUsage = (
    current: string,
    capacity: string,
    decimalSize: number = 2,
  ) => {
    return `${convertBinarySizeUnit(current, 'g', decimalSize)?.numberFixed ?? '-'} / ${
      convertBinarySizeUnit(capacity, 'g', decimalSize)?.numberFixed ?? '-'
    } GiB`;
  };

  return (
    <Row gutter={[16, 16]}>
      {sortedLiveStat?.cpu_util ? (
        <Col xs={24} sm={12}>
          <Flex direction="column" align="stretch">
            {size === 'default' ? (
              <>
                <Typography.Text>
                  {mergedResourceSlots?.['cpu']?.human_readable_name}
                </Typography.Text>
                <BAIProgressWithLabel
                  percent={sortedLiveStat?.cpu_util?.pct || 0}
                  valueLabel={
                    toFixedFloorWithoutTrailingZeros(
                      liveStat?.cpu_util?.pct || 0,
                      1,
                    ) + '%'
                  }
                  strokeColor="#BFBFBF"
                  progressStyle={{ border: 'none' }}
                />
              </>
            ) : (
              <Tooltip
                title={mergedResourceSlots?.['cpu']?.human_readable_name}
              >
                <Progress
                  format={(percent) => (
                    <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                      {percent + '%'}
                    </Typography.Text>
                  )}
                  percent={
                    _.toNumber(
                      toFixedFloorWithoutTrailingZeros(
                        sortedLiveStat?.cpu_util?.pct,
                        1,
                      ),
                    ) || 0
                  }
                  strokeColor="#BFBFBF"
                  strokeLinecap="butt"
                />
              </Tooltip>
            )}
          </Flex>
        </Col>
      ) : null}

      {sortedLiveStat?.mem ? (
        <Col xs={24} sm={12}>
          <Flex direction="column" align="stretch">
            {size === 'default' ? (
              <>
                <Flex justify="between">
                  <Typography.Text>
                    {mergedResourceSlots?.['mem']?.human_readable_name}
                  </Typography.Text>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {displayMemoryUsage(
                      sortedLiveStat?.mem?.current,
                      // mem.capacity does not report total amount of memory allocated to
                      // the container, so, we just replace with the value of occupied slot.
                      // NOTE: this assumes every containers in a session have the same
                      // amount of memory.
                      occupiedSlots?.mem,
                    )}
                  </Typography.Text>
                </Flex>
                <BAIProgressWithLabel
                  percent={sortedLiveStat?.mem?.pct || 0}
                  valueLabel={
                    toFixedFloorWithoutTrailingZeros(
                      liveStat?.mem?.pct || 0,
                      1,
                    ) + '%'
                  }
                  strokeColor="#BFBFBF"
                  progressStyle={{ border: 'none' }}
                />
              </>
            ) : (
              <Tooltip
                title={
                  <Flex direction="column" align="stretch">
                    {mergedResourceSlots?.['mem']?.human_readable_name}
                    <br />
                    {displayMemoryUsage(
                      sortedLiveStat?.mem?.current,
                      // mem.capacity does not report total amount of memory allocated to
                      // the container, so, we just replace with the value of occupied slot.
                      // NOTE: this assumes every containers in a session have the same
                      // amount of memory.
                      occupiedSlots?.mem,
                    )}
                  </Flex>
                }
              >
                <Progress
                  format={(percent) => (
                    <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                      {percent + '%'}
                    </Typography.Text>
                  )}
                  percent={
                    _.toNumber(
                      toFixedFloorWithoutTrailingZeros(
                        sortedLiveStat?.mem?.pct,
                        1,
                      ),
                    ) || 0
                  }
                  strokeColor="#BFBFBF"
                  strokeLinecap="butt"
                />
              </Tooltip>
            )}
          </Flex>
        </Col>
      ) : null}

      {_.map(
        _.omit(sortedLiveStat, 'cpu_util', 'cpu_used', 'mem'),
        (value, key) => {
          const deviceName = _.split(key, '_')[0];
          const deviceKey = _.find(resourceSlotNames, (name) =>
            _.includes(name, deviceName),
          );

          return deviceKey ? (
            <Col xs={24} sm={12} key={key}>
              <Flex direction="column" align="stretch">
                {size === 'default' ? (
                  <>
                    <Flex justify="between">
                      <Typography.Text>
                        {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                        <Typography.Text type="secondary">
                          {_.includes(key, 'util') && ' (util)'}
                          {_.includes(key, 'mem') && ' (mem)'}
                        </Typography.Text>
                      </Typography.Text>
                      {_.includes(key, 'mem') ? (
                        <Typography.Text
                          type="secondary"
                          style={{ fontSize: token.fontSizeSM }}
                        >
                          {displayMemoryUsage(value?.current, value?.capacity)}
                        </Typography.Text>
                      ) : null}
                    </Flex>

                    <BAIProgressWithLabel
                      percent={value.pct || 0}
                      valueLabel={
                        toFixedFloorWithoutTrailingZeros(value.pct || 0, 1) +
                        '%'
                      }
                      strokeColor="#BFBFBF"
                      progressStyle={{ border: 'none' }}
                    />
                  </>
                ) : (
                  <Tooltip
                    title={
                      <Flex direction="column" align="stretch">
                        {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                        {_.includes(key, 'mem') && (
                          <>
                            (mem)
                            <br />
                            {displayMemoryUsage(
                              value?.current,
                              value?.capacity,
                            )}
                          </>
                        )}
                      </Flex>
                    }
                  >
                    <Progress
                      format={(percent) => (
                        <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                          {percent + '%'}
                        </Typography.Text>
                      )}
                      percent={
                        _.toNumber(
                          toFixedFloorWithoutTrailingZeros(value?.pct, 1),
                        ) || 0
                      }
                      strokeColor="#BFBFBF"
                      strokeLinecap="butt"
                    />
                  </Tooltip>
                )}
              </Flex>
            </Col>
          ) : null;
        },
      )}
      <Col span={24}>
        <Flex justify="end">
          <Typography.Text>
            {`I/O Read: ${convertDecimalSizeUnit(sortedLiveStat?.io_read?.current, 'm')?.numberUnit ?? '-'}B / Write: ${convertDecimalSizeUnit(sortedLiveStat?.io_write?.current, 'm')?.numberUnit ?? '-'}B`}
          </Typography.Text>
        </Flex>
      </Col>
    </Row>
  );
};

export default SessionUsageMonitor;
