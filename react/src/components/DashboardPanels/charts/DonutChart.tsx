/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DonutRow } from '../memberCards/memberCardData';
import './charts.css';
import { Table, proportional, type TableColumn } from '@lablup/ui-common/Table';
import { Text } from '@lablup/ui-common/Text';
import {
  RadialChart,
  RadialSlice,
  useChartColors,
} from '@lablup/ui-common/lab';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';

const RING_BASIS = 120;
// Room for a type name such as "Interactive" plus the count and share columns on one line.
const LEGEND_BASIS = 260;
// Below the table's 120px default, which squeezed the name column; fits "Count" / "100%".
const NUMBER_MIN_WIDTH = 64;

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
  /** Legend column headers. */
  columnLabels: { name: string; value: string; percent: string };
  /** Shown instead of the ring when every value is 0. */
  emptyText: string;
  height?: number;
}

/** A donut of manager-counted values with a name / value / share legend table. */
const DonutChart: React.FC<DonutChartProps> = ({
  rows,
  label,
  columnLabels,
  emptyText,
  height = 140,
}) => {
  'use memo';
  const colors = useChartColors().categorical(Math.max(rows.length, 1));
  const legendRows: Array<LegendRow> = rows.map((row, index) => ({
    ...row,
    color: colors[index % colors.length],
  }));
  const hasValue = rows.some((row) => row.value > 0);

  const columns: Array<TableColumn<LegendRow>> = [
    {
      key: 'label',
      header: columnLabels.name,
      width: proportional(2),
      renderCell: (row) => (
        <BAIFlex
          gap="xs"
          align="center"
          className="bai-dashboard-chart-legend-label"
        >
          {/* The swatch takes the slice's data colour, which no token carries. */}
          <span
            className="bai-dashboard-chart-swatch"
            style={{ backgroundColor: row.color }}
          />
          <Text>{row.label}</Text>
        </BAIFlex>
      ),
    },
    {
      key: 'value',
      header: columnLabels.value,
      align: 'end',
      width: proportional(1, { minWidth: NUMBER_MIN_WIDTH }),
    },
    {
      key: 'percent',
      header: columnLabels.percent,
      width: proportional(1, { minWidth: NUMBER_MIN_WIDTH }),
      align: 'end',
      renderCell: (row) => `${row.percent}%`,
    },
  ];

  return (
    <BAIFlex direction="row" align="center" gap="md" wrap="wrap">
      <BAIFlex style={{ flex: `1 1 ${RING_BASIS}px` }} justify="center">
        {hasValue ? (
          <RadialChart
            data={legendRows}
            valueKey="value"
            labelKey="label"
            innerRadius={0.6}
            height={height}
            label={label}
          >
            <RadialSlice colors={colors} labels={false} />
          </RadialChart>
        ) : (
          <Text type="supporting">{emptyText}</Text>
        )}
      </BAIFlex>
      {/* Beside the ring only when the legend still gets its basis; otherwise it wraps under it at full width. */}
      <BAIFlex style={{ flex: `2 1 ${LEGEND_BASIS}px` }} direction="column">
        <Table<LegendRow>
          data={legendRows}
          columns={columns}
          idKey="key"
          density="compact"
        />
      </BAIFlex>
    </BAIFlex>
  );
};

export default DonutChart;
