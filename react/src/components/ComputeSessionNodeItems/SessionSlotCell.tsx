import { SessionSlotCellFragment$key } from '../../__generated__/SessionSlotCellFragment.graphql';
import { convertBinarySizeUnit } from '../../helper';
import {
  ResourceSlotName,
  useResourceSlotsDetails,
} from '../../hooks/backendai';
import { useSessionLiveStat } from '../../hooks/useSessionNodeLiveStat';
import Flex from '../Flex';
import { displayMemoryUsage } from '../SessionUsageMonitor';
import {
  Badge,
  BadgeProps,
  Divider,
  theme,
  Tooltip,
  TooltipProps,
  Typography,
} from 'antd';
import _ from 'lodash';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface OccupiedSlotViewProps {
  sessionFrgmt: SessionSlotCellFragment$key;
  type: 'cpu' | 'mem' | 'accelerator';
  mode?: 'occupied' | 'requested';
}
const SessionSlotCell: React.FC<OccupiedSlotViewProps> = ({
  type,
  sessionFrgmt,
  mode = 'requested',
}) => {
  const { mergedResourceSlots } = useResourceSlotsDetails('');
  const session = useFragment(
    graphql`
      fragment SessionSlotCellFragment on ComputeSessionNode {
        id
        status
        occupied_slots
        requested_slots
        ...useSessionNodeLiveStatSessionFragment
      }
    `,
    sessionFrgmt,
  );

  const { liveStat } = useSessionLiveStat(session);

  const slots: {
    [key in ResourceSlotName]?: string;
  } = JSON.parse(
    (mode === 'occupied' ? session.occupied_slots : session.requested_slots) ||
      '{}',
  );

  if (type === 'cpu') {
    const displayPercent =
      (liveStat.cpu_util?.pct ? parseFloat(liveStat.cpu_util?.pct) : 0) /
      parseFloat(slots.cpu ?? '1');
    const cpuUtilPercentNumber = liveStat.cpu_util?.pct
      ? parseFloat(liveStat.cpu_util.pct)
      : 0;
    const maxPercent = parseFloat(slots.cpu ?? '1') * 100;
    return slots.cpu ? (
      <UsageBadge
        percent={displayPercent}
        text={slots.cpu}
        tooltip={{
          title: liveStat.cpu_util
            ? `${cpuUtilPercentNumber.toFixed(1)}% / ${maxPercent}%`
            : undefined,
          placement: 'left',
        }}
      />
    ) : (
      '-'
    );
  } else if (type === 'mem') {
    const mem = slots.mem ?? '-';
    return mem === '-' ? (
      mem
    ) : (
      <UsageBadge
        percent={liveStat.mem?.pct ? parseFloat(liveStat.mem.pct) : 0}
        tooltip={{
          // title: liveStat.mem ? `${liveStat.mem.pct} %` : undefined,
          title: displayMemoryUsage(
            liveStat.mem?.current,
            liveStat.mem?.capacity,
          ),
          placement: 'left',
        }}
        text={convertBinarySizeUnit(mem, 'G', 3)?.numberFixed + ' GiB'}
      />
    );
  } else if (type === 'accelerator') {
    const occupiedAccelerators = _.omit(slots, ['cpu', 'mem']);

    const filteredAccelerators = _.omitBy(
      occupiedAccelerators,
      (value) => _.toNumber(value) <= 0 || _.isNaN(_.toNumber(value)),
    );
    return _.every(filteredAccelerators, (value) => parseFloat(value) === 0)
      ? '-'
      : _.map(filteredAccelerators, (value, key) => {
          const statKey = key.split('.')[0];
          const memStat = liveStat[statKey + '_mem'];

          const percentNumber = memStat?.pct ? parseFloat(memStat.pct) : 0;
          return (
            <Flex
              direction="row"
              key={key}
              align="start"
              style={{ minWidth: 100 }}
            >
              <UsageBadge
                percent={percentNumber}
                tooltip={{
                  // title: memStat ? `${memStat.pct} %` : undefined,
                  title:
                    displayMemoryUsage(memStat?.current, memStat?.capacity) +
                    (memStat?.pct !== undefined
                      ? ` (${percentNumber.toFixed(1)} %)`
                      : ''),
                  placement: 'left',
                }}
                text={value}
              />
              <Divider type="vertical" />
              <Typography.Text>
                {mergedResourceSlots?.[key]?.display_unit}
              </Typography.Text>
            </Flex>
          );
        });
  }
};

interface UsageBadgeProps extends Omit<BadgeProps, 'color' | 'status'> {
  percent: number;
  tooltip?: TooltipProps;
}
const UsageBadge: React.FC<UsageBadgeProps> = ({
  tooltip,
  percent,
  ...badgeProps
}) => {
  const { token } = theme.useToken();
  const extraProps: Pick<BadgeProps, 'status' | 'color' | 'styles'> = !percent
    ? {
        status: 'default',
        styles: {
          indicator: {
            border: '1px solid',
            borderColor: token.colorTextDisabled,
            backgroundColor: 'transparent',
          },
        },
      }
    : percent < 50
      ? {
          status: 'default',
        }
      : percent < 80
        ? {
            status: 'warning',
          }
        : {
            status: 'processing',
            color: 'red',
          };
  return (
    <Tooltip {...tooltip}>
      <div>
        <Badge {...badgeProps} {...extraProps} />
      </div>
    </Tooltip>
  );
};

export default SessionSlotCell;
