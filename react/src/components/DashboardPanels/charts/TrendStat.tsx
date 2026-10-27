/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { previousWindow, type CountDelta } from '../countAliases';
import type { DateTimeWindow } from '../timeRange';
import { formatBucketSpan } from './bucketSpan';
import { Text } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  Chart,
  ChartArea,
  ChartLine,
  ChartTooltip,
  Stat,
  useChartColors,
  type StatProps,
} from '@lablup/ui-common/lab';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export interface TrendStatProps extends Omit<StatProps, 'delta'> {
  /** The change from the previous range; `sentiment` flips the colour for counts where up is bad. */
  delta?: CountDelta & { sentiment?: 'positive' | 'negative' | 'neutral' };
  /** Manager-counted bucket values, oldest first, drawn as a sparkline. */
  trend?: ReadonlyArray<number>;
  /** The bucket windows behind `trend`, oldest first; hovering a point shows its span and value. */
  buckets?: ReadonlyArray<DateTimeWindow>;
  trendColor?: 'positive' | 'negative' | 'neutral';
}

const SPARKLINE_HEIGHT = 32;

/** The dashboard's one stat: a count, its change from the previous range, and a bucket sparkline (else `media`). */
const TrendStat: React.FC<TrendStatProps> = ({
  delta,
  trend,
  buckets,
  trendColor = 'neutral',
  ...statProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const colors = useChartColors();
  const color = colors.semantic[trendColor];
  const points = (trend ?? []).map((value, index) => ({
    bucket: index,
    value,
    zero: 0,
    span: buckets?.[index] ? formatBucketSpan(buckets[index]) : undefined,
  }));
  const media =
    points.length > 1 ? (
      <Chart
        data={points}
        xKey="bucket"
        yKeys={['value']}
        height={SPARKLINE_HEIGHT}
        margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
        label={statProps.label}
      >
        <ChartArea yUpper="value" yLower="zero" color={color} />
        <ChartLine dataKey="value" color={color} strokeWidth={1.5} />
        <ChartTooltip
          render={(datum) => (
            <BAIFlex direction="column" align="start">
              {datum.span ? (
                <Text type="supporting">{String(datum.span)}</Text>
              ) : null}
              <Text>{`${statProps.label}: ${datum.value}`}</Text>
            </BAIFlex>
          )}
        />
      </Chart>
    ) : (
      statProps.media
    );
  const statDelta = delta && {
    value: delta.value,
    direction: delta.direction,
    sentiment: delta.sentiment,
  };
  const deltaExplanation = delta?.window
    ? t('dashboard.card.DeltaTooltip', {
        previousSpan: formatBucketSpan(previousWindow(delta.window)),
        previous: delta.previous.toLocaleString(),
        currentSpan: formatBucketSpan(delta.window),
        current: delta.current.toLocaleString(),
      })
    : undefined;

  if (!deltaExplanation) {
    return <Stat size="md" {...statProps} delta={statDelta} media={media} />;
  }
  // The sparkline keeps its own point tooltip, so it sits outside the stat's.
  return (
    <BAIFlex direction="column" align="stretch" gap="xs">
      <Tooltip content={deltaExplanation} hasHoverIndication={false}>
        <Stat
          size="md"
          {...statProps}
          delta={statDelta}
          media={undefined}
          tabIndex={0}
        />
      </Tooltip>
      {media}
    </BAIFlex>
  );
};

export default TrendStat;
