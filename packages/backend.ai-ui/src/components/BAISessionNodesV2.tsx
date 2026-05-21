/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  BAIColumnType,
  BAIFlex,
  BAIId,
  BAIImageNodeSimpleTagV2,
  BAIIntervalView,
  BAISessionClusterModeV2,
  BAISessionTypeTagV2,
  BAITable,
  BAITableProps,
  BAITag,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from '..';
import type {
  BAISessionNodesV2Fragment$data,
  BAISessionNodesV2Fragment$key,
  SessionV2Status,
} from '../__generated__/BAISessionNodesV2Fragment.graphql';
import { convertToBinaryUnit } from '../helper';
import { useBAIi18n } from '../hooks/useBAIi18n';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as _ from 'lodash-es';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(duration);

export type SessionV2InList = NonNullable<
  BAISessionNodesV2Fragment$data[number]
>;

const availableSessionV2SorterKeys = [
  'name',
  'status',
  'createdAt',
  'terminatedAt',
  'id',
] as const;

export const availableSessionV2SorterValues = [
  ...availableSessionV2SorterKeys,
  ...availableSessionV2SorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableSessionV2SorterKeys, key);
};

const STATUS_COLOR_MAP: Partial<Record<SessionV2Status, string>> = {
  PENDING: 'default',
  SCHEDULED: 'blue',
  PREPARING: 'blue',
  PREPARED: 'blue',
  CREATING: 'blue',
  RUNNING: 'green',
  DEPRIORITIZING: 'orange',
  TERMINATING: 'orange',
  TERMINATED: 'default',
  CANCELLED: 'red',
};

type ResourceEntry = { resourceType: string; quantity: string };

const findEntry = (entries: ReadonlyArray<ResourceEntry>, type: string) =>
  entries.find((entry) => entry.resourceType === type);

// Occupied slots: the actually-allocated (`used`) entries when present,
// otherwise fall back to the `requested` entries. Mirrors the v1
// `SessionSlotCell`, which falls back from `occupied_slots` to
// `requested_slots`, so the displayed value matches the admin session list.
const getOccupiedEntries = (
  allocation:
    | {
        readonly requested?: { readonly entries: ReadonlyArray<ResourceEntry> };
        readonly used?: {
          readonly entries: ReadonlyArray<ResourceEntry>;
        } | null;
      }
    | null
    | undefined,
): ReadonlyArray<ResourceEntry> => {
  const used = allocation?.used?.entries;
  if (used && used.length > 0) return used;
  return allocation?.requested?.entries ?? [];
};

const formatCpu = (entry?: ResourceEntry) =>
  entry ? `${Number(entry.quantity)}` : '-';

const formatMem = (entry?: ResourceEntry) =>
  entry
    ? (convertToBinaryUnit(entry.quantity, 'g', 3)?.displayValue ??
      entry.quantity)
    : '-';

const acceleratorEntries = (entries: ReadonlyArray<ResourceEntry>) =>
  entries.filter(
    (entry) =>
      entry.resourceType !== 'cpu' &&
      entry.resourceType !== 'mem' &&
      Number(entry.quantity) > 0,
  );

const formatElapsedTime = (
  createdAt?: string | null,
  endedAt?: string | null,
) => {
  if (!createdAt) return '-';
  const start = dayjs(createdAt);
  const end = endedAt ? dayjs(endedAt) : dayjs();
  const diffSeconds = Math.max(0, end.diff(start, 'second'));
  return dayjs.duration(diffSeconds, 'seconds').format('HH:mm:ss');
};

interface BAISessionNodesV2Props extends Omit<
  BAITableProps<SessionV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  sessionsFrgmt: BAISessionNodesV2Fragment$key;
  /**
   * Hook to customize/override the generated columns. The `name` column is
   * rendered as a plain string by default; consumers use this to add a name
   * link / `BAINameActionCell` with row actions (e.g. terminate), or to swap
   * in app-only renderers.
   */
  customizeColumns?: (
    baseColumns: BAIColumnType<SessionV2InList>[],
  ) => BAIColumnType<SessionV2InList>[];
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableSessionV2SorterValues)[number] | null,
  ) => void;
}

