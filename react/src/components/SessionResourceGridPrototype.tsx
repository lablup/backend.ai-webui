/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// PROTOTYPE — session resource-grid view (wayfinder map #8786, ticket #8789).
// Throwaway code: hardcoded English labels, no tests, prototype-grade error
// handling (incl. the inline-styled hover panel). Do not promote as-is.
//
// Layout (per driving-dev reaction, 2026-08-15): all sessions pack into ONE
// shared grid, cells flowing row-by-row with no per-session gaps ("Tetris").
// Each session is bordered as a GROUP by a highlight-style outline that
// follows the run's outer edge across row wraps (only edges whose neighbor
// is a different session are drawn). Identity = that categorical outline +
// first letter in the session's first cell; full name in the hover panel.
import { SessionResourceGridPrototypeQuery } from '../__generated__/SessionResourceGridPrototypeQuery.graphql';
import { Banner } from '@astryxdesign/core/Banner';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import { Selector } from '@astryxdesign/core/Selector';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { useChartColors } from '@astryxdesign/lab';
import { BAIFlex, filterOutNullAndUndefined } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useEffect, useRef, useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const SESSION_CAP = 100;
const MAX_UNITS_PER_SESSION = 256;

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

// WCAG relative luminance of a #rrggbb fill, for picking the letter ink.
const relativeLuminance = (hex: string): number => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return 0.5;
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

