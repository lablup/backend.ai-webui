/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DonutRow } from '../memberCards/memberCardData';
import './charts.css';
import {
  Table,
  pixel,
  proportional,
  type TableColumn,
} from '@lablup/ui-common/Table';
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

const RING_MIN = 96;
const RING_MAX = 220;
// RadialChart keeps 40px around the ring for slice labels, which this chart turns off.
const CHART_LABEL_ROOM = 40;
// Room the tooltip's hover ring and highlight still draw into.
const RING_HALO = 16;
const LEGEND_WIDTH = 224;
const NAME_MIN_WIDTH = 88;
const NUMBER_WIDTH = 56;
// The `lg` gap between the ring and the legend.
const LEGEND_GAP = 24;

interface LegendRow extends Record<string, unknown> {
  key: string;
  label: string;
  value: number;
  percent: number;
  color: string;
}

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
 * A donut of manager-counted values with a compact name / value / share legend
 * beside it. The ring grows with the card up to `RING_MAX`; the legend moves
 * under the ring when the card is too narrow for both.
 */
const DonutChart: React.FC<DonutChartProps> = ({
  rows,
  label,
  columnLabels,
  emptyText,
}) => {
  'use memo';
  const rootRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: 0, height: 0 });
  useResizeObserver(rootRef, ({ contentRect }) => {
    setBox({ width: contentRect.width, height: contentRect.height });
  });

  const colors = useChartColors().categorical(Math.max(rows.length, 1));
  const legendRows: Array<LegendRow> = rows.map((row, index) => ({
    ...row,
    color: colors[index % colors.length],
  }));
  const hasValue = rows.some((row) => row.value > 0);

  const sideBySide =
    box.width >= RING_MIN + 2 * RING_HALO + LEGEND_GAP + LEGEND_WIDTH;
  const ring = _.clamp(
    (sideBySide
      ? Math.min(box.height, box.width - LEGEND_WIDTH - LEGEND_GAP)
      : Math.min(box.width, box.height / 2)) -
      2 * RING_HALO,
    RING_MIN,
    RING_MAX,
  );
  const chartSize = ring + 2 * CHART_LABEL_ROOM;

  const columns: Array<TableColumn<LegendRow>> = [
    {
      key: 'label',
      header: columnLabels.name,
      width: proportional(1, { minWidth: NAME_MIN_WIDTH }),
      renderCell: (row) => (
        <BAIFlex gap="xs" align="center" wrap="nowrap">
          {/* The swatch takes the slice's data colour, which no token carries. */}
          <span
            className="bai-dashboard-chart-swatch"
            style={{ backgroundColor: row.color }}
          />
          <Text maxLines={1}>{row.label}</Text>
        </BAIFlex>
      ),
    },
    {
      key: 'value',
      header: columnLabels.value,
      align: 'end',
      width: pixel(NUMBER_WIDTH),
    },
    {
      key: 'percent',
      header: columnLabels.percent,
      align: 'end',
      width: pixel(NUMBER_WIDTH),
      renderCell: (row) => `${row.percent}%`,
    },
  ];

  return (
    <BAIFlex
      ref={rootRef}
      direction={sideBySide ? 'row' : 'column'}
      align="center"
      justify="center"
      gap="lg"
      style={{ flex: '1 1 0', minHeight: 0 }}
    >
      {box.width > 0 && (
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
                data={legendRows}
                valueKey="value"
                labelKey="label"
                innerRadius={0.6}
                height={chartSize}
                label={label}
              >
                <RadialSlice colors={colors} labels={false} />
                <RadialTooltip
                  render={(datum) => (
                    <BAIFlex direction="column" align="start">
                      <Text weight="semibold">{datum.label}</Text>
                      <Text>{`${columnLabels.value}: ${datum.value.toLocaleString()}`}</Text>
                      <Text>{`${columnLabels.percent}: ${legendRows[datum.index]?.percent ?? 0}%`}</Text>
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
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ flex: 'none', width: LEGEND_WIDTH, maxWidth: '100%' }}
      >
        <Table<LegendRow>
          data={legendRows}
          columns={columns}
          idKey="key"
          density="compact"
          textOverflow="truncate"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default DonutChart;