const BAISessionNodesV2: React.FC<BAISessionNodesV2Props> = ({
  sessionsFrgmt,
  customizeColumns,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useBAIi18n();

  const sessions = useFragment(
    graphql`
      fragment BAISessionNodesV2Fragment on SessionV2 @relay(plural: true) {
        id @required(action: NONE)
        project {
          id
          basicInfo {
            name
          }
        }
        metadata {
          name
          ...BAISessionTypeTagV2Fragment
          ...BAISessionClusterModeV2Fragment
        }
        lifecycle {
          status
          createdAt
          terminatedAt
        }
        resource {
          resourceGroupName
          allocation {
            requested {
              entries {
                resourceType
                quantity
              }
            }
            used {
              entries {
                resourceType
                quantity
              }
            }
          }
        }
        images {
          edges {
            node {
              id
              ...BAIImageNodeSimpleTagV2Fragment
            }
          }
        }
        user {
          id
          basicInfo {
            email
          }
        }
      }
    `,
    sessionsFrgmt,
  );

  const filteredSessions = filterOutNullAndUndefined(sessions);

  const columns = _.map(
    filterOutEmpty<BAIColumnType<SessionV2InList>>([
      {
        key: 'name',
        title: t('comp:SessionV2Nodes.SessionName'),
        // `dataIndex` doubles as the antd sorter `field`, which the table maps
        // to the server order string (`name` → `NAME`). Display uses the
        // custom `render` below, so the flat key is fine even though the value
        // lives at `metadata.name`.
        dataIndex: 'name',
        // Plain string by default. Consumers add a name link / row actions
        // (e.g. terminate) via `customizeColumns`.
        render: (__, session) => session.metadata?.name ?? '-',
        sorter: isEnableSorter('name'),
        required: true,
        fixed: 'left',
      },
      {
        // The filter supports searching by session `id`, so the ID is
        // available as a column too. Hidden by default; surfaced via column
        // settings / `defaultColumnOverrides`.
        key: 'sessionId',
        title: t('comp:SessionV2Nodes.SessionId'),
        defaultHidden: true,
        render: (__, session) => <BAIId globalId={session.id} />,
      },
      {
        key: 'status',
        title: t('comp:SessionV2Nodes.Status'),
        dataIndex: 'status',
        sorter: isEnableSorter('status'),
        render: (__, session) => {
          const status = session.lifecycle?.status;
          if (!status) return '-';
          return (
            <BAITag
              color={STATUS_COLOR_MAP[status as SessionV2Status] ?? 'default'}
            >
              {status}
            </BAITag>
          );
        },
      },
      // TODO: SessionV2 does not yet expose live utilization (no `live_stat`),
      // so the AI accelerator / CPU / memory columns show only the occupied
      // value as plain text. Once SessionV2 exposes live utilization, restore
      // the usage indicator (dot) + utilization tooltip — as in the v1
      // `SessionSlotCell` (occupied value with a colored usage badge and a
      // `used % / total %` tooltip).
      {
        key: 'accelerator',
        title: t('comp:SessionV2Nodes.AIAccelerator'),
        render: (__, session) => {
          const occupied = acceleratorEntries(
            getOccupiedEntries(session.resource?.allocation),
          );
          if (occupied.length === 0) return '-';
          return occupied
            .map((entry) => `${Number(entry.quantity)} ${entry.resourceType}`)
            .join(', ');
        },
      },
      {
        key: 'cpu',
        title: t('comp:SessionV2Nodes.CPU'),
        render: (__, session) =>
          formatCpu(
            findEntry(getOccupiedEntries(session.resource?.allocation), 'cpu'),
          ),
      },
      {
        key: 'mem',
        title: t('comp:SessionV2Nodes.Memory'),
        render: (__, session) =>
          formatMem(
            findEntry(getOccupiedEntries(session.resource?.allocation), 'mem'),
          ),
      },
      {
        key: 'elapsedTime',
        title: t('comp:SessionV2Nodes.ElapsedTime'),
        render: (__, session) => {
          const createdAt = session.lifecycle?.createdAt;
          const terminatedAt = session.lifecycle?.terminatedAt;
          // If the session has already terminated, the elapsed time is fixed
          // and there is no point in re-running the timer every second.
          if (terminatedAt) {
            return formatElapsedTime(createdAt, terminatedAt);
          }
          return (
            <BAIIntervalView
              key={session.id}
              callback={() => formatElapsedTime(createdAt, terminatedAt)}
              delay={1000}
            />
          );
        },
      },
      {
        key: 'environment',
        title: t('comp:SessionV2Nodes.Environments'),
        defaultHidden: true,
        render: (__, session) => {
          const firstImage = session.images?.edges?.[0]?.node;
          if (!firstImage) return '-';
          return (
            <BAIImageNodeSimpleTagV2
              imageFrgmt={firstImage}
              copyable={false}
              withoutTag
            />
          );
        },
      },
      {
        key: 'resourceGroup',
        title: t('comp:SessionV2Nodes.ResourceGroup'),
        defaultHidden: true,
        render: (__, session) => session.resource?.resourceGroupName || '-',
      },
      {
        key: 'sessionType',
        title: t('comp:SessionV2Nodes.SessionType'),
        defaultHidden: true,
        render: (__, session) =>
          session.metadata ? (
            <BAISessionTypeTagV2 metadataFrgmt={session.metadata} />
          ) : (
            '-'
          ),
      },
      {
        key: 'clusterMode',
        title: t('comp:SessionV2Nodes.ClusterMode'),
        defaultHidden: true,
        render: (__, session) =>
          session.metadata ? (
            <BAISessionClusterModeV2 metadataFrgmt={session.metadata} />
          ) : (
            '-'
          ),
      },
      {
        key: 'createdAt',
        title: t('comp:SessionV2Nodes.CreatedAt'),
        dataIndex: 'createdAt',
        defaultHidden: true,
        sorter: isEnableSorter('createdAt'),
        render: (__, session) =>
          session.lifecycle?.createdAt
            ? dayjs(session.lifecycle.createdAt).format('LLL')
            : '-',
      },
      {
        key: 'project',
        title: t('comp:SessionV2Nodes.Project'),
        // Hidden by default — on a project-scoped list every row is the same
        // project, but the column is still available via column settings.
        defaultHidden: true,
        render: (__, session) => session.project?.basicInfo?.name || '-',
      },
      {
        key: 'owner',
        title: t('comp:SessionV2Nodes.OwnerEmail'),
        render: (__, session) => session.user?.basicInfo?.email || '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  const allColumns = customizeColumns ? customizeColumns(columns) : columns;

  return (
    <BAIFlex direction="column" align="stretch">
      <BAITable
        resizable
        rowKey="id"
        size="small"
        dataSource={filteredSessions}
        columns={allColumns}
        scroll={{ x: 'max-content' }}
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableSessionV2SorterValues)[number]) || null,
          );
        }}
        {...tableProps}
      />
    </BAIFlex>
  );
};

export default BAISessionNodesV2;
