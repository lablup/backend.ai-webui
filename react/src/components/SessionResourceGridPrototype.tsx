/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// PROTOTYPE — session resource-grid view (wayfinder map #8786, ticket #8789).
// Throwaway code: hardcoded English labels, no tests, prototype-grade error
// handling. Do not promote as-is; the production build is a follow-up effort.
import { SessionResourceGridPrototypeQuery } from '../__generated__/SessionResourceGridPrototypeQuery.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import { Grid } from '@astryxdesign/core/Grid';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { useTheme } from '@astryxdesign/core/theme';
import { useChartColors } from '@astryxdesign/lab';
import * as stylex from '@stylexjs/stylex';
import { BAIFlex, filterOutNullAndUndefined } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { graphql, useLazyLoadQuery } from 'react-relay';

const SESSION_CAP = 100;
const MAX_UNITS_PER_SESSION = 256;
const GRID_COLS = 8;

const gridModeValues = ['resource', 'kernel'] as const;
const encodingValues = ['stepped', 'banded'] as const;
const memUnitValues = ['1', '2', '4', '8'] as const;

interface StatItem {
  current?: string;
  capacity?: string;
  pct?: string;
  unit_hint?: string;
  [key: string]: string | undefined;
}
type LiveStats = Record<string, StatItem>;
type SlotMap = Record<string, string>;

