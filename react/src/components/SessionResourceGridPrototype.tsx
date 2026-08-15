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
const layoutValues = ['serpentine', 'wordwrap'] as const;

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

// Group palette supplied by the driving dev (#8789 reaction, 2026-08-15) —
// muted swatches replacing the too-vivid chart categorical set. Raw hex is
// prototype-only; production must map these to theme tokens.
const GROUP_HUES_ON_LIGHT = [
  '#8C50BC',
  '#3469D6',
  '#42825C',
  '#417C99',
  '#B05F1D',
  '#B84134',
  '#6C6E76',
];
const GROUP_HUES_ON_DARK = [
  '#BE81EF',
  '#749DED',
  '#74CB9A',
  '#83C2DE',
  '#E9D149',
  '#E6786D',
  '#8D8F97',
];

type BoundarySeg = [number, number, number, number];

// Chain axis-aligned boundary segments into closed loops (each vertex has
// exactly two incident segments by construction), merging collinear runs.
const chainLoops = (segs: BoundarySeg[]): Array<Array<[number, number]>> => {
  const key = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const unused = new Set<number>(segs.map((_, i) => i));
  const byPoint = new Map<string, number[]>();
  segs.forEach((s, i) => {
    [key(s[0], s[1]), key(s[2], s[3])].forEach((k) => {
      const list = byPoint.get(k);
      if (list) list.push(i);
      else byPoint.set(k, [i]);
    });
  });
  const near = (a: number, b: number) => Math.abs(a - b) < 0.01;
  const loops: Array<Array<[number, number]>> = [];
  while (unused.size > 0) {
    const startIdx: number = unused.values().next().value as number;
    unused.delete(startIdx);
    const s0 = segs[startIdx];
    const pts: Array<[number, number]> = [
      [s0[0], s0[1]],
      [s0[2], s0[3]],
    ];
    let cur: [number, number] = [s0[2], s0[3]];
    for (;;) {
      const candidates = (byPoint.get(key(cur[0], cur[1])) ?? []).filter((i) =>
        unused.has(i),
      );
      if (candidates.length === 0) break;
      const i = candidates[0];
      unused.delete(i);
      const s = segs[i];
      const next: [number, number] =
        near(s[0], cur[0]) && near(s[1], cur[1]) ? [s[2], s[3]] : [s[0], s[1]];
      pts.push(next);
      cur = next;
    }
    if (pts.length > 2 && near(pts[0][0], cur[0]) && near(pts[0][1], cur[1]))
      pts.pop();
    const merged: Array<[number, number]> = [];
    pts.forEach((p) => {
      const a = merged[merged.length - 2];
      const b = merged[merged.length - 1];
      if (
        a &&
        b &&
        ((near(a[0], b[0]) && near(b[0], p[0])) ||
          (near(a[1], b[1]) && near(b[1], p[1])))
      )
        merged[merged.length - 1] = p;
      else merged.push(p);
    });
    while (merged.length > 3) {
      const a = merged[merged.length - 1];
      const b = merged[0];
      const c = merged[1];
      if (
        (near(a[0], b[0]) && near(b[0], c[0])) ||
        (near(a[1], b[1]) && near(b[1], c[1]))
      )
        merged.shift();
      else break;
    }
    if (merged.length >= 4) loops.push(merged);
  }
  return loops;
};

