/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  SessionNodesFragment$data,
  SessionNodesFragment$key,
} from '../__generated__/SessionNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import { useSuspendedAppTemplateConfig } from '../hooks/useAppTemplate';
import AppLauncherModal from './ComputeSessionNodeItems/AppLauncherModal';
import EditSessionPriorityModal from './ComputeSessionNodeItems/EditSessionPriorityModal';
import SessionAccessKey from './ComputeSessionNodeItems/SessionAccessKey';
import SessionReclamationStatusCell from './ComputeSessionNodeItems/SessionReclamationStatusCell';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionSlotCell from './ComputeSessionNodeItems/SessionSlotCell';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import TerminateSessionModal from './ComputeSessionNodeItems/TerminateSessionModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { Badge } from '@astryxdesign/core/Badge';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIColumnType,
  BAIFlex,
  BAITable,
  BAITableProps,
  BAISessionAgentIds,
  BAIAppIcon,
  BAINameActionCell,
  BAISessionTypeTag,
  BAISessionClusterMode,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PowerOffIcon, SettingsIcon } from 'lucide-react';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type SessionNodeInList = NonNullable<SessionNodesFragment$data[number]>;

const availableSessionSorterKeys = [
  'name',
  'scaling_group',
  'type',
  'cluster_mode',
  'created_at',
  'agent_ids',
] as const;

export const availableSessionSorterValues = [
  ...availableSessionSorterKeys,
  ...availableSessionSorterKeys.map((key) => `-${key}` as const),
] as const;

const isEnableSorter = (key: string) => {
  return _.includes(availableSessionSorterKeys, key);
};

interface SessionNodesProps extends Omit<
  BAITableProps<SessionNodeInList>,
  'dataSource' | 'columns' | 'onChangeOrder'
> {
  sessionsFrgmt: SessionNodesFragment$key;
  onClickSessionName?: (session: SessionNodeInList) => void;
  disableSorter?: boolean;
  enablePriorityColumn?: boolean;
  onChangeOrder?: (
    order: (typeof availableSessionSorterValues)[number] | null,
  ) => void;
}