const parseJSONObject = (raw?: string | null): Record<string, any> => {
  try {
    const parsed = JSON.parse(raw || '{}');
    return _.isPlainObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

// Simplified port of useSessionLiveStat's kernel→session merge (sum
// current/capacity, recompute pct). Number precision is fine for a prototype.
const mergeKernelStats = (statsList: LiveStats[]): LiveStats => {
  const merged: LiveStats = {};
  const keys = _.uniq(statsList.flatMap((s) => Object.keys(s)));
  keys.forEach((key) => {
    const items = statsList
      .map((s) => s[key])
      .filter((i): i is StatItem => _.isPlainObject(i));
    if (items.length === 0) return;
    const sum = (field: string) =>
      items.reduce((acc, i) => acc + (parseFloat(i[field] ?? '0') || 0), 0);
    const current = sum('current');
    const capacity = sum('capacity');
    merged[key] = {
      current: String(current),
      capacity: String(capacity),
      pct: capacity > 0 ? ((current / capacity) * 100).toFixed(2) : '0',
      unit_hint: items.find((i) => i.unit_hint)?.unit_hint,
    };
  });
  return merged;
};

// `cuda.shares` → `cuda_util`, `hyperaccel-lpu.device` → `hyperaccel_lpu_util`
const utilKeyForSlot = (slot: string): string =>
  slot === 'cpu'
    ? 'cpu_util'
    : slot === 'mem'
      ? 'mem'
      : `${slot.split('.')[0].replace(/-/g, '_')}_util`;

const LIVE_STATUSES = ['RUNNING', 'RUNNING_DEGRADED', 'TERMINATING'];

interface GridKernel {
  id: string;
  role: string;
  hostname: string;
  status: string;
  liveStat: LiveStats;
}

interface GridSession {
  id: string;
  name: string;
  status: string;
  type: string;
  slots: SlotMap;
  slotsAreRequested: boolean;
  liveStat: LiveStats;
  kernels: Array<GridKernel>;
}

const formatSlotSummary = (slots: SlotMap): string =>
  Object.entries(slots)
    .map(([k, v]) =>
      k === 'mem'
        ? `mem ${(parseFloat(v) / 2 ** 30).toFixed(1)} GiB`
        : `${k} ${v}`,
    )
    .join(' · ');

const styles = stylex.create({
  sessionName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
});

interface CellSpec {
  color: string;
  fraction?: number; // 0..1 partial fill (fractional accelerator share)
  title: string;
}

const UnitGridSvg = ({
  cells,
  emptyFill,
  cellStroke,
  borderColor,
  cellPx,
  gapPx,
  radiusPx,
  ariaLabel,
  onClick,
}: {
  cells: CellSpec[];
  emptyFill: string;
  // Ramp extremes sit under 2:1 vs surface (validated 2026-08-14, both
  // modes) — the stroke keeps every cell visible regardless of fill.
  cellStroke: string;
  borderColor: string;
  cellPx: number;
  gapPx: number;
  radiusPx: number;
  ariaLabel: string;
  onClick?: () => void;
}) => {
  'use memo';
  const pad = gapPx * 2;
  const cols = Math.min(GRID_COLS, Math.max(1, cells.length));
  const rows = Math.max(1, Math.ceil(cells.length / cols));
  const width = pad * 2 + cols * cellPx + (cols - 1) * gapPx;
  const height = pad * 2 + rows * cellPx + (rows - 1) * gapPx;
  return (
    <svg
      width={width}
      height={height}
      role="img"
      aria-label={ariaLabel}
      onClick={onClick}
      style={{ display: 'block', cursor: onClick ? 'pointer' : undefined }}
    >
      <rect
        x={0.75}
        y={0.75}
        width={width - 1.5}
        height={height - 1.5}
        rx={radiusPx}
        fill="none"
        stroke={borderColor}
        strokeWidth={1.5}
      />
      {cells.map((cell, i) => {
        const x = pad + (i % cols) * (cellPx + gapPx);
        const y = pad + Math.floor(i / cols) * (cellPx + gapPx);
        const isPartial = cell.fraction !== undefined && cell.fraction < 1;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={cellPx}
              height={cellPx}
              rx={2}
              fill={isPartial ? emptyFill : cell.color}
              stroke={cellStroke}
              strokeWidth={0.5}
            />
            {isPartial && (
              <rect
                x={x}
                y={y + cellPx * (1 - (cell.fraction ?? 0))}
                width={cellPx}
                height={cellPx * (cell.fraction ?? 0)}
                rx={1}
                fill={cell.color}
              />
            )}
            <title>{cell.title}</title>
          </g>
        );
      })}
    </svg>
  );
};

const LegendSwatch = ({ color, label }: { color: string; label: string }) => {
  'use memo';
  return (
    <BAIFlex gap={4} align="center">
      <svg width={10} height={10} role="img" aria-label={label}>
        <rect width={10} height={10} rx={2} fill={color} />
      </svg>
      <Text size="sm" color="secondary">
        {label}
      </Text>
    </BAIFlex>
  );
};

interface SessionResourceGridPrototypeProps {
  filter?: string | null;
  order?: string | null;
  projectId?: string | null;
  fetchKey: string;
  onClickSession?: (sessionId: string) => void;
}

const SessionResourceGridPrototype = ({
  filter,
  order,
  projectId,
  fetchKey,
  onClickSession,
}: SessionResourceGridPrototypeProps) => {
  'use memo';
  const theme = useTheme();
  const colors = useChartColors();

  const [gridParams, setGridParams] = useQueryStates(
    {
      gridMode: parseAsStringLiteral(gridModeValues).withDefault('resource'),
      // Plain strings: resource slot / metric keys are dynamic per cluster.
      gridResource: parseAsString.withDefault('cpu'),
      gridMetric: parseAsString.withDefault('cpu_util'),
      gridEncoding: parseAsStringLiteral(encodingValues).withDefault('stepped'),
      gridMemUnit: parseAsStringLiteral(memUnitValues).withDefault('1'),
    },
    { history: 'replace' },
  );

  const queryData = useLazyLoadQuery<SessionResourceGridPrototypeQuery>(
    graphql`
      query SessionResourceGridPrototypeQuery(
        $limit: Int!
        $offset: Int!
        $filter: String
        $order: String
        $group_id: String
      ) {
        compute_session_list(
          limit: $limit
          offset: $offset
          filter: $filter
          order: $order
          group_id: $group_id
        ) {
          total_count
          items {
            id
            session_id
            name
            type
            status
            cluster_size
            occupied_slots
            requested_slots
            containers {
              id
              cluster_role
              cluster_hostname
              status
              live_stat
            }
          }
        }
      }
    `,
    {
      limit: SESSION_CAP,
      offset: 0,
      filter,
      order: order || '-created_at',
      group_id: projectId,
    },
    { fetchPolicy: 'network-only', fetchKey },
  );

  const totalCount = queryData.compute_session_list?.total_count ?? 0;
  const sessions: GridSession[] = filterOutNullAndUndefined(
    queryData.compute_session_list?.items,
  ).map((item) => {
    const occupied = parseJSONObject(item.occupied_slots) as SlotMap;
    const requested = parseJSONObject(item.requested_slots) as SlotMap;
    const slotsAreRequested = _.isEmpty(occupied);
    const kernels: GridKernel[] = filterOutNullAndUndefined(
      item.containers,
    ).map((c) => ({
      id: c.id ?? '',
      role: c.cluster_role ?? '',
      hostname: c.cluster_hostname ?? '',
      status: c.status ?? '',
      liveStat: parseJSONObject(c.live_stat) as LiveStats,
    }));
    return {
      id: String(item.session_id ?? item.id ?? ''),
      name: item.name ?? '(unnamed)',
      status: item.status ?? '',
      type: item.type ?? '',
      slots: slotsAreRequested ? requested : occupied,
      slotsAreRequested,
      liveStat: mergeKernelStats(kernels.map((k) => k.liveStat)),
      kernels,
    };
  });

  // Dynamic control inventories from the data actually present.
  const availableResources = _.uniq([
    'cpu',
    'mem',
    ...sessions.flatMap((s) =>
      Object.keys(s.slots).filter((k) => k !== 'cpu' && k !== 'mem'),
    ),
  ]);
  const availableMetrics = _.uniq(
    sessions.flatMap((s) => s.kernels.flatMap((k) => Object.keys(k.liveStat))),
  ).sort((a, b) => {
    const rank = (k: string) =>
      k.includes('_util') ? 0 : k === 'mem' ? 1 : k.includes('_mem') ? 2 : 3;
    return rank(a) - rank(b) || a.localeCompare(b);
  });

  const resource = availableResources.includes(gridParams.gridResource)
    ? gridParams.gridResource
    : 'cpu';
  const metric =
    availableMetrics.length === 0 ||
    availableMetrics.includes(gridParams.gridMetric)
      ? gridParams.gridMetric
      : availableMetrics[0];

  // Color ramps — stepped 5-bin vs banded 3-bin, both from the theme's
  // sequential blue ramp (darkest-first from the API; reversed → low=light).
  const ramp5 = [...colors.sequential.blue(5)].reverse();
  const ramp3 = [...colors.sequential.blue(3)].reverse();
  const grayRamp = colors.sequential.gray(5);
  const noDataFill = grayRamp[3];
  const emptyFill = colors.alpha(grayRamp[4], 0.6);

  const binColor = (pct: number | null): string => {
    if (pct === null || !Number.isFinite(pct)) return noDataFill;
    const p = Math.max(0, Math.min(100, pct));
    if (gridParams.gridEncoding === 'stepped') {
      return ramp5[Math.min(4, Math.floor(p / 20))];
    }
    return p < 50 ? ramp3[0] : p < 80 ? ramp3[1] : ramp3[2];
  };

  // Group borders: categorical hue keyed to stable session-id order (color
  // follows the entity); 11th+ session folds to structural gray.
  const categorical = colors.categorical(10);
  const sortedIds = [...sessions.map((s) => s.id)].sort();
  const borderFor = (id: string): string => {
    const idx = sortedIds.indexOf(id);
    return idx >= 0 && idx < 10 ? categorical[idx] : colors.structural.grid;
  };

  const px = (name: string, fallback: number): number => {
    const v = parseFloat(theme.token(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const cellPx = px('--spacing-3', 12);
  const gapPx = px('--spacing-0-5', 2);
  const radiusPx = px('--radius-element', 6);

  const sessionUtilPct = (
    session: GridSession,
    slot: string,
  ): number | null => {
    if (!LIVE_STATUSES.includes(session.status)) return null;
    const stat = session.liveStat[utilKeyForSlot(slot)];
    const pct = stat ? parseFloat(stat.pct ?? '') : NaN;
    return Number.isFinite(pct) ? pct : null;
  };

  const kernelMetricPct = (kernel: GridKernel): number | null => {
    if (!LIVE_STATUSES.includes(kernel.status)) return null;
    const stat = kernel.liveStat[metric];
    const pct = stat ? parseFloat(stat.pct ?? '') : NaN;
    return Number.isFinite(pct) ? pct : null;
  };

  const memUnitBytes = parseInt(gridParams.gridMemUnit) * 2 ** 30;

  const unitCount = (session: GridSession): number => {
    const raw = parseFloat(session.slots[resource] ?? '0') || 0;
    return resource === 'mem' ? raw / memUnitBytes : raw;
  };

  const cellsFor = (session: GridSession): CellSpec[] => {
    if (gridParams.gridMode === 'kernel') {
      return session.kernels.map((k) => {
        const pct = kernelMetricPct(k);
        return {
          color: binColor(pct),
          title: `${k.hostname || k.role} · ${metric}: ${pct === null ? 'no data' : `${pct.toFixed(1)}%`}`,
        };
      });
    }
    const units = unitCount(session);
    const full = Math.floor(units + 1e-9);
    const fraction = units - full;
    const pct = sessionUtilPct(session, resource);
    const color = binColor(pct);
    const title = `${resource}: ${units % 1 === 0 ? units : units.toFixed(2)} unit(s) · util ${pct === null ? 'no data' : `${pct.toFixed(1)}%`}`;
    const capped = Math.min(full, MAX_UNITS_PER_SESSION);
    const cells: CellSpec[] = Array.from({ length: capped }, () => ({
      color,
      title,
    }));
    if (fraction > 1e-6 && cells.length < MAX_UNITS_PER_SESSION) {
      cells.push({ color, fraction, title });
    }
    return cells.length > 0 ? cells : [{ color: noDataFill, title }];
  };

  const legendItems =
    gridParams.gridEncoding === 'stepped'
      ? ramp5.map((c, i) => ({ color: c, label: `${i * 20}–${(i + 1) * 20}%` }))
      : [
          { color: ramp3[0], label: 'Low (<50%)' },
          { color: ramp3[1], label: 'Mid (50–80%)' },
          { color: ramp3[2], label: 'High (≥80%)' },
        ];

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex gap="sm" wrap="wrap" align="center" justify="between">
        <BAIFlex gap="sm" wrap="wrap" align="center">
          <SegmentedControl
            size="sm"
            label="Grid mode"
            value={gridParams.gridMode}
            onChange={(value) =>
              setGridParams({
                gridMode: value as (typeof gridModeValues)[number],
              })
            }
          >
            <SegmentedControlItem value="resource" label="Resource" />
            <SegmentedControlItem value="kernel" label="Kernel" />
          </SegmentedControl>
          {gridParams.gridMode === 'resource' ? (
            <>
              <SegmentedControl
                size="sm"
                label="Resource"
                value={resource}
                onChange={(value) => setGridParams({ gridResource: value })}
              >
                {availableResources.map((slot) => (
                  <SegmentedControlItem
                    key={slot}
                    value={slot}
                    label={
                      slot === 'cpu' ? 'CPU' : slot === 'mem' ? 'Memory' : slot
                    }
                  />
                ))}
              </SegmentedControl>
              {resource === 'mem' && (
                <SegmentedControl
                  size="sm"
                  label="Memory unit"
                  value={gridParams.gridMemUnit}
                  onChange={(value) =>
                    setGridParams({
                      gridMemUnit: value as (typeof memUnitValues)[number],
                    })
                  }
                >
                  {memUnitValues.map((u) => (
                    <SegmentedControlItem
                      key={u}
                      value={u}
                      label={`${u} GiB`}
                    />
                  ))}
                </SegmentedControl>
              )}
            </>
          ) : (
            <Selector
              label="Metric"
              isLabelHidden
              size="sm"
              width={180}
              options={availableMetrics}
              value={metric}
              onChange={(value) => setGridParams({ gridMetric: value ?? '' })}
            />
          )}
          <SegmentedControl
            size="sm"
            label="Color encoding"
            value={gridParams.gridEncoding}
            onChange={(value) =>
              setGridParams({
                gridEncoding: value as (typeof encodingValues)[number],
              })
            }
          >
            <SegmentedControlItem value="stepped" label="Stepped (5)" />
            <SegmentedControlItem value="banded" label="Banded (3)" />
          </SegmentedControl>
        </BAIFlex>
        <BAIFlex gap="sm" wrap="wrap" align="center">
          {legendItems.map((item) => (
            <LegendSwatch key={item.label} {...item} />
          ))}
          <LegendSwatch color={noDataFill} label="No data" />
        </BAIFlex>
      </BAIFlex>
      {totalCount > SESSION_CAP && (
        <Banner
          status="info"
          title={`Showing the first ${SESSION_CAP} of ${totalCount} sessions in the current filter.`}
        />
      )}
      {sessions.length === 0 ? (
        <Banner status="info" title="No sessions match the current filter." />
      ) : (
        <Grid columns={{ minWidth: 160 }} gap={3}>
          {sessions.map((session) => {
            const pct =
              gridParams.gridMode === 'resource'
                ? sessionUtilPct(session, resource)
                : null;
            return (
              <BAIFlex
                key={session.id}
                direction="column"
                align="start"
                gap={4}
                style={{ minWidth: 0 }}
              >
                <Tooltip
                  content={
                    <BAIFlex direction="column" align="start" gap={2}>
                      <Text size="sm">{session.name}</Text>
                      <Text size="sm" color="secondary">
                        {session.status}
                        {session.slotsAreRequested ? ' (requested slots)' : ''}
                      </Text>
                      <Text size="sm" color="secondary">
                        {formatSlotSummary(session.slots)}
                      </Text>
                      {gridParams.gridMode === 'resource' && (
                        <Text size="sm" color="secondary">
                          {`${resource} util: ${pct === null ? 'no data' : `${pct.toFixed(1)}%`}`}
                        </Text>
                      )}
                      {gridParams.gridMode === 'kernel' && (
                        <Text size="sm" color="secondary">
                          {`${session.kernels.length} kernel(s) · ${metric}`}
                        </Text>
                      )}
                    </BAIFlex>
                  }
                >
                  <BAIFlex direction="column" align="start" gap={2}>
                    <Text size="sm" xstyle={styles.sessionName}>
                      {session.name}
                    </Text>
                    <UnitGridSvg
                      cells={cellsFor(session)}
                      emptyFill={emptyFill}
                      cellStroke={colors.structural.grid}
                      borderColor={borderFor(session.id)}
                      cellPx={cellPx}
                      gapPx={gapPx}
                      radiusPx={radiusPx}
                      ariaLabel={`Session ${session.name}`}
                      onClick={
                        onClickSession
                          ? () => onClickSession(session.id)
                          : undefined
                      }
                    />
                  </BAIFlex>
                </Tooltip>
              </BAIFlex>
            );
          })}
        </Grid>
      )}
    </BAIFlex>
  );
};

export default SessionResourceGridPrototype;
