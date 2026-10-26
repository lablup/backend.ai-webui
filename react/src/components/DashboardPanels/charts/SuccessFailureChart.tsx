/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DateTimeWindow } from '../timeRange';
import { Text } from '@lablup/ui-common/Text';
import {
  Chart,
  ChartAxis,
  ChartLegend,
  ChartLine,
  ChartTooltip,
  useChartColors,
} from '@lablup/ui-common/lab';
import { BAIFlex } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';

export interface SuccessFailureChartProps {
  /** The bucket windows, oldest first. */
  buckets: ReadonlyArray<DateTimeWindow>;
  successTrend: ReadonlyArray<number>;
  failureTrend: ReadonlyArray<number>;
  labels: { success: string; failure: string; chart: string };
  height?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Manager-counted success and failure per bucket as two lines, with a legend and tooltip. */
const SuccessFailureChart: React.FC<SuccessFailureChartProps> = ({
  buckets,
  successTrend,
  failureTrend,
  labels,
  height = 120,
}) => {
  'use memo';
  const { semantic } = useChartColors();
  const spansDays =
    buckets.length > 0 &&
    new Date(buckets[buckets.length - 1].before).getTime() -
      new Date(buckets[0].after).getTime() >
      DAY_MS;
  const format = spansDays ? 'MM/DD' : 'HH:mm';
  const points = buckets.map((bucket, index) => ({
    bucket: dayjs(bucket.after).format(format),
    end: dayjs(bucket.before).format(format),
    success: successTrend[index] ?? 0,
    failure: failureTrend[index] ?? 0,
  }));

  if (points.length < 2) return null;
  return (
    <BAIFlex direction="column" align="stretch" gap="xxs">
      <Chart
        data={points}
        xKey="bucket"
        yKeys={['success', 'failure']}
        height={height}
        label={labels.chart}
      >
        <ChartAxis position="bottom" maxTicks={points.length} />
        <ChartAxis position="left" tickCount={3} />
        <ChartLine dataKey="success" color={semantic.positive} dots />
        <ChartLine dataKey="failure" color={semantic.negative} dots />
        <ChartTooltip
          render={(datum) => (
            <BAIFlex direction="column" align="start">
              <Text type="supporting">{`${datum.bucket} - ${datum.end}`}</Text>
              <Text>{`${labels.success}: ${datum.success}`}</Text>
              <Text>{`${labels.failure}: ${datum.failure}`}</Text>
            </BAIFlex>
          )}
        />
      </Chart>
      <ChartLegend
        items={[
          { label: labels.success, color: semantic.positive },
          { label: labels.failure, color: semantic.negative },
        ]}
      />
    </BAIFlex>
  );
};

export default SuccessFailureChart;
