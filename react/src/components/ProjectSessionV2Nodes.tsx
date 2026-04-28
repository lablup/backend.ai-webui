/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  ProjectSessionV2NodesFragment$data,
  ProjectSessionV2NodesFragment$key,
  SessionV2Status,
} from '../__generated__/ProjectSessionV2NodesFragment.graphql';
import { convertToBinaryUnit } from '../helper';
import { useCurrentUserRole } from '../hooks/backendai';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIColumnType,
  BAIFlex,
  BAIIntervalView,
  BAINameActionCell,
  BAITable,
  BAITableProps,
  BAITag,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import * as _ from 'lodash-es';
import { PowerOffIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

dayjs.extend(duration);

export type ProjectSessionV2InList = NonNullable<
  ProjectSessionV2NodesFragment$data[number]
>;

const availableProjectSessionV2SorterKeys = [
  'name',
  'status',
  'createdAt',
  'terminatedAt',
  'id',
] as const;

export const availableProjectSessionV2SorterValues = [
  ...availableProjectSessionV2SorterKeys,
  ...availableProjectSessionV2SorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableProjectSessionV2SorterKeys, key);
};

const TERMINATED_STATUSES: ReadonlyArray<SessionV2Status> = [
  'TERMINATED',
  'CANCELLED',
  'TERMINATING',
];

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

const formatCpu = (entry?: ResourceEntry) => {
  if (!entry) return '-';
  return entry.quantity;
};

const formatMemory = (entry?: ResourceEntry) => {
  if (!entry) return '-';
  return (
    convertToBinaryUnit(entry.quantity, 'auto')?.displayValue ?? entry.quantity
  );
};

const formatAccelerator = (entries: ReadonlyArray<ResourceEntry>) => {
  const acceleratorEntries = entries.filter(
    (entry) => entry.resourceType !== 'cpu' && entry.resourceType !== 'mem',
  );
  if (acceleratorEntries.length === 0) return '-';
  return acceleratorEntries
    .map((entry) => `${entry.quantity} ${entry.resourceType}`)
    .join(', ');
};

interface ProjectSessionV2NodesProps extends Omit<
  BAITableProps<ProjectSessionV2InList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  sessionsFrgmt: ProjectSessionV2NodesFragment$key;
  onClickSessionName?: (session: ProjectSessionV2InList) => void;
  onClickTerminate?: (session: ProjectSessionV2InList) => void;
  disableSorter?: boolean;
  onChangeOrder?: (
    order: (typeof availableProjectSessionV2SorterValues)[number] | null,
  ) => void;
}

const ProjectSessionV2Nodes: React.FC<ProjectSessionV2NodesProps> = ({
  sessionsFrgmt,
  onClickSessionName,
  onClickTerminate,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();

  const sessions = useFragment(
    graphql`
      fragment ProjectSessionV2NodesFragment on SessionV2 @relay(plural: true) {
        id @required(action: NONE)
        metadata {
          name
          sessionType
          clusterMode
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
              identity {
                canonicalName
                namespace
              }
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
    filterOutEmpty<BAIColumnType<ProjectSessionV2InList>>([
      {
        key: 'name',
        title: t('session.SessionName'),
        dataIndex: ['metadata', 'name'],
        render: (__, session) => {
          const name = session.metadata?.name ?? '-';
          const status = session.lifecycle?.status;
          const isTerminated =
            !!status && _.includes(TERMINATED_STATUSES, status);
          return (
            <BAINameActionCell
              title={name}
              showActions="always"
              onTitleClick={
                onClickSessionName
                  ? () => onClickSessionName(session)
                  : undefined
              }
              actions={filterOutEmpty([
                {
                  key: 'terminate',
                  title: t('session.TerminateSession'),
                  icon: <PowerOffIcon />,
                  type: 'danger' as const,
                  disabled: isTerminated,
                  onClick: () => onClickTerminate?.(session),
                },
              ])}
            />
          );
        },
        sorter: isEnableSorter('name'),
        required: true,
        fixed: 'left',
      },
      {
        key: 'status',
        title: t('session.Status'),
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
      {
        key: 'accelerator',
        title: t('session.launcher.AIAccelerator'),
        render: (__, session) => {
          const requested =
            session.resource?.allocation?.requested?.entries ?? [];
          const used = session.resource?.allocation?.used?.entries;
          const requestedStr = formatAccelerator(requested);
          if (!used) return requestedStr;
          const usedStr = formatAccelerator(used);
          return `${usedStr} / ${requestedStr}`;
        },
      },
      {
        key: 'cpu',
        title: t('session.launcher.CPU'),
        render: (__, session) => {
          const requested =
            session.resource?.allocation?.requested?.entries ?? [];
          const used = session.resource?.allocation?.used?.entries;
          const requestedCpu = formatCpu(findEntry(requested, 'cpu'));
          if (!used) return requestedCpu;
          const usedCpu = formatCpu(findEntry(used, 'cpu'));
          return `${usedCpu} / ${requestedCpu}`;
        },
      },
      {
        key: 'mem',
        title: t('session.launcher.Memory'),
        render: (__, session) => {
          const requested =
            session.resource?.allocation?.requested?.entries ?? [];
          const used = session.resource?.allocation?.used?.entries;
          const requestedMem = formatMemory(findEntry(requested, 'mem'));
          if (!used) return requestedMem;
          const usedMem = formatMemory(findEntry(used, 'mem'));
          return `${usedMem} / ${requestedMem}`;
        },
      },
      {
        key: 'elapsedTime',
        title: t('session.ElapsedTime'),
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
        title: t('session.launcher.Environments'),
        defaultHidden: true,
        render: (__, session) => {
          const firstImage = session.images?.edges?.[0]?.node;
          if (!firstImage) return '-';
          const displayName =
            firstImage.identity?.canonicalName ||
            firstImage.identity?.namespace ||
            '-';
          return <BAITag>{displayName}</BAITag>;
        },
      },
      {
        key: 'resourceGroup',
        title: t('session.ResourceGroup'),
        defaultHidden: true,
        render: (__, session) => session.resource?.resourceGroupName || '-',
      },
      {
        key: 'sessionType',
        title: t('session.SessionType'),
        defaultHidden: true,
        render: (__, session) => session.metadata?.sessionType || '-',
      },
      {
        key: 'clusterMode',
        title: t('session.ClusterMode'),
        defaultHidden: true,
        render: (__, session) => session.metadata?.clusterMode || '-',
      },
      {
        key: 'createdAt',
        title: t('session.CreatedAt'),
        defaultHidden: true,
        sorter: isEnableSorter('createdAt'),
        render: (__, session) =>
          session.lifecycle?.createdAt
            ? dayjs(session.lifecycle.createdAt).format('LLL')
            : '-',
      },
      userRole === 'superadmin' && {
        key: 'owner',
        title: t('session.launcher.OwnerEmail'),
        render: (__, session) => session.user?.basicInfo?.email || '-',
      },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  return (
    <BAIFlex direction="column" align="stretch">
      <BAITable
        resizable
        rowKey="id"
        size="small"
        dataSource={filteredSessions}
        columns={columns}
        scroll={{ x: 'max-content' }}
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableProjectSessionV2SorterValues)[number]) ||
              null,
          );
        }}
        {...tableProps}
      />
    </BAIFlex>
  );
};

export default ProjectSessionV2Nodes;
