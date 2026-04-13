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
import { useEffectiveAdminRole } from '../hooks/useCurrentUserProjectRoles';
import AppLauncherModal from './ComputeSessionNodeItems/AppLauncherModal';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionSlotCell from './ComputeSessionNodeItems/SessionSlotCell';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import TerminateSessionModal from './ComputeSessionNodeItems/TerminateSessionModal';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import { Tooltip } from 'antd';
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
  BAITag,
  BAIUnmountAfterClose,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { PowerOffIcon } from 'lucide-react';
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
  onChangeOrder?: (
    order: (typeof availableSessionSorterValues)[number] | null,
  ) => void;
}

const SessionNodes: React.FC<SessionNodesProps> = ({
  sessionsFrgmt,
  onClickSessionName,
  disableSorter,
  onChangeOrder,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const effectiveAdminRole = useEffectiveAdminRole();
  const baiClient = useSuspendedBackendaiClient();
  const [userInfo] = useCurrentUserInfo();
  const [terminateTarget, setTerminateTarget] =
    useState<SessionNodeInList | null>(null);
  const [appLauncherTarget, setAppLauncherTarget] =
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
        ...SessionStatusTagFragment
        ...SessionReservationFragment
        ...SessionSlotCellFragment
        ...SessionUsageMonitorFragment
        ...SessionDetailDrawerFragment
        ...BAISessionAgentIdsFragment
        ...BAISessionTypeTagFragment
        ...BAISessionClusterModeFragment
        ...AppLauncherModalFragment
        ...TerminateSessionModalFragment
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
                session.type !== 'system' && {
                  key: 'appLauncher',
                  title: t('session.SeeAppDialog'),
                  icon: <BAIAppIcon />,
                  disabled: !isAppSupported || !isActive || !isOwner,
                  onClick: () => setAppLauncherTarget(session),
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
        render: (__, session) => {
          // TODO: Display idle checker if imminentExpirationTime as Icon(clock-alert).
          return <SessionStatusTag sessionFrgmt={session} />;
        },
      },
      // This column will be added back when the session list column setting ui is ready
      // {
      //   key: 'utils',
      //   title: t('session.Utilization'),
      //   render: (__, session) => {
      //     return (
      //       <BAIFlex
      //         style={{
      //           paddingLeft: token.paddingXS,
      //         }}
      //       >
      //         <SessionUsageMonitor size="small" sessionFrgmt={session} />
      //       </BAIFlex>
      //     );
      //   },
      //   defaultHidden: true,
      // },
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
                <Tooltip key={node?.row_id} title={t('session.DependsOn')}>
                  <BAITag>→ {node?.name}</BAITag>
                </Tooltip>
              ))}
              {dependentNodes?.map((node) => (
                <Tooltip
                  key={node?.row_id}
                  title={t('session.DependedByOthers')}
                >
                  <BAITag>← {node?.name}</BAITag>
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
      effectiveAdminRole !== 'none' &&
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
        scroll={{ x: 'max-content' }}
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
    </>
  );
};

export default SessionNodes;