const SessionNodes: React.FC<SessionNodesProps> = ({
  sessionsFrgmt,
  onClickSessionName,
  disableSorter,
  enablePriorityColumn,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();
  const { hideAppsOnBatchSession } = useSuspendedAppTemplateConfig();
  const [userInfo] = useCurrentUserInfo();
  const [terminateTarget, setTerminateTarget] =
    useState<SessionNodeInList | null>(null);
  const [appLauncherTarget, setAppLauncherTarget] =
    useState<SessionNodeInList | null>(null);
  const [editPriorityTarget, setEditPriorityTarget] =
    useState<SessionNodeInList | null>(null);

  const sessions = useFragment(
    graphql`
      fragment SessionNodesFragment on ComputeSessionNode @relay(plural: true) {
        id @required(action: NONE)
        row_id @required(action: NONE)
        name
        status
        type
        service_ports
        user_id
        agent_ids
        priority @since(version: "24.09.0")
        ...SessionStatusTagFragment
        ...SessionReservationFragment
        ...SessionSlotCellFragment
        ...SessionReclamationStatusCellFragment
        ...SessionUsageMonitorFragment
        ...SessionDetailDrawerFragment
        ...BAISessionAgentIdsFragment
        ...BAISessionTypeTagFragment
        ...BAISessionClusterModeFragment
        ...AppLauncherModalFragment
        ...TerminateSessionModalFragment
        ...EditSessionPriorityModalFragment
        ...SessionAccessKeyFragment
        kernel_nodes {
          edges {
            node {
              image {
                ...ImageNodeSimpleTagFragment
              }
            }
          }
        }
        created_at
        scaling_group
        project_id
        owner @since(version: "25.13.0") {
          email
        }
        dependees {
          edges {
            node {
              row_id
              name
            }
          }
          count
        }
        dependents {
          edges {
            node {
              row_id
              name
            }
          }
          count
        }
      }
    `,
    sessionsFrgmt,
  );

  const filteredSessions = filterOutNullAndUndefined(sessions);

  const columns = _.map(
    filterOutEmpty<BAIColumnType<SessionNodeInList>>([
      {
        key: 'name',
        title: t('session.SessionName'),
        dataIndex: 'name',
        render: (name: string, session) => {
          const isActive =
            session.type === 'system'
              ? session.status === 'RUNNING'
              : !['TERMINATED', 'CANCELLED', 'TERMINATING'].includes(
                  session.status || '',
                );
          const isAppSupported =
            ['batch', 'interactive', 'inference', 'system', 'running'].includes(
              session.type || '',
            ) && !_.isEmpty(JSON.parse(session.service_ports ?? '{}'));
          const isOwner = userInfo?.uuid === session.user_id;
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
                session.type !== 'system' &&
                  !(hideAppsOnBatchSession && session.type === 'batch') && {
                    key: 'appLauncher',
                    title: t('session.SeeAppDialog'),
                    icon: <BAIAppIcon />,
                    disabled: !isAppSupported || !isActive || !isOwner,
                    onClick: () => setAppLauncherTarget(session),
                  },
                enablePriorityColumn && {
                  key: 'editPriority',
                  title: t('button.Settings'),
                  icon: <SettingsIcon />,
                  // Priority only orders the pending queue, so it is only
                  // editable while the session is PENDING.
                  disabled: session.status !== 'PENDING',
                  onClick: () => setEditPriorityTarget(session),
                },
                {
                  key: 'terminate',
                  title: t('session.TerminateSession'),
                  icon: <PowerOffIcon />,
                  type: 'danger' as const,
                  disabled: !isActive,
                  onClick: () => setTerminateTarget(session),
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
        dataIndex: 'status',
        // QA-FINDINGS Q-35 — a column that declares neither `width` nor
        // `minWidth` is handed `proportional(1)`, i.e. a STRICT 1/N equal share
        // of the table, and the cell clips (`overflow: hidden`) rather than
        // pushing back. The worst real cell here is `PENDING` + `#n` + the
        // "Queue Position" tooltip label, which needs 124px of content box;
        // the equal share gives 120px minus 8/8 cell padding = 104px, so the
        // tag was cut mid-glyph on `/admin-session` at every width and on
        // `/session` below 1600. antd's engine measured content and grew the
        // column, so the column definition itself is byte-identical to legacy's
        // — the fallback is what changed. 140 = 124 content + the 16px of cell
        // padding the engine does not add on its own.
        minWidth: 140,
        render: (__, session) => {
          // TODO: Display idle checker if imminentExpirationTime as Icon(clock-alert).
          return <SessionStatusTag sessionFrgmt={session} />;
        },
      },
      enablePriorityColumn && {
        key: 'priority',
        title: t('session.Priority'),
        dataIndex: 'priority',
        // Priority only orders the pending queue, so it is only meaningful
        // while the session is PENDING. Editing goes through the name cell's
        // action (Settings icon), not this column.
        render: (priority: number | null, session) =>
          session.status === 'PENDING' && !_.isNil(priority)
            ? String(priority)
            : '-',
      },
      {
        key: 'reclamationStatus',
        title: t('session.ReclamationStatus'),
        render: (__, session) => (
          <SessionReclamationStatusCell sessionFrgmt={session} />
        ),
      },
      {
        key: 'accelerator',
        title: t('session.launcher.AIAccelerator'),
        exportKey: ['resource_used', 'resource_requested'],
        render: (__, session) => {
          return <SessionSlotCell sessionFrgmt={session} type="accelerator" />;
        },
      },
      {
        key: 'cpu',
        title: t('session.launcher.CPU'),
        exportKey: ['resource_used', 'resource_requested'],
        render: (__, session) => {
          return <SessionSlotCell sessionFrgmt={session} type="cpu" />;
        },
      },
      {
        key: 'mem',
        title: t('session.launcher.Memory'),
        exportKey: ['resource_used', 'resource_requested'],
        render: (__, session) => {
          return <SessionSlotCell sessionFrgmt={session} type="mem" />;
        },
      },
      {
        key: 'elapsedTime',
        title: t('session.ElapsedTime'),
        render: (__, session) => {
          return (
            <SessionReservation mode="simple-elapsed" sessionFrgmt={session} />
          );
        },
      },
      {
        key: 'environment',
        title: t('session.launcher.Environments'),
        defaultHidden: true,
        exportKey: 'main_kernel_image',
        render: (__, session) => {
          return session.kernel_nodes?.edges?.[0]?.node?.image ? (
            <ImageNodeSimpleTag
              imageFrgmt={session.kernel_nodes.edges[0].node.image}
              copyable={false}
              withoutTag
            />
          ) : (
            '-'
          );
        },
      },
      {
        key: 'resourceGroup',
        dataIndex: 'scaling_group',
        title: t('session.ResourceGroup'),
        defaultHidden: true,
        exportKey: 'resource_group_name',
        sorter: isEnableSorter('scaling_group'),
        render: (__, session) =>
          session.scaling_group ? session.scaling_group : '-',
      },
      {
        key: 'type',
        dataIndex: 'type',
        title: t('session.SessionType'),
        defaultHidden: true,
        exportKey: 'session_type',
        sorter: isEnableSorter('type'),
        render: (__, session) => <BAISessionTypeTag sessionFrgmt={session} />,
      },
      {
        key: 'cluster_mode',
        dataIndex: 'cluster_mode',
        title: t('session.ClusterMode'),
        defaultHidden: true,
        sorter: isEnableSorter('cluster_mode'),
        render: (__, session) => (
          <BAISessionClusterMode sessionFrgmt={session} />
        ),
      },
      {
        key: 'dependencies',
        title: t('session.launcher.Dependencies'),
        defaultHidden: true,
        render: (__, session) => {
          const dependeeNodes = session.dependees?.edges
            ?.map((edge) => edge?.node)
            .filter(Boolean);
          const dependentNodes = session.dependents?.edges
            ?.map((edge) => edge?.node)
            .filter(Boolean);
          if (
            (!dependeeNodes || dependeeNodes.length === 0) &&
            (!dependentNodes || dependentNodes.length === 0)
          ) {
            return '-';
          }
          return (
            <BAIFlex gap="xs" wrap="wrap">
              {dependeeNodes?.map((node) => (
                <Tooltip key={node?.row_id} content={t('session.DependsOn')}>
                  <Badge label={`→ ${node?.name}`} />
                </Tooltip>
              ))}
              {dependentNodes?.map((node) => (
                <Tooltip
                  key={node?.row_id}
                  content={t('session.DependedByOthers')}
                >
                  <Badge label={`← ${node?.name}`} />
                </Tooltip>
              ))}
            </BAIFlex>
          );
        },
      },
      {
        key: 'created_at',
        dataIndex: 'created_at',
        title: t('session.CreatedAt'),
        defaultHidden: true,
        sorter: isEnableSorter('created_at'),
        render: (created_at: string) => dayjs(created_at).format('LLL') || '-',
      },
      {
        key: 'access_key',
        title: t('general.AccessKey'),
        defaultHidden: true,
        exportKey: 'access_key',
        render: (__, session) => <SessionAccessKey sessionFrgmt={session} />,
      },
      // The method of directly fetching project name is currently not possible through GraphQL's query. Until backend work is completed, id will be displayed.
      {
        key: 'project_id',
        dataIndex: 'project_id',
        title: t('data.Project'),
        defaultHidden: true,
        render: (project_id: string) => project_id || '-',
      },
      (userRole === 'superadmin' || !baiClient._config.hideAgents) && {
        key: 'agent',
        dataIndex: 'agent_ids',
        title: t('session.Agent'),
        defaultHidden: false,
        exportKey: 'kernel_agent',
        sorter: isEnableSorter('agent_ids'),
        render: (__, session) => <BAISessionAgentIds sessionFrgmt={session} />,
      },
      userRole === 'superadmin' &&
        baiClient.isManagerVersionCompatibleWith('25.13.0') && {
          key: 'owner',
          title: t('session.launcher.OwnerEmail'),
          defaultHidden: false,
          exportKey: 'user_email',
          render: (__, session) => session.owner?.email || '-',
        },
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  return (
    <>
      <BAITable
        resizable
        rowKey={'id'}
        size="small"
        dataSource={filteredSessions}
        columns={columns}
        onChangeOrder={(order) => {
          onChangeOrder?.(
            (order as (typeof availableSessionSorterValues)[number]) || null,
          );
        }}
        {...tableProps}
      />
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <AppLauncherModal
            sessionFrgmt={appLauncherTarget}
            open={!!appLauncherTarget}
            onRequestClose={() => setAppLauncherTarget(null)}
          />
        </BAIUnmountAfterClose>
      </Suspense>
      <TerminateSessionModal
        sessionFrgmts={terminateTarget ? [terminateTarget] : []}
        open={!!terminateTarget}
        onRequestClose={() => setTerminateTarget(null)}
      />
      <BAIUnmountAfterClose>
        <EditSessionPriorityModal
          sessionFrgmts={editPriorityTarget ? [editPriorityTarget] : null}
          open={!!editPriorityTarget}
          onRequestClose={() => setEditPriorityTarget(null)}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export default SessionNodes;
