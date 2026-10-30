/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DonutRow } from '../memberCards/memberCardData';
import { Text } from '@lablup/ui-common/Text';
import {
  RadialChart,
  RadialSlice,
  RadialTooltip,
  useChartColors,
} from '@lablup/ui-common/lab';
import useResizeObserver from '@react-hook/resize-observer';
import * as stylex from '@stylexjs/stylex';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
import { Circle } from 'lucide-react';
import React, { useRef, useState } from 'react';

const RING_MIN = 64;
const RING_MAX = 220;
// RadialChart keeps 40px around the ring for slice labels, which this chart turns off.
const CHART_LABEL_ROOM = 40;
// Room the tooltip's hover ring and highlight still draw into.
const RING_HALO = 16;
// The legend's width before it is first measured.
const LEGEND_WIDTH_GUESS = 224;
// The `lg` gap between the ring and the legend.
const LEGEND_GAP = 24;
// Legend line heights, divider included.
const ROW_HEIGHT = 37;
const COMPACT_ROW_HEIGHT = 29;
// The hole's share of the ring's radius, for the filled and the empty ring alike.
const DONUT_INNER_RADIUS = 0.6;

const styles = stylex.create({
  name: { flex: 1, minWidth: 0 },
  // Long names truncate rather than widen the legend.
  nameText: { maxWidth: 200 },
  number: { minWidth: '3.5em', textAlign: 'end' },
  percent: { minWidth: '4.5em', textAlign: 'end' },
});

/** One legend line: name, count and share, divided from the next like table rows. */
const LegendLine: React.FC<{ height: number; children: React.ReactNode }> = ({
  height,
  children,
}) => (
  <BAIFlex
    align="center"
    gap="md"
    wrap="nowrap"
    style={{
      height,
      borderBottom: '1px solid var(--color-border)',
    }}
  >
    {children}
  </BAIFlex>
);

