/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceChartPanelAuditLogTypeCountsQuery } from '../../__generated__/ResourceChartPanelAuditLogTypeCountsQuery.graphql';
import type { ResourceChartPanelAuditLogTypesQuery } from '../../__generated__/ResourceChartPanelAuditLogTypesQuery.graphql';
import PanelFrame from './PanelFrame';
import {
  ResourceTableBody,
  type ResourceTablePanelProps,
} from './ResourceTablePanel';
import { isClusterAuditScope } from './cards/AuditLogPanel';
import {
  CHART_GROUPINGS,
  auditEntityTypeGroups,
  chartCounts,
  chartTableFilter,
  chartWindow,
  combineFilters,
  entityTypesByFrequency,
  resolveChart,
  type ChartCount,
} from './chartSources';
import DonutChart from './charts/DonutChart';
import { formatBucketSpan } from './charts/bucketSpan';
import {
  countAliasVariables,
  countText,
  readCount,
  readCounts,
  type CountAlias,
} from './countAliases';
import { toDonutRows } from './memberCards/memberCardData';
import { resolvePanelTitle, resourceRegistry } from './resourceRegistry';
import { AUDIT_ENTITY_TYPES } from './superadminCards/superadminCardData';
import {
  isTimeChartType,
  type PanelChart,
  type PanelDescriptor,
  type ResourceKey,
} from './types';
import { useAuditLogQueryScope } from './useAuditLogQueryScope';
import { useDashboardQueryScope } from './useDashboardFilters';
import { Text } from '@lablup/ui-common/Text';
import { VStack } from '@lablup/ui-common/VStack';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartBar,
  ChartLine,
  ChartTooltip,
  RadialArea,
  RadialAxis,
  RadialChart,
  RadialGrid,
  useChartColors,
} from '@lablup/ui-common/lab';
import useResizeObserver from '@react-hook/resize-observer';
import * as stylex from '@stylexjs/stylex';
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
  auditLog: graphql`
    query ResourceChartPanelAuditLogQuery(
      $scope: AuditLogScope!
      $c0: AuditLogFilter
      $c0On: Boolean!
      $c1: AuditLogFilter
      $c1On: Boolean!
      $c2: AuditLogFilter
      $c2On: Boolean!
      $c3: AuditLogFilter
      $c3On: Boolean!
      $c4: AuditLogFilter
      $c4On: Boolean!
      $c5: AuditLogFilter
      $c5On: Boolean!
      $c6: AuditLogFilter
      $c6On: Boolean!
      $c7: AuditLogFilter
      $c7On: Boolean!
    ) {
      c0: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c0)
        @include(if: $c0On)
        @catch(to: RESULT) {
        count
      }
      c1: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c1)
        @include(if: $c1On)
        @catch(to: RESULT) {
        count
      }
      c2: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c2)
        @include(if: $c2On)
        @catch(to: RESULT) {
        count
      }
      c3: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c3)
        @include(if: $c3On)
        @catch(to: RESULT) {
        count
      }
      c4: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c4)
        @include(if: $c4On)
        @catch(to: RESULT) {
        count
      }
      c5: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c5)
        @include(if: $c5On)
        @catch(to: RESULT) {
        count
      }
      c6: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c6)
        @include(if: $c6On)
        @catch(to: RESULT) {
        count
      }
      c7: scopedAuditLogsV2(scope: $scope, limit: 1, offset: 0, filter: $c7)
        @include(if: $c7On)
        @catch(to: RESULT) {
        count
      }
    }
  `,
};

const ALIAS_KEYS = _.range(8).map((index) => `c${index}`);
const DAY_MS = 24 * 60 * 60 * 1000;

// The bar and line charts keep their axes readable down to this height.
const CHART_MIN_HEIGHT = 120;
// The chart's share of the panel when the table is listed under it.
const CHART_HEIGHT_WITH_TABLE = 200;

const styles = stylex.create({
  // Takes the panel's remaining height; the chart inside reads it back.
  fill: { flexGrow: 1, flexShrink: 1, flexBasis: '0%' },
  fixed: { flexShrink: 0 },
  content: { flexGrow: 1, flexShrink: 1, flexBasis: '0%', minHeight: 0 },
});

/**
 * The box a chart draws in: `fixedHeight` above a table, else the panel's
 * remaining height (at least `CHART_MIN_HEIGHT`), measured and handed to the
 * chart, whose height is a number.
 */
