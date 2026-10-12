/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SessionMonitorUtilizationBarsFragment$key } from '../../__generated__/SessionMonitorUtilizationBarsFragment.graphql';
import { convertToBinaryUnit } from '../../helper';
import { useResourceSlotsDetails } from '../../hooks/backendai';
import { useSessionLiveStat } from '../../hooks/useSessionNodeLiveStat';
import SessionMonitorThinBar from './SessionMonitorThinBar';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

type Bar = { key: string; label: string; percent: number };

const variantFor = (percent: number) =>
  percent < 10 ? 'error' : percent < 50 ? 'warning' : 'success';

/** Thin "GPU / CPU / MEM" bars: live use against the session's allocation. */
const SessionMonitorUtilizationBars: React.FC<{
  sessionFrgmt: SessionMonitorUtilizationBarsFragment$key;
}> = ({ sessionFrgmt }) => {
  'use memo';
  const { mergedResourceSlots } = useResourceSlotsDetails();
  const session = useFragment(
    graphql`
      fragment SessionMonitorUtilizationBarsFragment on ComputeSessionNode {
        occupied_slots
        ...useSessionNodeLiveStatSessionFragment
      }
    `,
    sessionFrgmt,
  );
  const { liveStat } = useSessionLiveStat(session);
  const occupied: Record<string, string | undefined> = JSON.parse(
    session.occupied_slots || '{}',
  );

  const bars: Bar[] = [];
  _.forEach(liveStat, (value, key) => {
    if (!key.endsWith('_util') || key === 'cpu_util' || !value) return;
    const device = key.slice(0, -'_util'.length).replace(/_/g, '-');
    const slotName = _.find(
      _.keys(occupied),
      (name) => name === device || name.startsWith(`${device}.`),
    );
    if (!slotName) return;
    bars.push({
      key,
      label: mergedResourceSlots?.[slotName]?.human_readable_name ?? device,
      percent: _.clamp(parseFloat(value.pct ?? '0'), 0, 100),
    });
  });
  if (liveStat.cpu_util) {
    const cores = parseFloat(occupied.cpu ?? '1') || 1;
    bars.push({
      key: 'cpu',
      label: mergedResourceSlots?.cpu?.human_readable_name ?? 'CPU',
      percent: _.clamp(
        parseFloat(liveStat.cpu_util.pct ?? '0') / cores,
        0,
        100,
      ),
    });
  }
  if (liveStat.mem) {
    const used = convertToBinaryUnit(liveStat.mem.current, 'g')?.number ?? 0;
    const total = convertToBinaryUnit(occupied.mem, 'g')?.number || 1;
    bars.push({
      key: 'mem',
      label: mergedResourceSlots?.mem?.human_readable_name ?? 'MEM',
      percent: _.clamp((used / total) * 100, 0, 100),
    });
  }
  if (bars.length === 0) return null;

  return (
    <BAIFlex direction="column" align="stretch" gap={2}>
      {bars.map((bar) => (
        <BAIFlex key={bar.key} direction="row" align="center" gap="xs">
          <Text type="supporting" textWrap="nowrap">
            <span style={{ display: 'inline-block', width: 36 }}>
              {bar.label}
            </span>
          </Text>
          <div style={{ flex: 1 }}>
            <SessionMonitorThinBar
              label={bar.label}
              percent={bar.percent}
              variant={variantFor(bar.percent)}
            />
          </div>
          <Text type="supporting" textWrap="nowrap">
            <span
              style={{ display: 'inline-block', width: 34, textAlign: 'end' }}
            >
              {Math.round(bar.percent)}%
            </span>
          </Text>
        </BAIFlex>
      ))}
    </BAIFlex>
  );
};

export default SessionMonitorUtilizationBars;
