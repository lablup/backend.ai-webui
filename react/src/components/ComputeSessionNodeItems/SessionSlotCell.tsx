/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionSlotCellFragment$key } from '../../__generated__/SessionSlotCellFragment.graphql';
import { convertToBinaryUnit } from '../../helper';
import {
  ResourceSlotName,
  useResourceSlotsDetails,
} from '../../hooks/backendai';
import { useSessionLiveStat } from '../../hooks/useSessionNodeLiveStat';
import { getUnifiedSlotNameFromTag } from '../SessionFormItems/ResourceAllocationFormItems';
import { displayMemoryUsage } from '../SessionUsageMonitor';
import { Divider, Tooltip, TooltipProps, Typography } from 'antd';
import type { SemanticColor } from 'backend.ai-ui';
import { BAIBadge, BAIBadgeProps, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
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
  'use memo';
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const session = useFragment(
    graphql`
      fragment SessionSlotCellFragment on ComputeSessionNode {
        id
        status
        occupied_slots
        requested_slots
        tag
        ...useSessionNodeLiveStatSessionFragment
      }
    `,
    sessionFrgmt,
  );

  const { liveStat } = useSessionLiveStat(session);

  const parsedOccupiedSlots = JSON.parse(session.occupied_slots || '{}');
  const occupiedSlots: {
    [key in ResourceSlotName]?: string;
  } =
    Object.keys(parsedOccupiedSlots).length > 0
      ? parsedOccupiedSlots
      : JSON.parse(session.requested_slots || '{}');

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
    // Unified-memory accelerators have no separate quantity; if the session is
    // tagged as unified, show the device description instead of a usage badge.
    const unifiedSlotName = getUnifiedSlotNameFromTag(session.tag);
    if (unifiedSlotName) {
      const description =
        mergedResourceSlots?.[unifiedSlotName]?.description ?? unifiedSlotName;
      return (
        // The session table renders with `scroll={{ x: 'max-content' }}`, so
        // columns size to their content and `Typography.Text` ellipsis won't
        // trigger on its own. Pin an explicit max width (and inline-block) so a
        // long description actually truncates and surfaces the overflow tooltip.
        <Typography.Text
          ellipsis={{ tooltip: description }}
          style={{ maxWidth: 200, display: 'inline-block' }}
        >
          {description}
        </Typography.Text>
      );
    }
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
          const roundLength =
            mergedResourceSlots?.[key]?.number_format?.round_length || 0;
          const formattedValue =
            roundLength > 0 ? parseFloat(value).toFixed(roundLength) : value;
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
                text={formattedValue}
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

const percentToSemantic = (
  percent: number,
): { color?: SemanticColor; processing?: boolean } => {
  if (!percent) return {};
  if (percent < 50) return { color: 'default' };
  if (percent < 80) return { color: 'warning' };
  return { color: 'error', processing: true };
};

interface UsageBadgeProps extends Omit<BAIBadgeProps, 'color' | 'processing'> {
  percent: number;
  tooltip?: TooltipProps;
}
const UsageBadge: React.FC<UsageBadgeProps> = ({
  tooltip,
  percent,
  ...badgeProps
}) => {
  const { color, processing } = percentToSemantic(percent);
  return (
    <Tooltip {...tooltip}>
      <div>
        <BAIBadge {...badgeProps} color={color} processing={processing} />
      </div>
    </Tooltip>
  );
};

export default SessionSlotCell;
