/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DonutRow } from '../memberCards/memberCardData';
import './charts.css';
import { Text } from '@lablup/ui-common/Text';
import {
  RadialChart,
  RadialSlice,
  RadialTooltip,
  useChartColors,
} from '@lablup/ui-common/lab';
import useResizeObserver from '@react-hook/resize-observer';
import { BAIFlex } from 'backend.ai-ui';
import _ from 'lodash';
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
const ROW_HEIGHT = 32;
const COMPACT_ROW_HEIGHT = 24;

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
};

// Tried in order; the first that fits the height wins.
const LEGEND_DENSITIES: ReadonlyArray<LegendDensity> = [
  { rowHeight: ROW_HEIGHT, hasHeader: true },
  { rowHeight: COMPACT_ROW_HEIGHT, hasHeader: true },
  { rowHeight: COMPACT_ROW_HEIGHT, hasHeader: false },
];

const legendHeight = (density: LegendDensity, rowCount: number) =>
  (rowCount + (density.hasHeader ? 1 : 0)) * density.rowHeight;

export interface DonutChartProps {
  rows: ReadonlyArray<DonutRow>;
  /** The chart's accessible name. */
  label: string;
  /** Legend column headers, also used in the slice tooltip. */
  columnLabels: { name: string; value: string; percent: string };
  /** Shown instead of the ring when every value is 0. */
  emptyText: string;
}

/**
 * A donut of manager-counted values with a compact name / value / share
 * legend. It never outgrows its box: the legend fits first (tighter rows,
 * then no header row), the ring takes the room left and is dropped when that
 * is under `RING_MIN`. The legend moves under the ring when the box is narrow.
 */
const DonutChart: React.FC<DonutChartProps> = ({
  rows,
  label,
  columnLabels,
  emptyText,
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

  const colors = useChartColors().categorical(Math.max(rows.length, 1));
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
  const chartColors = legendRows.flatMap((row, i) =>
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
                innerRadius={0.6}
                height={chartSize}
                label={label}
              >
                <RadialSlice colors={chartColors} labels={false} />
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
            </BAIFlex>
          ) : (
            <Text type="supporting">{emptyText}</Text>
          )}
        </BAIFlex>
      )}
      {/* Numeric columns take their content's width; only the name truncates. */}
      <div
        ref={legendRef}
        role="table"
        aria-label={label}
        className="bai-donut-legend"
      >
        {density.hasHeader && (
          <div
            role="row"
            className="bai-donut-legend__row bai-donut-legend__head"
            style={{ height: density.rowHeight }}
          >
            <span role="columnheader">{columnLabels.name}</span>
            <span role="columnheader" className="bai-donut-legend__number">
              {columnLabels.value}
            </span>
            <span role="columnheader" className="bai-donut-legend__number">
              {columnLabels.percent}
            </span>
          </div>
        )}
        {legendRows.map((row) => (
          <div
            key={row.key}
            role="row"
            className="bai-donut-legend__row"
            style={{ height: density.rowHeight }}
          >
            <span role="cell" className="bai-donut-legend__name">
              {/* The swatch takes the slice's data colour, which no token carries. */}
              <span
                className="bai-dashboard-chart-swatch"
                style={{ backgroundColor: row.color }}
              />
              <Text maxLines={1}>{row.label}</Text>
            </span>
            <span role="cell" className="bai-donut-legend__number">
              {row.value.toLocaleString()}
            </span>
            <span role="cell" className="bai-donut-legend__number">
              {`${row.percent}%`}
            </span>
          </div>
        ))}
      </div>
    </BAIFlex>
  );
};

export default DonutChart;
