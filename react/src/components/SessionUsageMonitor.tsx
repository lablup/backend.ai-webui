import {
  convertBinarySizeUnit,
  convertDecimalSizeUnit,
  filterEmptyItem,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { useResourceSlotsDetails } from '../hooks/backendai';
import BAIProgressWithLabel from './BAIProgressWithLabel';
import Flex from './Flex';
import { SessionUsageMonitorFragment$key } from './__generated__/SessionUsageMonitorFragment.graphql';
import { ProgressProps, Tooltip, Typography, theme, Row, Col } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import { useMemo } from 'react';
import { useFragment } from 'react-relay';

interface SessionUsageMonitorProps extends ProgressProps {
  sessionFrgmt: SessionUsageMonitorFragment$key | null;
  size?: 'small' | 'default';
}

interface SessionUtilItemProps {
  size: 'small' | 'default';
  title: React.ReactNode;
  percent: string;
  tooltipTitle?: React.ReactNode;
  description?: React.ReactNode;
}

const SessionUtilItem: React.FC<SessionUtilItemProps> = ({
  size,
  title,
  percent,
  tooltipTitle,
  description,
}) => {
  const { token } = theme.useToken();

  const formattedPercent = toFixedFloorWithoutTrailingZeros(percent || 0, 1);
  const percentLabel = formattedPercent + '%';

  if (size === 'default') {
    return (
      <>
        <Flex justify="between">
          <Typography.Text>{title}</Typography.Text>
          {description && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {description}
            </Typography.Text>
          )}
        </Flex>
        <BAIProgressWithLabel
          percent={_.toNumber(percent)}
          valueLabel={percentLabel}
          strokeColor="#BFBFBF"
          progressStyle={{ border: 'none' }}
        />
      </>
    );
  }

  return (
    <Tooltip title={tooltipTitle || title} placement="left">
      <Flex direction="row" gap={'xxs'}>
        <Flex
          style={{
            // Max width is 140px, min width is 3px
            width: _.max([Math.round(_.toNumber(percent) * 1.4), 3]),
            height: 12,
            backgroundColor: '#BFBFBF',
          }}
        ></Flex>
        <Typography.Text
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: `${token.fontSizeSM}px`,
          }}
        >
          {_.toNumber(percent).toFixed(0) + '%'}
        </Typography.Text>
      </Flex>
    </Tooltip>
  );
};

const SessionUsageMonitor: React.FC<SessionUsageMonitorProps> = ({
  sessionFrgmt,
  size = 'default',
}) => {
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

  const utilItems = filterEmptyItem([
    sortedLiveStat?.cpu_util && (
      <SessionUtilItem
        key={'cpu'}
        size={size}
        title={mergedResourceSlots?.['cpu']?.human_readable_name}
        percent={sortedLiveStat?.cpu_util?.pct || 0}
      />
    ),
    sortedLiveStat?.mem && (
      <SessionUtilItem
        key={'mem'}
        size={size}
        title={mergedResourceSlots?.['mem']?.human_readable_name}
        percent={sortedLiveStat?.mem?.pct || 0}
        description={displayMemoryUsage(
          sortedLiveStat?.mem?.current,
          occupiedSlots?.mem,
        )}
        tooltipTitle={
          <Flex direction="column" align="stretch">
            {mergedResourceSlots?.['mem']?.human_readable_name}
            <br />
            {displayMemoryUsage(
              sortedLiveStat?.mem?.current,
              occupiedSlots?.mem,
            )}
          </Flex>
        }
      />
    ),
    ..._.map(
      _.omit(sortedLiveStat, 'cpu_util', 'cpu_used', 'mem'),
      (value, key) => {
        const deviceName = _.split(key, '_')[0];
        let deviceKey = _.find(resourceSlotNames, (name) =>
          _.includes(name, deviceName),
        );

        if (size === 'small' && !key?.endsWith('mem')) {
          deviceKey = undefined;
        }

        return deviceKey ? (
          <SessionUtilItem
            key={key}
            size={size}
            title={
              <>
                {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                <Typography.Text type="secondary">
                  {_.includes(key, 'util') && ' (util)'}
                  {_.includes(key, 'mem') && ' (mem)'}
                </Typography.Text>
              </>
            }
            percent={value.pct || 0}
            description={
              _.includes(key, 'mem')
                ? displayMemoryUsage(value?.current, value?.capacity)
                : undefined
            }
            tooltipTitle={
              <Flex direction="column" align="stretch">
                {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                {_.includes(key, 'mem') && (
                  <>
                    (mem)
                    <br />
                    {displayMemoryUsage(value?.current, value?.capacity)}
                  </>
                )}
              </Flex>
            }
          />
        ) : null;
      },
    ),
  ]);

  return (
    <Row gutter={[16, 16]}>
      {size === 'default' ? (
        _.map(utilItems, (item, index) => (
          <Col xs={24} sm={12} key={index}>
            <Flex direction="column" align="stretch">
              {item}
            </Flex>
          </Col>
        ))
      ) : (
        <Flex direction="column" align="stretch" gap={3}>
          {utilItems}
        </Flex>
      )}
      {size === 'default' && (
        <Col span={24}>
          <Flex justify="end">
            <Typography.Text>
              {`I/O Read: ${convertDecimalSizeUnit(sortedLiveStat?.io_read?.current, 'm')?.numberUnit ?? '-'}B / Write: ${convertDecimalSizeUnit(sortedLiveStat?.io_write?.current, 'm')?.numberUnit ?? '-'}B`}
            </Typography.Text>
          </Flex>
        </Col>
      )}
    </Row>
  );
};

export default SessionUsageMonitor;
