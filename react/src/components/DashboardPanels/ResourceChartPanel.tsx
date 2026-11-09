/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import PanelFrame from './PanelFrame';
import {
  ResourceTableBody,
  type ResourceTablePanelProps,
} from './ResourceTablePanel';
import {
  CHART_GROUPINGS,
  chartCounts,
  combineFilters,
  resolveChart,
  type ChartCount,
} from './chartSources';
import DonutChart from './charts/DonutChart';
import { formatBucketSpan } from './charts/bucketSpan';
import {
  countAliasVariables,
  readCounts,
  type CountAlias,
} from './countAliases';
import { toDonutRows } from './memberCards/memberCardData';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import type { PanelChart, PanelDescriptor, ResourceKey } from './types';
import { useDashboardQueryScope } from './useDashboardFilters';
import { Text } from '@lablup/ui-common/Text';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartLine,
  ChartTooltip,
  useChartColors,
} from '@lablup/ui-common/lab';
import useResizeObserver from '@react-hook/resize-observer';
import { BAIFlex, BAISkeleton } from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import React, { Suspense, useDeferredValue, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import type { GraphQLTaggedNode } from 'relay-runtime';

// One statically compiled query per source, each with a count alias per group or bucket.
const CHART_QUERIES: Record<ResourceKey, GraphQLTaggedNode> = {
  session: graphql`
    query ResourceChartPanelSessionQuery(
      $scopeId: ScopeField
      $c0: String
      $c0On: Boolean!
      $c1: String
      $c1On: Boolean!
      $c2: String
      $c2On: Boolean!
      $c3: String
      $c3On: Boolean!
      $c4: String
      $c4On: Boolean!
      $c5: String
      $c5On: Boolean!
      $c6: String
      $c6On: Boolean!
      $c7: String
      $c7On: Boolean!
    ) {
      c0: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c0
      ) @include(if: $c0On) @catch(to: RESULT) {
        count
      }
      c1: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c1
      ) @include(if: $c1On) @catch(to: RESULT) {
        count
      }
      c2: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c2
      ) @include(if: $c2On) @catch(to: RESULT) {
        count
      }
      c3: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c3
      ) @include(if: $c3On) @catch(to: RESULT) {
        count
      }
      c4: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c4
      ) @include(if: $c4On) @catch(to: RESULT) {
        count
      }
      c5: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c5
      ) @include(if: $c5On) @catch(to: RESULT) {
        count
      }
      c6: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c6
      ) @include(if: $c6On) @catch(to: RESULT) {
        count
      }
      c7: compute_session_nodes(
        scope_id: $scopeId
        first: 1
        offset: 0
        filter: $c7
      ) @include(if: $c7On) @catch(to: RESULT) {
        count
      }
    }
  `,
  deployment: graphql`
    query ResourceChartPanelDeploymentQuery(
      $scope: DeploymentSearchScope!
      $c0: DeploymentFilter
      $c0On: Boolean!
      $c1: DeploymentFilter
      $c1On: Boolean!
      $c2: DeploymentFilter
      $c2On: Boolean!
      $c3: DeploymentFilter
      $c3On: Boolean!
      $c4: DeploymentFilter
      $c4On: Boolean!
      $c5: DeploymentFilter
      $c5On: Boolean!
      $c6: DeploymentFilter
      $c6On: Boolean!
      $c7: DeploymentFilter
      $c7On: Boolean!
    ) {
      c0: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c0)
        @include(if: $c0On)
        @catch(to: RESULT) {
        count
      }
      c1: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c1)
        @include(if: $c1On)
        @catch(to: RESULT) {
        count
      }
      c2: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c2)
        @include(if: $c2On)
        @catch(to: RESULT) {
        count
      }
      c3: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c3)
        @include(if: $c3On)
        @catch(to: RESULT) {
        count
      }
      c4: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c4)
        @include(if: $c4On)
        @catch(to: RESULT) {
        count
      }
      c5: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c5)
        @include(if: $c5On)
        @catch(to: RESULT) {
        count
      }
      c6: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c6)
        @include(if: $c6On)
        @catch(to: RESULT) {
        count
      }
      c7: scopedDeployments(scope: $scope, limit: 1, offset: 0, filter: $c7)
        @include(if: $c7On)
        @catch(to: RESULT) {
        count
      }
    }
  `,
  vfolder: graphql`
    query ResourceChartPanelVfolderQuery(
      $scope: VFolderScope!
      $c0: VFolderFilter
      $c0On: Boolean!
      $c1: VFolderFilter
      $c1On: Boolean!
      $c2: VFolderFilter
      $c2On: Boolean!
      $c3: VFolderFilter
      $c3On: Boolean!
      $c4: VFolderFilter
      $c4On: Boolean!
      $c5: VFolderFilter
      $c5On: Boolean!
      $c6: VFolderFilter
      $c6On: Boolean!
      $c7: VFolderFilter
      $c7On: Boolean!
    ) {
      c0: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c0)
        @include(if: $c0On)
        @catch(to: RESULT) {
        count
      }
      c1: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c1)
        @include(if: $c1On)
        @catch(to: RESULT) {
        count
      }
      c2: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c2)
        @include(if: $c2On)
        @catch(to: RESULT) {
        count
      }
      c3: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c3)
        @include(if: $c3On)
        @catch(to: RESULT) {
        count
      }
      c4: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c4)
        @include(if: $c4On)
        @catch(to: RESULT) {
        count
      }
      c5: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c5)
        @include(if: $c5On)
        @catch(to: RESULT) {
        count
      }
      c6: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c6)
        @include(if: $c6On)
        @catch(to: RESULT) {
        count
      }
      c7: scopedVFoldersV2(scope: $scope, limit: 1, offset: 0, filter: $c7)
        @include(if: $c7On)
        @catch(to: RESULT) {
        count
      }
    }
  `,
};

const ALIAS_KEYS = _.range(8).map((index) => `c${index}`);

// The bar and line charts keep their axes readable down to this height.
const CHART_MIN_HEIGHT = 120;
// The chart's share of the panel when the table is listed under it.
const CHART_HEIGHT_WITH_TABLE = 200;

/**
 * A custom panel drawn as a chart: a donut or bar of counts per group, or a
 * line of rows created per bucket of its range, optionally above its table.
 */
const ResourceChartPanel: React.FC<ResourceTablePanelProps> = ({
  descriptor,
  fetchKey,
  refreshedAt,
  onEdit,
  onRemove,
  panelId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const chart = resolveChart(descriptor.resourceType, descriptor.chart);
  const [mountedAt] = useState(() => Date.now());

  return (
    <PanelFrame
      title={resolvePanelTitle(descriptor, t)}
      onEdit={onEdit}
      onRemove={onRemove}
    >
      <Suspense fallback={<BAISkeleton />}>
        <ResourceChartContent
          key={`${descriptor.resourceType}:${JSON.stringify(descriptor.filter ?? null)}`}
          descriptor={descriptor}
          fetchKey={fetchKey}
          now={refreshedAt ?? mountedAt}
        />
      </Suspense>
      {chart.showTable ? (
        <ResourceTableBody
          descriptor={descriptor}
          fetchKey={fetchKey}
          panelId={panelId}
        />
      ) : null}
    </PanelFrame>
  );
};

/** Suspending inner half: counts every group or bucket in one request and draws them; also the modal's preview. */
export const ResourceChartContent: React.FC<{
  descriptor: PanelDescriptor;
  fetchKey?: string;
  /** The time a line's buckets end at. */
  now: number;
}> = ({ descriptor, fetchKey, now }) => {
  'use memo';
  const { t } = useTranslation();
  const queryScope = useDashboardQueryScope();
  const source = descriptor.resourceType;
  const config = resourceRegistry[source];
  const chart = resolveChart(source, descriptor.chart);
  const counts = chartCounts(source, chart, now);

  const variablesOf = (filter: PanelDescriptor['filter']) =>
    config.buildVariables({
      filter: filter ?? undefined,
      order: config.defaultOrder,
      limit: 1,
      offset: 0,
      ...queryScope,
      resourceGroups: descriptor.resourceGroups,
    });
  const variables = {
    ..._.pick(variablesOf(descriptor.filter), ['scopeId', 'scope']),
    ...countAliasVariables(
      'c',
      counts.map(
        (count) =>
          variablesOf(combineFilters(descriptor.filter, count.filter)).filter ??
          null,
      ),
    ),
  };
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);
  const data = useLazyLoadQuery(CHART_QUERIES[source], deferredVariables, {
    fetchPolicy: 'store-and-network',
    fetchKey: deferredFetchKey,
  }) as Record<string, CountAlias>;
  const values = readCounts(data, ALIAS_KEYS.slice(0, counts.length));
  const points = counts.map((count, index) => ({
    count,
    value: values[ALIAS_KEYS[index]],
  }));
  const title = resolvePanelTitle(descriptor, t);
  const fixedHeight = chart.showTable ? CHART_HEIGHT_WITH_TABLE : undefined;

  if (chart.type === 'donut') {
    const grouping = CHART_GROUPINGS[source].find(
      ({ key }) => key === chart.groupBy,
    );
    return (
      <BAIFlex
        direction="column"
        align="stretch"
        style={
          fixedHeight
            ? { height: fixedHeight, flex: 'none' }
            : { flex: 1, minHeight: CHART_MIN_HEIGHT }
        }
      >
        <DonutChart
          label={title}
          emptyText={t('dashboard.panelModal.NoMatchingRows')}
          columnLabels={{
            name: grouping ? t(grouping.labelKey) : title,
            value: t('dashboard.card.Count'),
            percent: t('dashboard.card.Share'),
          }}
          rows={toDonutRows(
            points.map(({ count, value }) => ({
              key: count.key,
              label: count.label(t),
              count: value,
            })),
          )}
        />
      </BAIFlex>
    );
  }
  return (
    <CountChart
      chart={chart}
      label={title}
      points={points}
      fixedHeight={fixedHeight}
    />
  );
};

/** A bar of counts per group, or a line of counts per bucket; it fills the panel's height. */
const CountChart: React.FC<{
  chart: PanelChart;
  label: string;
  points: ReadonlyArray<{ count: ChartCount; value: number | null }>;
  fixedHeight?: number;
}> = ({ chart, label, points, fixedHeight }) => {
  'use memo';
  const { t } = useTranslation();
  const colors = useChartColors();
  const rootRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  useResizeObserver(rootRef, ({ contentRect }) =>
    setMeasuredHeight(contentRect.height),
  );
  const height = Math.max(
    CHART_MIN_HEIGHT,
    fixedHeight ?? Math.floor(measuredHeight),
  );
  const isLine = chart.type === 'line';
  // A bucket shows its start time; a 7-day range also needs the date.
  const spansDays = chart.range === 'now-7d';
  const data = points.map(({ count, value }, index) => ({
    x: isLine ? index : count.label(t),
    value: value ?? 0,
    tooltip:
      isLine && count.window ? formatBucketSpan(count.window) : count.label(t),
  }));
  const color = colors.categorical(1)[0];

  return (
    <BAIFlex
      ref={rootRef}
      direction="column"
      align="stretch"
      style={
        fixedHeight
          ? { height: fixedHeight, flex: 'none' }
          : { flex: 1, minHeight: CHART_MIN_HEIGHT }
      }
    >
      <Chart
        data={data}
        xKey="x"
        yKeys={['value']}
        height={height}
        // From zero, so an all-zero chart lies on the baseline.
        yDomain={[0, Math.max(1, ...data.map(({ value }) => value))]}
        label={label}
      >
        <ChartAxis
          position="bottom"
          maxTicks={isLine ? 4 : 8}
          truncate={12}
          tickFormat={
            isLine
              ? (value) => {
                  const window = points[Number(value)]?.count.window;
                  return window
                    ? dayjs(window.after).format(spansDays ? 'MM/DD' : 'LT')
                    : '';
                }
              : undefined
          }
        />
        <ChartAxis
          position="left"
          tickCount={4}
          tickFormat={(value) =>
            Number.isInteger(Number(value)) ? String(value) : ''
          }
        />
        {isLine ? (
          <ChartLine dataKey="value" color={color} strokeWidth={2} />
        ) : (
          <ChartBar dataKey="value" color={color} radius={2} />
        )}
        <ChartTooltip
          render={(datum) => (
            <BAIFlex direction="column" align="start">
              <Text type="supporting">{String(datum.tooltip)}</Text>
              <Text>{`${t('dashboard.card.Count')}: ${Number(datum.value).toLocaleString()}`}</Text>
            </BAIFlex>
          )}
        />
      </Chart>
    </BAIFlex>
  );
};

export default ResourceChartPanel;
