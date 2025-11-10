import {
  SessionNodesFragment$data,
  SessionNodesFragment$key,
} from '../__generated__/SessionNodesFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserRole } from '../hooks/backendai';
import SessionActionButtons from './ComputeSessionNodeItems/SessionActionButtons';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionSlotCell from './ComputeSessionNodeItems/SessionSlotCell';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import {
  filterOutEmpty,
  filterOutNullAndUndefined,
  BAIColumnType,
  BAITable,
  BAITableProps,
  BAISessionAgentIds,
  BAILink,
  BAISessionTypeTag,
  BAISessionClusterMode,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type SessionNodeInList = NonNullable<SessionNodesFragment$data[number]>;
interface SessionNodesProps
  extends Omit<BAITableProps<SessionNodeInList>, 'dataSource' | 'columns'> {
  sessionsFrgmt: SessionNodesFragment$key;
  onClickSessionName?: (session: SessionNodeInList) => void;
  disableSorter?: boolean;
}

const SessionNodes: React.FC<SessionNodesProps> = ({
  sessionsFrgmt,
  onClickSessionName,
  disableSorter,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const userRole = useCurrentUserRole();
  const baiClient = useSuspendedBackendaiClient();

  const sessions = useFragment(
    graphql`
      fragment SessionNodesFragment on ComputeSessionNode @relay(plural: true) {
        id @required(action: NONE)
        row_id @required(action: NONE)
        name
        status
        type
        agent_ids
        ...SessionStatusTagFragment
        ...SessionReservationFragment
        ...SessionSlotCellFragment
        ...SessionUsageMonitorFragment
        ...SessionDetailDrawerFragment
        ...BAISessionAgentIdsFragment
        ...BAISessionTypeTagFragment
        ...BAISessionClusterModeFragment
        ...SessionActionButtonsFragment
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
        owner @since(version: "25.13.0") {
          email
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
          return onClickSessionName ? (
            <BAILink
              type="hover"
              onClick={() => {
                onClickSessionName(session);
              }}
            >
              {name}
            </BAILink>
          ) : (
            name
          );
        },
        sorter: true,
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
      {
        key: 'actionButtons',
        title: t('general.Control'),
        defaultHidden: true,
        sorter: false,
        render: (__, session) => (
          <SessionActionButtons
            size="small"
            sessionFrgmt={session}
            compact
            noPrimaryButton
          />
        ),
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
        render: (__, session) => {
          return <SessionSlotCell sessionFrgmt={session} type="accelerator" />;
        },
      },
      {
        key: 'cpu',
        title: t('session.launcher.CPU'),
        render: (__, session) => {
          return <SessionSlotCell sessionFrgmt={session} type="cpu" />;
        },
      },
      {
        key: 'mem',
        title: t('session.launcher.Memory'),
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
        sorter: true,
        render: (__, session) =>
          session.scaling_group ? session.scaling_group : '-',
      },
      {
        key: 'type',
        dataIndex: 'type',
        title: t('session.SessionType'),
        defaultHidden: true,
        sorter: true,
        render: (__, session) => <BAISessionTypeTag sessionFrgmt={session} />,
      },
      {
        key: 'cluster_mode',
        dataIndex: 'cluster_mode',
        title: t('session.ClusterMode'),
        defaultHidden: true,
        sorter: true,
        render: (__, session) => (
          <BAISessionClusterMode sessionFrgmt={session} />
        ),
      },
      {
        key: 'created_at',
        dataIndex: 'created_at',
        title: t('session.CreatedAt'),
        defaultHidden: true,
        sorter: true,
        render: (created_at: string) => dayjs(created_at).format('LLL') || '-',
      },
      (userRole === 'superadmin' || !baiClient._config.hideAgents) && {
        key: 'agent',
        dataIndex: 'agent_ids',
        title: t('session.Agent'),
        defaultHidden: false,
        sorter: true,
        render: (__, session) => <BAISessionAgentIds sessionFrgmt={session} />,
      },
      userRole === 'superadmin' &&
        baiClient.isManagerVersionCompatibleWith('25.13.0') && {
          key: 'owner',
          title: t('session.launcher.OwnerEmail'),
          defaultHidden: false,
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
        {...tableProps}
      />
    </>
  );
};

export default SessionNodes;
