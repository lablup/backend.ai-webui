import { SessionUsageMonitorFragment$key } from '../__generated__/SessionUsageMonitorFragment.graphql';
import {
  convertToBinaryUnit,
  convertToDecimalUnit,
  toFixedFloorWithoutTrailingZeros,
} from '../helper';
import { ResourceSlotName } from '../hooks/backendai';
import { useSessionLiveStat } from '../hooks/useSessionNodeLiveStat';
import { ProgressProps, Tooltip, Typography, theme, Row, Col } from 'antd';
import {
  filterOutEmpty,
  BAIFlex,
  useResourceSlotsDetails,
  BAIProgressWithLabel,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

interface SessionUsageMonitorProps extends ProgressProps {
  sessionFrgmt: SessionUsageMonitorFragment$key;
  size?: 'small' | 'default';
  displayTarget?: 'max' | 'avg' | 'current';
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
        <BAIFlex justify="between">
          <Typography.Text>{title}</Typography.Text>
          {description && (
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              {description}
            </Typography.Text>
          )}
        </BAIFlex>
        <BAIProgressWithLabel
          percent={_.toNumber(percent)}
          valueLabel={percentLabel}
          strokeColor="#BFBFBF"
          progressStyle={{ border: 'none' }}
          showInfo={false}
          labelStyle={{
            height: token.sizeXS,
          }}
        />
      </>
    );
  }

  return (
    <Tooltip title={tooltipTitle || title} placement="left">
      <BAIFlex direction="row" gap={'xxs'}>
        <BAIFlex
          style={{
            // Max width is 140px (even if over 100%), min width is 3px
            width: _.min([
              _.max([Math.round(_.toNumber(percent) * 1.4), 3]),
              140,
            ]),
            height: 12,
            backgroundColor: '#BFBFBF',
          }}
        ></BAIFlex>
        <Typography.Text
          style={{
            fontSize: token.fontSizeSM,
            lineHeight: `${token.fontSizeSM}px`,
          }}
        >
          {_.toNumber(percent).toFixed(0) + '%'}
        </Typography.Text>
      </BAIFlex>
    </Tooltip>
  );
};

const SessionUsageMonitor: React.FC<SessionUsageMonitorProps> = ({
  sessionFrgmt,
  size = 'default',
  displayTarget = 'current',
}) => {
  const { mergedResourceSlots } = useResourceSlotsDetails();

  const sessionNode = useFragment(
    graphql`
      fragment SessionUsageMonitorFragment on ComputeSessionNode {
        occupied_slots
        ...useSessionNodeLiveStatSessionFragment
      }
    `,
    sessionFrgmt,
  );

  const { liveStat } = useSessionLiveStat(sessionNode);

  const occupiedSlots: {
    [key in ResourceSlotName]?: string;
  } = JSON.parse(sessionNode.occupied_slots || '{}');
  const resourceSlotNames = _.keysIn(occupiedSlots);

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

  const displayTargetName =
    displayTarget === 'current'
      ? 'current'
      : (`stats.${displayTarget}` as const);
  const utilItems = filterOutEmpty([
    sortedLiveStat?.cpu_util &&
      (() => {
        const CPUOccupiedSlot = parseFloat(occupiedSlots.cpu ?? '1');
        const CPUUtilPercent = Math.min(
          parseFloat(liveStat.cpu_util?.pct ?? '0'),
          CPUOccupiedSlot * 100,
        );
        return (
          <SessionUtilItem
            key={'cpu'}
            size={size}
            title={mergedResourceSlots?.['cpu']?.human_readable_name}
            percent={
              displayTarget === 'current'
                ? Math.min(CPUUtilPercent / CPUOccupiedSlot, 100).toString()
                : Math.min(
                    sortedLiveStat?.cpu_util?.[displayTargetName] ?? '0',
                    100,
                  ).toString()
            }
            description={`${CPUUtilPercent.toFixed(1)}% / ${parseFloat(occupiedSlots.cpu ?? '1') * 100}%`}
          />
        );
      })(),
    sortedLiveStat?.mem && sortedLiveStat?.mem?.[displayTargetName] && (
      <SessionUtilItem
        key={'mem'}
        size={size}
        title={mergedResourceSlots?.['mem']?.human_readable_name}
        percent={
          displayTarget === 'current'
            ? _.toString(
                ((convertToBinaryUnit(sortedLiveStat?.mem?.current, 'g')
                  ?.number ?? 0) /
                  (convertToBinaryUnit(occupiedSlots?.mem, 'g')?.number || 1)) *
                  100,
              )
            : _.toString(
                ((convertToBinaryUnit(
                  sortedLiveStat?.mem?.[displayTargetName],
                  'g',
                )?.number ?? 0) /
                  (convertToBinaryUnit(occupiedSlots?.mem, 'g')?.number || 1)) *
                  100,
              )
        }
        description={displayMemoryUsage(
          sortedLiveStat?.mem?.[displayTargetName],
          occupiedSlots?.mem,
        )}
        tooltipTitle={
          <BAIFlex direction="column" align="stretch">
            {mergedResourceSlots?.['mem']?.human_readable_name}
            <br />
            {displayMemoryUsage(
              sortedLiveStat?.mem?.[displayTargetName],
              occupiedSlots?.mem,
            )}
          </BAIFlex>
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
        return deviceKey && value?.[displayTargetName] ? (
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
            percent={
              displayTarget === 'current'
                ? value?.pct || '0'
                : _.includes(key, 'util')
                  ? value?.[displayTargetName]
                  : _.toString(
                      ((convertToBinaryUnit(value?.[displayTargetName], 'g')
                        ?.number ?? 0) /
                        (convertToBinaryUnit(value?.capacity, 'g')?.number ||
                          1)) *
                        100,
                    )
            }
            description={
              _.includes(key, 'mem')
                ? displayMemoryUsage(
                    value?.[displayTargetName],
                    value?.capacity,
                  )
                : `${value?.pct}%`
            }
            tooltipTitle={
              <BAIFlex direction="column" align="stretch">
                {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                {_.includes(key, 'mem') && (
                  <>
                    (mem)
                    <br />
                    {displayMemoryUsage(
                      value?.[displayTargetName],
                      value?.capacity,
                    )}
                  </>
                )}
              </BAIFlex>
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
            <BAIFlex direction="column" align="stretch">
              {item}
            </BAIFlex>
          </Col>
        ))
      ) : (
        <BAIFlex direction="column" align="stretch" gap={3}>
          {utilItems}
        </BAIFlex>
      )}
      {size === 'default' && (
        <Col span={24}>
          <BAIFlex justify="end">
            <Typography.Text>
              {`I/O Read: ${convertToDecimalUnit(sortedLiveStat?.io_read?.current, 'm')?.displayValue ?? '-'} / Write: ${convertToDecimalUnit(sortedLiveStat?.io_write?.current, 'm')?.displayValue ?? '-'}`}
            </Typography.Text>
          </BAIFlex>
        </Col>
      )}
    </Row>
  );
};

export const displayMemoryUsage = (
  current: string | undefined,
  capacity: string | undefined,
  decimalSize: number = 2,
) => {
  return `${convertToBinaryUnit(current, 'g', decimalSize)?.numberFixed ?? '-'} GiB / ${
    convertToBinaryUnit(capacity, 'g', decimalSize)?.numberFixed ?? '-'
  } GiB`;
};

export default SessionUsageMonitor;
