import { SessionSlotCellFragment$key } from '../../__generated__/SessionSlotCellFragment.graphql';
import { convertToBinaryUnit } from '../../helper';
import { ResourceSlotName } from '../../hooks/backendai';
import { useSessionLiveStat } from '../../hooks/useSessionNodeLiveStat';
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
import { BAIFlex, useResourceSlotsDetails } from 'backend.ai-ui';
import _ from 'lodash';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface OccupiedSlotViewProps {
  sessionFrgmt: SessionSlotCellFragment$key;
  type: 'cpu' | 'mem' | 'accelerator';
}
const SessionSlotCell: React.FC<OccupiedSlotViewProps> = ({
  type,
  sessionFrgmt,
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

  const occupiedSlots: {
    [key in ResourceSlotName]?: string;
  } = JSON.parse(session.occupied_slots || '{}');

  if (type === 'cpu') {
    const CPUOccupiedSlot = parseFloat(occupiedSlots.cpu ?? '1');
    const CPUUtilPercent = Math.min(
      parseFloat(liveStat.cpu_util?.pct ?? '0'),
      CPUOccupiedSlot * 100,
    );

    return occupiedSlots.cpu ? (
      <UsageBadge
        percent={Math.min(CPUUtilPercent / CPUOccupiedSlot, 100)}
        text={CPUOccupiedSlot}
        tooltip={{
          title: liveStat.cpu_util
            ? `${CPUUtilPercent.toFixed(1)}% / ${CPUOccupiedSlot * 100}%`
            : undefined,
          placement: 'left',
        }}
      />
    ) : (
      '-'
    );
  } else if (type === 'mem') {
    const mem = occupiedSlots.mem ?? '-';
    const memOccupiedSlot = parseFloat(occupiedSlots.mem ?? '1');
    return mem === '-' ? (
      mem
    ) : (
      <UsageBadge
        percent={liveStat.mem?.pct ? parseFloat(liveStat.mem.pct) : 0}
        tooltip={{
          // title: liveStat.mem ? `${liveStat.mem.pct} %` : undefined,
          title: displayMemoryUsage(
            liveStat.mem?.current,
            memOccupiedSlot.toString(),
          ),
          placement: 'left',
        }}
        text={convertToBinaryUnit(mem, 'g', 3)?.displayValue}
      />
    );
  } else if (type === 'accelerator') {
    const occupiedAccelerators = _.omit(occupiedSlots, ['cpu', 'mem']);

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
            <BAIFlex
              direction="row"
              key={key}
              align="center"
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
            </BAIFlex>
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
            flexWrap: 'nowrap',
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