const ChartBox: React.FC<{
  fixedHeight?: number;
  children: React.ReactNode | ((height: number) => React.ReactNode);
}> = ({ fixedHeight, children }) => {
  'use memo';
  const rootRef = useRef<HTMLElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  useResizeObserver(
    rootRef as React.RefObject<HTMLElement>,
    ({ contentRect }) => setMeasuredHeight(contentRect.height),
  );
  const height = Math.max(
    CHART_MIN_HEIGHT,
    fixedHeight ?? Math.floor(measuredHeight),
  );
  return (
    <VStack
      ref={rootRef}
      align="stretch"
      height={fixedHeight}
      minHeight={fixedHeight ? undefined : CHART_MIN_HEIGHT}
      xstyle={fixedHeight ? styles.fixed : styles.fill}
    >
      {typeof children === 'function' ? children(height) : children}
    </VStack>
  );
};

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
  const now = refreshedAt ?? mountedAt;
  // The table lists the rows the chart counts; its window rides beside the
  // filter so a refresh does not send it back to page 1.
  const tableDescriptor: PanelDescriptor = {
    ...descriptor,
    tableWindow: chartWindow(chart, descriptor.range, now),
  };

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
          now={now}
        />
      </Suspense>
      {chart.showTable ? (
        <ResourceTableBody
          descriptor={tableDescriptor}
          fetchKey={fetchKey}
          panelId={panelId}
        />
      ) : null}
    </PanelFrame>
  );
};

/** The audit log chart's counts on the superadmin page, which reads every record. */
const AUDIT_LOG_CLUSTER_CHART_QUERY = graphql`
  query ResourceChartPanelAuditLogClusterQuery(
    $c0: AuditLogFilter
    $c0On: Boolean!
    $c1: AuditLogFilter
    $c1On: Boolean!
    $c2: AuditLogFilter
    $c2On: Boolean!
    $c3: AuditLogFilter
    $c3On: Boolean!
    $c4: AuditLogFilter
    $c4On: Boolean!
    $c5: AuditLogFilter
    $c5On: Boolean!
    $c6: AuditLogFilter
    $c6On: Boolean!
    $c7: AuditLogFilter
    $c7On: Boolean!
  ) {
    c0: adminAuditLogsV2(limit: 1, offset: 0, filter: $c0)
      @include(if: $c0On)
      @catch(to: RESULT) {
      count
    }
    c1: adminAuditLogsV2(limit: 1, offset: 0, filter: $c1)
      @include(if: $c1On)
      @catch(to: RESULT) {
      count
    }
    c2: adminAuditLogsV2(limit: 1, offset: 0, filter: $c2)
      @include(if: $c2On)
      @catch(to: RESULT) {
      count
    }
    c3: adminAuditLogsV2(limit: 1, offset: 0, filter: $c3)
      @include(if: $c3On)
      @catch(to: RESULT) {
      count
    }
    c4: adminAuditLogsV2(limit: 1, offset: 0, filter: $c4)
      @include(if: $c4On)
      @catch(to: RESULT) {
      count
    }
    c5: adminAuditLogsV2(limit: 1, offset: 0, filter: $c5)
      @include(if: $c5On)
      @catch(to: RESULT) {
      count
    }
    c6: adminAuditLogsV2(limit: 1, offset: 0, filter: $c6)
      @include(if: $c6On)
      @catch(to: RESULT) {
      count
    }
    c7: adminAuditLogsV2(limit: 1, offset: 0, filter: $c7)
      @include(if: $c7On)
      @catch(to: RESULT) {
      count
    }
  }
`;

/** The newest and the oldest audit log rows a chart reads for entity types the fixed list lacks. */
const ENTITY_TYPE_SAMPLE_SIZE = 500;
/** Entity types a chart counts to rank them; one count alias each. */
const MAX_ENTITY_TYPE_CANDIDATES = 16;
const CANDIDATE_KEYS = _.range(MAX_ENTITY_TYPE_CANDIDATES).map((i) => `k${i}`);

/**
 * Entity types of an audit log chart grouped by entity type, ranked by the
 * manager's count; empty for any other chart. The candidates are the types in
 * the newest and the oldest rows plus the fixed list, so a type frequent at
 * either end of the range, or overall, gets its own slice.
 */