// Rounded rectilinear-polygon path: every corner (convex and concave) is
// rounded with a quadratic arc clamped to half of its shorter edge.
const roundedLoopPath = (
  pts: Array<[number, number]>,
  radius: number,
): string => {
  const n = pts.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const prev = pts[(i - 1 + n) % n];
    const next = pts[(i + 1) % n];
    const inLen = Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    const outLen = Math.hypot(next[0] - p[0], next[1] - p[1]);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const pin: [number, number] = [
      p[0] - ((p[0] - prev[0]) / inLen) * r,
      p[1] - ((p[1] - prev[1]) / inLen) * r,
    ];
    const pout: [number, number] = [
      p[0] + ((next[0] - p[0]) / outLen) * r,
      p[1] + ((next[1] - p[1]) / outLen) * r,
    ];
    d +=
      (i === 0 ? `M${pin[0]},${pin[1]}` : `L${pin[0]},${pin[1]}`) +
      `Q${p[0]},${p[1]} ${pout[0]},${pout[1]}`;
  }
  return d + 'Z';
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
      gridLayout: parseAsStringLiteral(layoutValues).withDefault('serpentine'),
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

  // Group hues cycle the dev-supplied muted palette in FLOW order, so
  // adjacent groups are always distinct. Deliberate deviation from "color
  // follows entity": here color's only job is local discrimination between
  // neighbors (identity = position + letter + hover).
  const groupPalette =
    theme.mode === 'dark' ? GROUP_HUES_ON_DARK : GROUP_HUES_ON_LIGHT;
  const hueFor = (sessionIdx: number): string =>
    groupPalette[sessionIdx % groupPalette.length];

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

  // Word-wrap placement on a FIXED lattice: every cell sits on the same
  // column grid; the seam between groups is one skipped lattice slot, so
  // columns never drift while proximity still separates groups.
  // Plate breathing room: inner padding between the group border and its
  // cells; row gap leaves clear space between plates of adjacent rows.
  const platePadX = gapPx * 2 + 1;
  const platePadY = gapPx * 2;
  const rowGapPx = platePadY * 2 + gapPx * 3;
  const pad = platePadX + gapPx;
  const stridePx = cellPx + gapPx;
  interface PlacedCell extends PackedCell {
    px: number;
    py: number;
    prow: number;
  }
  const latticeCols = Math.max(
    6,
    Math.floor((wrapperWidth - pad * 2 + gapPx) / stridePx),
  );
  const cellCountBySession: number[] = [];
  packedCells.forEach((c) => {
    cellCountBySession[c.sessionIdx] =
      (cellCountBySession[c.sessionIdx] ?? 0) + 1;
  });
  const placedCells: PlacedCell[] = [];
  {
    let slot = 0;
    let crow = 0;
    packedCells.forEach((cell) => {
      if (cell.letter !== undefined && slot > 0) {
        const n = cellCountBySession[cell.sessionIdx];
        if (
          gridParams.gridLayout === 'wordwrap' &&
          n <= latticeCols &&
          slot + 1 + n > latticeCols
        ) {
          // Word-wrap: a group that cannot fit in the remaining row starts
          // on the next row (gap only at the row end), so it never splits
          // into disconnected pieces; larger-than-a-row groups stay
          // connected via their full middle rows.
          crow += 1;
          slot = 0;
        } else {
          slot += 1; // seam slot between groups
        }
      }
      if (slot >= latticeCols) {
        crow += 1;
        slot = 0;
      }
      // Serpentine: odd rows run right→left, so a wrap continuation is
      // always directly below the previous cell — zero gaps, always merged.
      const visualSlot =
        gridParams.gridLayout === 'serpentine' && crow % 2 === 1
          ? latticeCols - 1 - slot
          : slot;
      placedCells.push({
        ...cell,
        px: pad + visualSlot * stridePx,
        py: pad + crow * (cellPx + rowGapPx),
        prow: crow,
      });
      slot += 1;
    });
  }
  const rowCount =
    placedCells.length > 0 ? placedCells[placedCells.length - 1].prow + 1 : 1;
  const svgWidth = pad * 2 + latticeCols * stridePx - gapPx;
  const svgHeight = pad * 2 + rowCount * (cellPx + rowGapPx) - rowGapPx;

  // Per-(session, row) segments → one rounded plate each. Corners stay
  // square on the side where the run continues on another row (text-
  // highlighter convention), signalling continuation.
  interface Segment {
    sessionIdx: number;
    row: number;
    x0: number;
    x1: number;
    y: number;
    first: boolean;
    last: boolean;
  }
  const segments: Segment[] = [];
  placedCells.forEach((cell) => {
    const seg = segments[segments.length - 1];
    if (seg && seg.sessionIdx === cell.sessionIdx && seg.row === cell.prow) {
      // min/max so serpentine's right→left rows extend segments correctly.
      seg.x0 = Math.min(seg.x0, cell.px);
      seg.x1 = Math.max(seg.x1, cell.px + cellPx);
    } else {
      if (seg && seg.sessionIdx === cell.sessionIdx) seg.last = false;
      segments.push({
        sessionIdx: cell.sessionIdx,
        row: cell.prow,
        x0: cell.px,
        x1: cell.px + cellPx,
        y: cell.py,
        first: cell.letter !== undefined,
        last: true,
      });
    }
  });

  // Consecutive segments of one session (a session's cells are contiguous
  // in flow order, so its segments are consecutive too).
  const sessionSegGroups: Segment[][] = [];
  segments.forEach((seg) => {
    const group = sessionSegGroups[sessionSegGroups.length - 1];
    if (group && group[0].sessionIdx === seg.sessionIdx) group.push(seg);
    else sessionSegGroups.push([seg]);
  });

  const legendItems =
    gridParams.gridEncoding === 'stepped'
      ? ramp5.map((c, i) => ({ color: c, label: `${i * 20}–${(i + 1) * 20}%` }))
      : [
          { color: ramp3[0], label: 'Low (<50%)' },
          { color: ramp3[1], label: 'Mid (50–80%)' },
          { color: ramp3[2], label: 'High (≥80%)' },
        ];

  // The initial goes on each group's VISUAL top-left cell (topmost row,
  // then leftmost), not the flow-first cell — on serpentine's right→left
  // rows those differ.
  const letterCellIdx = new Map<number, number>();
  placedCells.forEach((c, i) => {
    const curIdx = letterCellIdx.get(c.sessionIdx);
    if (curIdx === undefined) {
      letterCellIdx.set(c.sessionIdx, i);
      return;
    }
    const cur = placedCells[curIdx];
    if (c.py < cur.py || (c.py === cur.py && c.px < cur.px))
      letterCellIdx.set(c.sessionIdx, i);
  });

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
          <SegmentedControl
            size="sm"
            label="Layout"
            value={gridParams.gridLayout}
            onChange={(value) =>
              setGridParams({
                gridLayout: value as (typeof layoutValues)[number],
              })
            }
          >
            <SegmentedControlItem value="serpentine" label="Serpentine" />
            <SegmentedControlItem value="wordwrap" label="Word-wrap" />
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
              {sessionSegGroups.map((segs, k) => {
                const si = segs[0].sessionIdx;
                const hue = hueFor(si);
                const hovered = hover !== null && hover.sessionIdx === si;
                const rects = segs.map((s) => ({
                  x: s.x0 - platePadX,
                  y: s.y - platePadY,
                  w: s.x1 - s.x0 + platePadX * 2,
                  h: cellPx + platePadY * 2,
                }));
                // Bridge vertically-adjacent overlapping segments so the run
                // reads as one merged region; then trace the union boundary
                // and round every corner.
                const bridges: Array<{
                  ox0: number;
                  ox1: number;
                  y0: number;
                  y1: number;
                } | null> = [];
                for (let i = 0; i < rects.length - 1; i++) {
                  const A = rects[i];
                  const B = rects[i + 1];
                  const ox0 = Math.max(A.x, B.x);
                  const ox1 = Math.min(A.x + A.w, B.x + B.w);
                  bridges.push(
                    segs[i + 1].row === segs[i].row + 1 && ox1 - ox0 > gapPx
                      ? { ox0, ox1, y0: A.y + A.h, y1: B.y }
                      : null,
                  );
                }
                const hPieces = (
                  a0: number,
                  a1: number,
                  ex: { ox0: number; ox1: number } | null | undefined,
                ): Array<[number, number]> =>
                  ex
                    ? (
                        [
                          [a0, Math.max(a0, ex.ox0)],
                          [Math.min(a1, ex.ox1), a1],
                        ] as Array<[number, number]>
                      ).filter(([p0, p1]) => p1 - p0 > 0.5)
                    : [[a0, a1]];
                const boundary: BoundarySeg[] = [];
                rects.forEach((g0, i) => {
                  const above = i > 0 ? bridges[i - 1] : null;
                  const below = i < rects.length - 1 ? bridges[i] : null;
                  hPieces(g0.x, g0.x + g0.w, above).forEach(([p0, p1]) =>
                    boundary.push([p0, g0.y, p1, g0.y]),
                  );
                  hPieces(g0.x, g0.x + g0.w, below).forEach(([p0, p1]) =>
                    boundary.push([p0, g0.y + g0.h, p1, g0.y + g0.h]),
                  );
                  boundary.push([g0.x, g0.y, g0.x, g0.y + g0.h]);
                  boundary.push([g0.x + g0.w, g0.y, g0.x + g0.w, g0.y + g0.h]);
                });
                bridges.forEach((b) => {
                  if (b) {
                    boundary.push([b.ox0, b.y0, b.ox0, b.y1]);
                    boundary.push([b.ox1, b.y0, b.ox1, b.y1]);
                  }
                });
                const d = chainLoops(boundary)
                  .map((loop) => roundedLoopPath(loop, radiusPx + platePadY))
                  .join('');
                // Hover highlights the hovered group (stronger tint + border)
                // instead of dimming everything else.
                return (
                  <path
                    key={`sg-${k}`}
                    data-si={si}
                    d={d}
                    fill={colors.alpha(hue, hovered ? 0.32 : 0.15)}
                    stroke={hue}
                    strokeWidth={hovered ? 2.5 : 1.5}
                  />
                );
              })}
              {placedCells.map((cell, i) => {
                const x = cell.px;
                const y = cell.py;
                const isPartial =
                  cell.fraction !== undefined && cell.fraction < 1;
                const letterInk =
                  relativeLuminance(cell.color) > 0.45 ? darkInk : lightInk;
                return (
                  <g key={i}>
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
                    {letterCellIdx.get(cell.sessionIdx) === i && (
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
                        {(
                          sessions[cell.sessionIdx].name[0] ?? '?'
                        ).toUpperCase()}
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
                border: `1px solid ${hueFor(hover.sessionIdx)}`,
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
