/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionUsageMonitorFragment$key } from '../__generated__/SessionUsageMonitorFragment.graphql';
import { convertToBinaryUnit, convertToDecimalUnit } from '../helper';
import { ResourceSlotName, useResourceSlotsDetails } from '../hooks/backendai';
import { useSessionLiveStat } from '../hooks/useSessionNodeLiveStat';
import SimpleProgressWithLabel from './SimpleProgressWithLabel';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { filterOutEmpty, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

// PILOT-DECISION (ticket 17): the interface no longer extends antd
// `ProgressProps` — no consumer passed any Progress prop through (grepped:
// SessionDetailContent only passes sessionFrgmt/displayTarget).
interface SessionUsageMonitorProps {
  sessionFrgmt: SessionUsageMonitorFragment$key;
  size?: 'small' | 'default';
  displayTarget?: 'max' | 'avg' | 'current';
}

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
          <SimpleProgressWithLabel
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
      <SimpleProgressWithLabel
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
        const deviceName = _.split(key, '_').slice(0, -1).join('-');
        let deviceKey = _.find(
          resourceSlotNames,
          (name) => _.startsWith(name, deviceName + '.') || name === deviceName,
        );

        if (size === 'small' && !key?.endsWith('mem')) {
          deviceKey = undefined;
        }
        return deviceKey && value?.[displayTargetName] ? (
          <SimpleProgressWithLabel
            key={key}
            size={size}
            title={
              <>
                {mergedResourceSlots?.[deviceKey]?.human_readable_name}
                <Text color="secondary">
                  {_.includes(key, 'util') && ' (util)'}
                  {_.includes(key, 'mem') && ' (mem)'}
                </Text>
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

  // Responsive policy R1 (ticket 14): antd `Row gutter={[16,16]}` +
  // `Col xs={24} sm={12}` (2-up from 576px) -> container-driven Astryx Grid
  // (minWidth 576/2 ~= 280, max 2 tracks). The full-width I/O line keeps its
  // span via GridSpan 'full'.
  return size === 'default' ? (
    <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
      {_.map(utilItems, (item, index) => (
        <BAIFlex key={index} direction="column" align="stretch">
          {item}
        </BAIFlex>
      ))}
      <GridSpan columns="full">
        <BAIFlex justify="end">
          <Text>
            {`I/O Read: ${convertToDecimalUnit(sortedLiveStat?.io_read?.current, 'm')?.displayValue ?? '-'} / Write: ${convertToDecimalUnit(sortedLiveStat?.io_write?.current, 'm')?.displayValue ?? '-'}`}
          </Text>
        </BAIFlex>
      </GridSpan>
    </Grid>
  ) : (
    <BAIFlex direction="column" align="stretch" gap={3}>
      {utilItems}
    </BAIFlex>
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