interface PackedCell {
  sessionIdx: number;
  color: string;
  fraction?: number; // 0..1 partial fill (fractional accelerator share)
  letter?: string; // first cell of a session carries its initial
}

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

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWrapperWidth(entries[0]?.contentRect.width ?? 0);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const [hover, setHover] = useState<{
    sessionIdx: number;
    x: number;
    y: number;
  } | null>(null);

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
  const darkInk = grayRamp[0];
  const lightInk = grayRamp[4];

  const binColor = (pct: number | null): string => {
    if (pct === null || !Number.isFinite(pct)) return noDataFill;
    const p = Math.max(0, Math.min(100, pct));
    if (gridParams.gridEncoding === 'stepped') {
      return ramp5[Math.min(4, Math.floor(p / 20))];
    }
    return p < 50 ? ramp3[0] : p < 80 ? ramp3[1] : ramp3[2];
  };

  // Session identity strokes: categorical hue keyed to stable session-id
  // order (color follows the entity); 11th+ session folds to structural gray.
  const categorical = colors.categorical(10);
  const sortedIds = [...sessions.map((s) => s.id)].sort();
  const strokeFor = (id: string): string => {
    const idx = sortedIds.indexOf(id);
    return idx >= 0 && idx < 10 ? categorical[idx] : colors.structural.grid;
  };

  const px = (name: string, fallback: number): number => {
    const v = parseFloat(theme.token(name));
    return Number.isFinite(v) ? v : fallback;
  };
  const cellPx = px('--spacing-4', 16);
  const gapPx = px('--spacing-0-5', 2);
  const radiusPx = Math.min(px('--radius-element', 4), 4);

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

  const cellsFor = (session: GridSession, sessionIdx: number): PackedCell[] => {
    let cells: PackedCell[];
    if (gridParams.gridMode === 'kernel') {
      cells = session.kernels.map((k) => ({
        sessionIdx,
        color: binColor(kernelMetricPct(k)),
      }));
      if (cells.length === 0) cells = [{ sessionIdx, color: noDataFill }];
    } else {
      const units = unitCount(session);
      const full = Math.floor(units + 1e-9);
      const fraction = units - full;
      const color = binColor(sessionUtilPct(session, resource));
      const capped = Math.min(full, MAX_UNITS_PER_SESSION);
      cells = Array.from({ length: capped }, () => ({ sessionIdx, color }));
      if (fraction > 1e-6 && cells.length < MAX_UNITS_PER_SESSION) {
        cells.push({ sessionIdx, color, fraction });
      }
      if (cells.length === 0) cells = [{ sessionIdx, color: noDataFill }];
    }
    cells[0].letter = (session.name[0] ?? '?').toUpperCase();
    return cells;
  };

  const packedCells: PackedCell[] = sessions.flatMap((s, i) => cellsFor(s, i));

  const pad = gapPx * 2;
  const stride = cellPx + gapPx;
  const cols = Math.max(
    8,
    Math.floor((wrapperWidth - pad * 2 + gapPx) / stride),
  );
  const rows = Math.max(1, Math.ceil(packedCells.length / cols));
  const svgWidth = pad * 2 + cols * stride - gapPx;
  const svgHeight = pad * 2 + rows * stride - gapPx;

  const legendItems =
    gridParams.gridEncoding === 'stepped'
      ? ramp5.map((c, i) => ({ color: c, label: `${i * 20}–${(i + 1) * 20}%` }))
      : [
          { color: ramp3[0], label: 'Low (<50%)' },
          { color: ramp3[1], label: 'Mid (50–80%)' },
          { color: ramp3[2], label: 'High (≥80%)' },
        ];

  const hoveredSession = hover === null ? null : sessions[hover.sessionIdx];

  const sessionIdxFromEvent = (e: React.MouseEvent): number | null => {
    const raw = (e.target as Element).getAttribute?.('data-si');
    if (raw === null || raw === undefined) return null;
    const idx = parseInt(raw);
    return Number.isFinite(idx) ? idx : null;
  };

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
        <div ref={wrapperRef} style={{ position: 'relative' }}>
          {wrapperWidth > 0 && (
            <svg
              width={svgWidth}
              height={svgHeight}
              role="img"
              aria-label={`Resource grid of ${sessions.length} sessions`}
              style={{ display: 'block', cursor: 'pointer' }}
              onMouseMove={(e) => {
                const idx = sessionIdxFromEvent(e);
                if (idx === null) {
                  setHover(null);
                } else {
                  setHover({ sessionIdx: idx, x: e.clientX, y: e.clientY });
                }
              }}
              onMouseLeave={() => setHover(null)}
              onClick={(e) => {
                const idx = sessionIdxFromEvent(e);
                if (idx !== null && onClickSession) {
                  onClickSession(sessions[idx].id);
                }
              }}
            >
              {packedCells.map((cell, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = pad + col * stride;
                const y = pad + row * stride;
                const session = sessions[cell.sessionIdx];
                const dimmed =
                  hover !== null && hover.sessionIdx !== cell.sessionIdx;
                const isPartial =
                  cell.fraction !== undefined && cell.fraction < 1;
                const letterInk =
                  relativeLuminance(cell.color) > 0.45 ? darkInk : lightInk;
                // Group outline: draw only the edges whose grid neighbor is
                // not a cell of the same session, so the border follows the
                // run's outer boundary across row wraps (highlighter style).
                const sameSession = (j: number): boolean =>
                  j >= 0 &&
                  j < packedCells.length &&
                  packedCells[j].sessionIdx === cell.sessionIdx;
                const o = gapPx / 4;
                const [x0, y0, x1, y1] = [
                  x - o,
                  y - o,
                  x + cellPx + o,
                  y + cellPx + o,
                ];
                const edges: Array<[number, number, number, number]> = [];
                if (col === 0 || !sameSession(i - 1))
                  edges.push([x0, y0, x0, y1]);
                if (col === cols - 1 || !sameSession(i + 1))
                  edges.push([x1, y0, x1, y1]);
                if (row === 0 || !sameSession(i - cols))
                  edges.push([x0, y0, x1, y0]);
                if (!sameSession(i + cols)) edges.push([x0, y1, x1, y1]);
                return (
                  <g key={i} opacity={dimmed ? 0.3 : 1}>
                    <rect
                      data-si={cell.sessionIdx}
                      x={x}
                      y={y}
                      width={cellPx}
                      height={cellPx}
                      rx={radiusPx}
                      fill={isPartial ? emptyFill : cell.color}
                      stroke={colors.structural.grid}
                      strokeWidth={0.5}
                    />
                    {isPartial && (
                      <rect
                        data-si={cell.sessionIdx}
                        x={x}
                        y={y + cellPx * (1 - (cell.fraction ?? 0))}
                        width={cellPx}
                        height={cellPx * (cell.fraction ?? 0)}
                        rx={1}
                        fill={cell.color}
                      />
                    )}
                    {edges.map(([ex0, ey0, ex1, ey1], k) => (
                      <line
                        key={k}
                        x1={ex0}
                        y1={ey0}
                        x2={ex1}
                        y2={ey1}
                        stroke={strokeFor(session.id)}
                        strokeWidth={gapPx / 2}
                        strokeLinecap="square"
                        pointerEvents="none"
                      />
                    ))}
                    {cell.letter && (
                      <text
                        x={x + cellPx / 2}
                        y={y + cellPx / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize={cellPx * 0.62}
                        fontWeight={700}
                        fill={letterInk}
                        pointerEvents="none"
                      >
                        {cell.letter}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
          {hoveredSession && hover && (
            <div
              style={{
                position: 'fixed',
                left: hover.x + 14,
                top: hover.y + 14,
                zIndex: 1000,
                pointerEvents: 'none',
                background: theme.token('--color-surface'),
                border: `1px solid ${strokeFor(hoveredSession.id)}`,
                borderRadius: px('--radius-element', 6),
                padding: px('--spacing-2', 8),
                maxWidth: 320,
              }}
            >
              <BAIFlex direction="column" align="start" gap={2}>
                <Text size="sm">{hoveredSession.name}</Text>
                <Text size="sm" color="secondary">
                  {hoveredSession.status}
                  {hoveredSession.slotsAreRequested ? ' (requested slots)' : ''}
                </Text>
                <Text size="sm" color="secondary">
                  {formatSlotSummary(hoveredSession.slots)}
                </Text>
                {gridParams.gridMode === 'resource' ? (
                  <Text size="sm" color="secondary">
                    {`${resource} util: ${(() => {
                      const pct = sessionUtilPct(hoveredSession, resource);
                      return pct === null ? 'no data' : `${pct.toFixed(1)}%`;
                    })()}`}
                  </Text>
                ) : (
                  <Text size="sm" color="secondary">
                    {`${hoveredSession.kernels.length} kernel(s) · ${metric}`}
                  </Text>
                )}
              </BAIFlex>
            </div>
          )}
        </div>
      )}
    </BAIFlex>
  );
};

export default SessionResourceGridPrototype;
