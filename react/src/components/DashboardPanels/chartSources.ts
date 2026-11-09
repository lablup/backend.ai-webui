/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { getSessionTypeLabel } from '../../helper/sessionTypeLabel';
import { DEFAULT_RANGE, isRangePreset } from './panelSettings';
import {
  MAX_BUCKETS,
  planBuckets,
  withinWindow,
  type DateTimeWindow,
} from './timeRange';
import {
  CHART_TYPES,
  type ChartType,
  type PanelChart,
  type PanelDescriptor,
  type ResourceKey,
} from './types';
import type { GraphQLFilter } from 'backend.ai-ui';
import type { TFunction } from 'i18next';
import * as _ from 'lodash-es';

/** One count of a chart: a slice, a bar or a line point. */
export interface ChartCount {
  key: string;
  label: (t: TFunction) => string;
  /** Narrows the panel's own condition to this count. */
  filter: GraphQLFilter | string;
  /** The bucket a line point counts. */
  window?: DateTimeWindow;
}

export interface ChartGrouping {
  key: string;
  labelKey: string;
  groups: ReadonlyArray<ChartCount>;
}

const minilangIn = (field: string, values: ReadonlyArray<string>) =>
  values.length === 1
    ? `${field} == ${JSON.stringify(values[0])}`
    : `${field} in [${values.map((value) => JSON.stringify(value)).join(',')}]`;

const labelOf = (key: string) => (t: TFunction) => t(key);
const rawLabel = (value: string) => () => value;

// The legacy session statuses, every one in exactly one group.
const SESSION_STATUS_GROUPS = [
  { key: 'pending', labelKey: 'dashboard.card.Pending', statuses: ['PENDING'] },
  {
    key: 'starting',
    labelKey: 'dashboard.card.Starting',
    statuses: ['SCHEDULED', 'PREPARING', 'PULLING', 'PREPARED', 'CREATING'],
  },
  {
    key: 'running',
    labelKey: 'dashboard.card.Running',
    statuses: ['RUNNING', 'RESTARTING', 'RUNNING_DEGRADED'],
  },
  {
    key: 'terminating',
    labelKey: 'dashboard.card.Terminating',
    statuses: ['TERMINATING'],
  },
  {
    key: 'terminated',
    labelKey: 'dashboard.card.Terminated',
    statuses: ['TERMINATED', 'CANCELLED'],
  },
  { key: 'error', labelKey: 'dashboard.card.Error', statuses: ['ERROR'] },
];

const SESSION_TYPES = ['interactive', 'batch', 'inference', 'system'];

const DEPLOYMENT_STATUSES = [
  ['PENDING', 'deployment.status.Pending'],
  ['SCALING', 'deployment.status.Scaling'],
  ['DEPLOYING', 'deployment.status.Deploying'],
  ['READY', 'deployment.status.Ready'],
  ['STOPPING', 'deployment.status.Stopping'],
  ['STOPPED', 'deployment.status.Stopped'],
] as const;

const VFOLDER_STATUSES = [
  'READY',
  'CLONING',
  'DELETE_PENDING',
  'DELETE_ONGOING',
  'DELETE_COMPLETE',
  'DELETE_ERROR',
];

const VFOLDER_USAGE_MODES = [
  ['GENERAL', 'data.General'],
  ['DATA', 'data.Pipeline'],
  ['MODEL', 'data.Models'],
] as const;

/** What a donut or bar can group each source by; at most `MAX_BUCKETS` groups each. */
export const CHART_GROUPINGS: Record<
  ResourceKey,
  ReadonlyArray<ChartGrouping>
> = {
  session: [
    {
      key: 'status',
      labelKey: 'general.Status',
      groups: SESSION_STATUS_GROUPS.map(({ key, labelKey, statuses }) => ({
        key,
        label: labelOf(labelKey),
        filter: minilangIn('status', statuses),
      })),
    },
    {
      key: 'type',
      labelKey: 'session.SessionType',
      groups: SESSION_TYPES.map((type) => ({
        key: type,
        label: (t: TFunction) => getSessionTypeLabel(t, type),
        filter: minilangIn('type', [type]),
      })),
    },
  ],
  deployment: [
    {
      key: 'status',
      labelKey: 'general.Status',
      groups: DEPLOYMENT_STATUSES.map(([status, labelKey]) => ({
        key: status,
        label: labelOf(labelKey),
        filter: { status: { equals: status } },
      })),
    },
    {
      key: 'openToPublic',
      labelKey: 'deployment.OpenToPublic',
      groups: [
        {
          key: 'public',
          label: labelOf('button.Yes'),
          filter: { openToPublic: true },
        },
        {
          key: 'private',
          label: labelOf('button.No'),
          filter: { openToPublic: false },
        },
      ],
    },
  ],
  vfolder: [
    {
      key: 'status',
      labelKey: 'general.Status',
      groups: VFOLDER_STATUSES.map((status) => ({
        key: status,
        label: rawLabel(status),
        filter: { status: { equals: status } },
      })),
    },
    {
      key: 'usageMode',
      labelKey: 'data.UsageMode',
      groups: VFOLDER_USAGE_MODES.map(([mode, labelKey]) => ({
        key: mode,
        label: labelOf(labelKey),
        filter: { usageMode: { equals: mode } },
      })),
    },
  ],
};

/** `filter` narrowed by `extra`: ANDed minilang for sessions, an `AND` list for V2 sources. */
export const combineFilters = (
  filter: PanelDescriptor['filter'],
  extra: GraphQLFilter | string,
): GraphQLFilter | string => {
  if (typeof extra === 'string') {
    return typeof filter === 'string' && filter
      ? `(${filter}) & (${extra})`
      : extra;
  }
  return filter && typeof filter === 'object' && !_.isEmpty(filter)
    ? { AND: [filter, extra] }
    : extra;
};

/** Rows of `source` created within `window`. */
const createdWithin = (
  source: ResourceKey,
  window: DateTimeWindow,
): GraphQLFilter | string =>
  source === 'session'
    ? `created_at >= ${JSON.stringify(window.after)} & created_at < ${JSON.stringify(window.before)}`
    : withinWindow('createdAt', window);

/** A stored chart made valid for `source`: an unknown type, grouping or range falls back to the first one. */
export const resolveChart = (
  source: ResourceKey,
  chart: Partial<PanelChart> | null | undefined,
): PanelChart => {
  const type: ChartType = _.includes(CHART_TYPES, chart?.type)
    ? (chart!.type as ChartType)
    : 'donut';
  const groupings = CHART_GROUPINGS[source];
  const groupBy = groupings.some((grouping) => grouping.key === chart?.groupBy)
    ? chart!.groupBy!
    : groupings[0].key;
  return {
    type,
    groupBy,
    range: isRangePreset(chart?.range) ? chart!.range : DEFAULT_RANGE,
    showTable: chart?.showTable === true,
  };
};

/** The counts a chart draws: one per group of its grouping, or one per bucket of its range as of `now`. */
export const chartCounts = (
  source: ResourceKey,
  chart: PanelChart,
  now: number,
): Array<ChartCount> => {
  if (chart.type === 'line') {
    return planBuckets(chart.range ?? DEFAULT_RANGE, now)
      .buckets.slice(0, MAX_BUCKETS)
      .map((window, index) => ({
        key: String(index),
        label: () => window.after,
        filter: createdWithin(source, window),
        window,
      }));
  }
  const grouping =
    CHART_GROUPINGS[source].find(({ key }) => key === chart.groupBy) ??
    CHART_GROUPINGS[source][0];
  return grouping.groups.slice(0, MAX_BUCKETS);
};