interface LegendRow extends Record<string, unknown> {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

type LegendDensity = {
  rowHeight: number;
  hasHeader: boolean;
  columns: 1 | 2;
};

// Tried in order; the first that fits the height wins.
const LEGEND_DENSITIES: ReadonlyArray<LegendDensity> = [
  { rowHeight: ROW_HEIGHT, hasHeader: true, columns: 1 },
  { rowHeight: COMPACT_ROW_HEIGHT, hasHeader: true, columns: 1 },
  { rowHeight: COMPACT_ROW_HEIGHT, hasHeader: false, columns: 1 },
  { rowHeight: COMPACT_ROW_HEIGHT, hasHeader: false, columns: 2 },
];

const legendHeight = (density: LegendDensity, rowCount: number) =>
  (Math.ceil(rowCount / density.columns) + (density.hasHeader ? 1 : 0)) *
  density.rowHeight;

export interface DonutChartProps {
  rows: ReadonlyArray<DonutRow>;
  /** The chart's accessible name. */
  label: string;
  /** Legend column headers, also used in the slice tooltip. */
  columnLabels: { name: string; value: string; percent: string };
  /** The empty ring's accessible name, when every value is 0. */
  emptyText: string;
  /** A manager-counted total shown in the ring's hole; omitted, the hole stays empty. */
  total?: number | null;
}

/**
 * A donut of manager-counted values with a compact name / value / share
 * legend. It never outgrows its box: the legend fits first (tighter rows,
 * then no header row, then two columns), the ring takes the room left and is
 * dropped when that is under `RING_MIN`. The legend moves under the ring when the box is narrow.
 */
const DonutChart: React.FC<DonutChartProps> = ({
  rows,
  label,
  columnLabels,
  emptyText,
  total,
}) => {
  'use memo';
  const rootRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [legendWidth, setLegendWidth] = useState(LEGEND_WIDTH_GUESS);
  useResizeObserver(rootRef, ({ contentRect }) => {
    setBox({ width: contentRect.width, height: contentRect.height });
  });
  // Only an unsqueezed legend reports its natural width.
  useResizeObserver(legendRef, ({ contentRect }) => {
    if (contentRect.width < (rootRef.current?.clientWidth ?? 0) - 1) {
      setLegendWidth(Math.ceil(contentRect.width));
    }
  });

  const chartColors = useChartColors();
  const colors = chartColors.categorical(Math.max(rows.length, 1));
  const legendRows: Array<LegendRow> = rows.map((row, index) => ({
    ...row,
    color: colors[index % colors.length],
  }));
  const hasValue = rows.some((row) => row.value > 0);

  const density =
    LEGEND_DENSITIES.find(
      (candidate) => legendHeight(candidate, rows.length) <= box.height,
    ) ?? LEGEND_DENSITIES[LEGEND_DENSITIES.length - 1];
  const legendBoxHeight = legendHeight(density, rows.length);

  const sideBySide =
    box.width >= RING_MIN + 2 * RING_HALO + LEGEND_GAP + legendWidth;
  const ringRoom =
    (sideBySide
      ? Math.min(box.height, box.width - legendWidth - LEGEND_GAP)
      : Math.min(box.width, box.height - legendBoxHeight - LEGEND_GAP)) -
    2 * RING_HALO;
  const hasRing = box.width > 0 && ringRoom >= RING_MIN;
  const ring = _.clamp(ringRoom, RING_MIN, RING_MAX);
  const chartSize = ring + 2 * CHART_LABEL_ROOM;

  // Zero-value slices stay in the legend only; drawn, their separators show as a gap.
  const chartRows = legendRows.filter((row) => row.value > 0);
  const sliceColors = legendRows.flatMap((row, i) =>
    row.value > 0 ? [colors[i]] : [],
  );

  return (
    <BAIFlex
      ref={rootRef}
      direction={sideBySide ? 'row' : 'column'}
      align="center"
      justify="center"
      gap="lg"
      style={{ flex: '1 1 0', minHeight: 0, overflow: 'hidden' }}
    >
      {hasRing && (
        <BAIFlex
          justify="center"
          align="center"
          style={{
            flex: 'none',
            width: ring + 2 * RING_HALO,
            height: ring + 2 * RING_HALO,
            position: 'relative',
          }}
        >
          {hasValue ? (
            <BAIFlex
              style={{
                flex: 'none',
                width: chartSize,
                margin: RING_HALO - CHART_LABEL_ROOM,
              }}
            >
              <RadialChart
                data={chartRows}
                valueKey="value"
                labelKey="label"
                innerRadius={DONUT_INNER_RADIUS}
                height={chartSize}
                label={label}
              >
                <RadialSlice colors={sliceColors} labels={false} />
                <RadialTooltip
                  highlight={false}
                  render={(datum) => (
                    <BAIFlex direction="column" align="start">
                      <Text weight="semibold">{datum.label}</Text>
                      <Text>{`${columnLabels.value}: ${datum.value.toLocaleString()}`}</Text>
                      <Text>{`${columnLabels.percent}: ${chartRows[datum.index]?.percent ?? 0}%`}</Text>
                    </BAIFlex>
                  )}
                />
              </RadialChart>
              {/* The total sits in the hole; pointer events pass through to the slices' tooltips. */}
              <BAIFlex
                justify="center"
                align="center"
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                }}
              >
                {_.isNumber(total) ? (
                  <Text size="xl" weight="semibold" hasTabularNumbers>
                    {total.toLocaleString()}
                  </Text>
                ) : null}
              </BAIFlex>
            </BAIFlex>
          ) : (
            // A neutral track the filled ring's size and thickness, with the 0 in its hole.
            <BAIFlex
              justify="center"
              align="center"
              role="img"
              aria-label={emptyText}
              title={emptyText}
              style={{
                flex: 'none',
                width: ring,
                height: ring,
                position: 'relative',
              }}
            >
              <svg
                width={ring}
                height={ring}
                viewBox={`0 0 ${ring} ${ring}`}
                aria-hidden
                style={{ position: 'absolute', inset: 0 }}
              >
                <circle
                  cx={ring / 2}
                  cy={ring / 2}
                  r={(ring / 2) * ((1 + DONUT_INNER_RADIUS) / 2)}
                  fill="none"
                  stroke={chartColors.structural.grid}
                  strokeWidth={(ring / 2) * (1 - DONUT_INNER_RADIUS)}
                />
              </svg>
              <Text
                size="xl"
                weight="semibold"
                color="secondary"
                hasTabularNumbers
              >
                0
              </Text>
            </BAIFlex>
          )}
        </BAIFlex>
      )}
      <BAIFlex
        ref={legendRef}
        align="start"
        gap="md"
        aria-label={label}
        role="group"
        style={{ flex: 'none', maxWidth: '100%' }}
      >
        {_.chunk(
          legendRows,
          Math.max(1, Math.ceil(legendRows.length / density.columns)),
        ).map((columnRows, columnIndex) => (
          <BAIFlex
            key={columnIndex}
            direction="column"
            align="stretch"
            style={{ width: 'max-content', maxWidth: '100%' }}
          >
            {density.hasHeader && (
              <LegendLine height={density.rowHeight}>
                <Text size="sm" weight="semibold" xstyle={styles.name}>
                  {columnLabels.name}
                </Text>
                <Text size="sm" weight="semibold" xstyle={styles.number}>
                  {columnLabels.value}
                </Text>
                <Text size="sm" weight="semibold" xstyle={styles.percent}>
                  {columnLabels.percent}
                </Text>
              </LegendLine>
            )}
            {columnRows.map((row) => (
              <LegendLine key={row.key} height={density.rowHeight}>
                <BAIFlex
                  gap="xs"
                  align="center"
                  wrap="nowrap"
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {/* The swatch takes the slice's data colour, which no token carries. */}
                  <Circle
                    size={12}
                    fill={row.color}
                    color={row.color}
                    aria-hidden
                  />
                  <Text maxLines={1} xstyle={styles.nameText}>
                    {row.label}
                  </Text>
                </BAIFlex>
                <Text hasTabularNumbers xstyle={styles.number}>
                  {row.value.toLocaleString()}
                </Text>
                <Text hasTabularNumbers xstyle={styles.percent}>
                  {`${row.percent}%`}
                </Text>
              </LegendLine>
            ))}
          </BAIFlex>
        ))}
      </BAIFlex>
    </BAIFlex>
  );
};

export default DonutChart;