const useRankedAuditEntityTypes = (
  isEnabled: boolean,
  scope: unknown,
  filter: PanelDescriptor['filter'],
  fetchKey?: string,
): Array<string> => {
  'use memo';
  const auditFilter = (
    filter && typeof filter === 'object' ? filter : null
  ) as ResourceChartPanelAuditLogTypesQuery['variables']['filter'];
  const auditScope = (scope ??
    {}) as ResourceChartPanelAuditLogTypesQuery['variables']['scope'];
  const sampleVariables = useDeferredValue({
    scope: auditScope,
    filter: auditFilter,
    limit: ENTITY_TYPE_SAMPLE_SIZE,
    on: isEnabled,
  });
  // Off, every field is skipped, so neither query sends anything.
  const fetchPolicy = isEnabled ? 'store-and-network' : 'store-only';
  const sampleData = useLazyLoadQuery<ResourceChartPanelAuditLogTypesQuery>(
    isClusterAuditScope(auditScope)
      ? graphql`
          query ResourceChartPanelAuditLogTypesClusterQuery(
            $filter: AuditLogFilter
            $limit: Int!
            $on: Boolean!
          ) {
            newest: adminAuditLogsV2(
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: DESC }]
              limit: $limit
            ) @include(if: $on) @catch(to: RESULT) {
              edges {
                node {
                  entityType
                }
              }
            }
            oldest: adminAuditLogsV2(
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: ASC }]
              limit: $limit
            ) @include(if: $on) @catch(to: RESULT) {
              edges {
                node {
                  entityType
                }
              }
            }
          }
        `
      : graphql`
          query ResourceChartPanelAuditLogTypesQuery(
            $scope: AuditLogScope!
            $filter: AuditLogFilter
            $limit: Int!
            $on: Boolean!
          ) {
            newest: scopedAuditLogsV2(
              scope: $scope
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: DESC }]
              limit: $limit
            ) @include(if: $on) @catch(to: RESULT) {
              edges {
                node {
                  entityType
                }
              }
            }
            oldest: scopedAuditLogsV2(
              scope: $scope
              filter: $filter
              orderBy: [{ field: CREATED_AT, direction: ASC }]
              limit: $limit
            ) @include(if: $on) @catch(to: RESULT) {
              edges {
                node {
                  entityType
                }
              }
            }
          }
        `,
    sampleVariables,
    { fetchPolicy, fetchKey },
  );
  const sampled = [sampleData.newest, sampleData.oldest].flatMap((result) =>
    result?.ok ? _.compact(result.value?.edges.map((e) => e?.node)) : [],
  );
  const candidates = isEnabled
    ? _.uniq([...entityTypesByFrequency(sampled), ...AUDIT_ENTITY_TYPES]).slice(
        0,
        MAX_ENTITY_TYPE_CANDIDATES,
      )
    : [];
  const countData = useLazyLoadQuery<ResourceChartPanelAuditLogTypeCountsQuery>(
    isClusterAuditScope(auditScope)
      ? graphql`
          query ResourceChartPanelAuditLogTypeCountsClusterQuery(
            $k0: AuditLogFilter
            $k0On: Boolean!
            $k1: AuditLogFilter
            $k1On: Boolean!
            $k2: AuditLogFilter
            $k2On: Boolean!
            $k3: AuditLogFilter
            $k3On: Boolean!
            $k4: AuditLogFilter
            $k4On: Boolean!
            $k5: AuditLogFilter
            $k5On: Boolean!
            $k6: AuditLogFilter
            $k6On: Boolean!
            $k7: AuditLogFilter
            $k7On: Boolean!
            $k8: AuditLogFilter
            $k8On: Boolean!
            $k9: AuditLogFilter
            $k9On: Boolean!
            $k10: AuditLogFilter
            $k10On: Boolean!
            $k11: AuditLogFilter
            $k11On: Boolean!
            $k12: AuditLogFilter
            $k12On: Boolean!
            $k13: AuditLogFilter
            $k13On: Boolean!
            $k14: AuditLogFilter
            $k14On: Boolean!
            $k15: AuditLogFilter
            $k15On: Boolean!
          ) {
            k0: adminAuditLogsV2(filter: $k0, limit: 1)
              @include(if: $k0On)
              @catch(to: RESULT) {
              count
            }
            k1: adminAuditLogsV2(filter: $k1, limit: 1)
              @include(if: $k1On)
              @catch(to: RESULT) {
              count
            }
            k2: adminAuditLogsV2(filter: $k2, limit: 1)
              @include(if: $k2On)
              @catch(to: RESULT) {
              count
            }
            k3: adminAuditLogsV2(filter: $k3, limit: 1)
              @include(if: $k3On)
              @catch(to: RESULT) {
              count
            }
            k4: adminAuditLogsV2(filter: $k4, limit: 1)
              @include(if: $k4On)
              @catch(to: RESULT) {
              count
            }
            k5: adminAuditLogsV2(filter: $k5, limit: 1)
              @include(if: $k5On)
              @catch(to: RESULT) {
              count
            }
            k6: adminAuditLogsV2(filter: $k6, limit: 1)
              @include(if: $k6On)
              @catch(to: RESULT) {
              count
            }
            k7: adminAuditLogsV2(filter: $k7, limit: 1)
              @include(if: $k7On)
              @catch(to: RESULT) {
              count
            }
            k8: adminAuditLogsV2(filter: $k8, limit: 1)
              @include(if: $k8On)
              @catch(to: RESULT) {
              count
            }
            k9: adminAuditLogsV2(filter: $k9, limit: 1)
              @include(if: $k9On)
              @catch(to: RESULT) {
              count
            }
            k10: adminAuditLogsV2(filter: $k10, limit: 1)
              @include(if: $k10On)
              @catch(to: RESULT) {
              count
            }
            k11: adminAuditLogsV2(filter: $k11, limit: 1)
              @include(if: $k11On)
              @catch(to: RESULT) {
              count
            }
            k12: adminAuditLogsV2(filter: $k12, limit: 1)
              @include(if: $k12On)
              @catch(to: RESULT) {
              count
            }
            k13: adminAuditLogsV2(filter: $k13, limit: 1)
              @include(if: $k13On)
              @catch(to: RESULT) {
              count
            }
            k14: adminAuditLogsV2(filter: $k14, limit: 1)
              @include(if: $k14On)
              @catch(to: RESULT) {
              count
            }
            k15: adminAuditLogsV2(filter: $k15, limit: 1)
              @include(if: $k15On)
              @catch(to: RESULT) {
              count
            }
          }
        `
      : graphql`
          query ResourceChartPanelAuditLogTypeCountsQuery(
            $scope: AuditLogScope!
            $k0: AuditLogFilter
            $k0On: Boolean!
            $k1: AuditLogFilter
            $k1On: Boolean!
            $k2: AuditLogFilter
            $k2On: Boolean!
            $k3: AuditLogFilter
            $k3On: Boolean!
            $k4: AuditLogFilter
            $k4On: Boolean!
            $k5: AuditLogFilter
            $k5On: Boolean!
            $k6: AuditLogFilter
            $k6On: Boolean!
            $k7: AuditLogFilter
            $k7On: Boolean!
            $k8: AuditLogFilter
            $k8On: Boolean!
            $k9: AuditLogFilter
            $k9On: Boolean!
            $k10: AuditLogFilter
            $k10On: Boolean!
            $k11: AuditLogFilter
            $k11On: Boolean!
            $k12: AuditLogFilter
            $k12On: Boolean!
            $k13: AuditLogFilter
            $k13On: Boolean!
            $k14: AuditLogFilter
            $k14On: Boolean!
            $k15: AuditLogFilter
            $k15On: Boolean!
          ) {
            k0: scopedAuditLogsV2(scope: $scope, filter: $k0, limit: 1)
              @include(if: $k0On)
              @catch(to: RESULT) {
              count
            }
            k1: scopedAuditLogsV2(scope: $scope, filter: $k1, limit: 1)
              @include(if: $k1On)
              @catch(to: RESULT) {
              count
            }
            k2: scopedAuditLogsV2(scope: $scope, filter: $k2, limit: 1)
              @include(if: $k2On)
              @catch(to: RESULT) {
              count
            }
            k3: scopedAuditLogsV2(scope: $scope, filter: $k3, limit: 1)
              @include(if: $k3On)
              @catch(to: RESULT) {
              count
            }
            k4: scopedAuditLogsV2(scope: $scope, filter: $k4, limit: 1)
              @include(if: $k4On)
              @catch(to: RESULT) {
              count
            }
            k5: scopedAuditLogsV2(scope: $scope, filter: $k5, limit: 1)
              @include(if: $k5On)
              @catch(to: RESULT) {
              count
            }
            k6: scopedAuditLogsV2(scope: $scope, filter: $k6, limit: 1)
              @include(if: $k6On)
              @catch(to: RESULT) {
              count
            }
            k7: scopedAuditLogsV2(scope: $scope, filter: $k7, limit: 1)
              @include(if: $k7On)
              @catch(to: RESULT) {
              count
            }
            k8: scopedAuditLogsV2(scope: $scope, filter: $k8, limit: 1)
              @include(if: $k8On)
              @catch(to: RESULT) {
              count
            }
            k9: scopedAuditLogsV2(scope: $scope, filter: $k9, limit: 1)
              @include(if: $k9On)
              @catch(to: RESULT) {
              count
            }
            k10: scopedAuditLogsV2(scope: $scope, filter: $k10, limit: 1)
              @include(if: $k10On)
              @catch(to: RESULT) {
              count
            }
            k11: scopedAuditLogsV2(scope: $scope, filter: $k11, limit: 1)
              @include(if: $k11On)
              @catch(to: RESULT) {
              count
            }
            k12: scopedAuditLogsV2(scope: $scope, filter: $k12, limit: 1)
              @include(if: $k12On)
              @catch(to: RESULT) {
              count
            }
            k13: scopedAuditLogsV2(scope: $scope, filter: $k13, limit: 1)
              @include(if: $k13On)
              @catch(to: RESULT) {
              count
            }
            k14: scopedAuditLogsV2(scope: $scope, filter: $k14, limit: 1)
              @include(if: $k14On)
              @catch(to: RESULT) {
              count
            }
            k15: scopedAuditLogsV2(scope: $scope, filter: $k15, limit: 1)
              @include(if: $k15On)
              @catch(to: RESULT) {
              count
            }
          }
        `,
    {
      scope: auditScope,
      ...Object.fromEntries(
        CANDIDATE_KEYS.flatMap((key, index) => {
          const type = candidates[index];
          const typeFilter = { entityType: { equals: type } };
          return [
            [
              key,
              type
                ? auditFilter
                  ? { AND: [auditFilter, typeFilter] }
                  : typeFilter
                : null,
            ],
            [`${key}On`, !!type],
          ];
        }),
      ),
    } as ResourceChartPanelAuditLogTypeCountsQuery['variables'],
    { fetchPolicy, fetchKey },
  ) as unknown as Record<string, CountAlias>;
  return _.orderBy(
    candidates
      .map((type, index) => ({
        type,
        count: readCount(countData[CANDIDATE_KEYS[index]]).count,
      }))
      .filter(({ count }) => count > 0),
    ['count', 'type'],
    ['desc', 'asc'],
  ).map(({ type }) => type);
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
  const auditScope = useAuditLogQueryScope(source);
  const config = resourceRegistry[source];
  const nextChart = resolveChart(source, descriptor.chart);
  const groupsByData =
    source === 'auditLog' &&
    nextChart.groupBy === 'entityType' &&
    !isTimeChartType(nextChart.type);
  const frequentTypes = useRankedAuditEntityTypes(
    groupsByData,
    auditScope,
    chartTableFilter(
      source,
      descriptor.filter,
      chartWindow(nextChart, descriptor.range, now),
    ),
    fetchKey,
  );
  const nextCounts = chartCounts(
    source,
    nextChart,
    descriptor.range,
    now,
    groupsByData ? auditEntityTypeGroups(frequentTypes) : undefined,
  );

  const variablesOf = (filter: PanelDescriptor['filter']) =>
    config.buildVariables({
      filter: filter ?? undefined,
      order: config.defaultOrder,
      limit: 1,
      offset: 0,
      ...queryScope,
      auditScope,
      resourceGroups: descriptor.resourceGroups,
    });
  const nextVariables = {
    ..._.pick(variablesOf(descriptor.filter), ['scopeId', 'scope']),
    ...countAliasVariables(
      'c',
      nextCounts.map(
        (count) =>
          variablesOf(combineFilters(descriptor.filter, count.filter)).filter ??
          null,
      ),
    ),
  };
  // Deferred as one, so the old chart stays whole until the new counts arrive
  // instead of drawing old counts under new groups or buckets.
  // The chart's shape, not its time window: a refresh moves the window and must keep the drawn chart.
  const requestKey = JSON.stringify([
    nextChart,
    nextCounts.map(({ key }) => key),
    descriptor.range ?? null,
  ]);
  const { chart, counts, variables, shownKey } = useDeferredValue({
    chart: nextChart,
    counts: nextCounts,
    variables: nextVariables,
    shownKey: requestKey,
  });
  const deferredFetchKey = useDeferredValue(fetchKey);
  // A refresh updates in the background; a new chart shape shows a skeleton until its counts arrive.
  const isSwitching = shownKey !== requestKey;
  const data = useLazyLoadQuery(
    source === 'auditLog' && isClusterAuditScope(auditScope)
      ? AUDIT_LOG_CLUSTER_CHART_QUERY
      : CHART_QUERIES[source],
    variables,
    {
      fetchPolicy: 'store-and-network',
      fetchKey: deferredFetchKey,
    },
  ) as Record<string, CountAlias>;
  const values = readCounts(data, ALIAS_KEYS.slice(0, counts.length));
  const points = counts.map((count, index) => ({
    count,
    value: values[ALIAS_KEYS[index]],
  }));
  const title = resolvePanelTitle(descriptor, t);
  const fixedHeight = chart.showTable ? CHART_HEIGHT_WITH_TABLE : undefined;

  const grouping = CHART_GROUPINGS[source].find(
    ({ key }) => key === chart.groupBy,
  );
  const chartBody =
    chart.type === 'donut' || chart.type === 'pie' ? (
      <ChartBox fixedHeight={fixedHeight}>
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
          isPie={chart.type === 'pie'}
        />
      </ChartBox>
    ) : chart.type === 'radar' ? (
      <RadarCountChart
        label={title}
        points={points}
        fixedHeight={fixedHeight}
      />
    ) : (
      <CountChart
        chart={chart}
        label={title}
        points={points}
        fixedHeight={fixedHeight}
      />
    );
  return (
    <VStack
      align="stretch"
      gap={2}
      aria-busy={isSwitching}
      xstyle={fixedHeight ? undefined : styles.content}
    >
      {isSwitching ? (
        <ChartBox fixedHeight={fixedHeight}>
          <BAISkeleton />
        </ChartBox>
      ) : (
        chartBody
      )}
    </VStack>
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
  const isTime = isTimeChartType(chart.type);
  // A bucket shows its start time; a range longer than a day also needs the date.
  const first = points[0]?.count.window;
  const last = points[points.length - 1]?.count.window;
  const spansDays =
    !!first &&
    !!last &&
    new Date(last.before).getTime() - new Date(first.after).getTime() > DAY_MS;
  const data = points.map(({ count, value }, index) => ({
    x: isTime ? index : count.label(t),
    value: value ?? 0,
    // A denied count reads "-", as the donut and the other cards show it.
    countText: value === null ? countText(value) : value.toLocaleString(),
    zero: 0,
    tooltip:
      isTime && count.window ? formatBucketSpan(count.window) : count.label(t),
  }));
  const color = colors.categorical(1)[0];

  return (
    <ChartBox fixedHeight={fixedHeight}>
      {(height) => (
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
            maxTicks={isTime ? 4 : 8}
            truncate={12}
            tickFormat={
              isTime
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
          {chart.type === 'line' || chart.type === 'area' ? (
            <>
              {chart.type === 'area' ? (
                <ChartArea yUpper="value" yLower="zero" color={color} />
              ) : null}
              <ChartLine dataKey="value" color={color} strokeWidth={2} />
            </>
          ) : (
            <ChartBar dataKey="value" color={color} radius={2} />
          )}
          <ChartTooltip
            render={(datum) => (
              <BAIFlex direction="column" align="start">
                <Text type="supporting">{String(datum.tooltip)}</Text>
                <Text>{`${t('dashboard.card.Count')}: ${String(datum.countText)}`}</Text>
              </BAIFlex>
            )}
          />
        </Chart>
      )}
    </ChartBox>
  );
};

/** A spider of counts, one axis per group; offered only for three groups or more. */
const RadarCountChart: React.FC<{
  label: string;
  points: ReadonlyArray<{ count: ChartCount; value: number | null }>;
  fixedHeight?: number;
}> = ({ label, points, fixedHeight }) => {
  'use memo';
  const { t } = useTranslation();
  const colors = useChartColors();
  const axes = points.map(({ count }) => count.label(t));
  const max = Math.max(1, ...points.map(({ value }) => value ?? 0));
  // RadialChart scales each axis to its own maximum; the undrawn `scale` row gives every axis the same one.
  const data = [
    {
      series: 'count',
      ...Object.fromEntries(
        points.map(({ count, value }) => [count.label(t), value ?? 0]),
      ),
    },
    { series: 'scale', ...Object.fromEntries(axes.map((axis) => [axis, max])) },
  ];

  return (
    <ChartBox fixedHeight={fixedHeight}>
      {(height) => (
        <RadialChart data={data} axes={axes} height={height} label={label}>
          <RadialGrid />
          <RadialArea dataKey="count" color={colors.categorical(1)[0]} dots />
          <RadialAxis />
        </RadialChart>
      )}
    </ChartBox>
  );
};

export default ResourceChartPanel;
