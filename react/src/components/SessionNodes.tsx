import {
  SessionNodesFragment$data,
  SessionNodesFragment$key,
} from '../__generated__/SessionNodesFragment.graphql';
import { filterEmptyItem, filterNonNullItems } from '../helper';
import BAILink from './BAILink';
import BAITable, { BAITableProps } from './BAITable';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionSlotCell from './ComputeSessionNodeItems/SessionSlotCell';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import { ColumnType } from 'antd/es/table';
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

  const sessions = useFragment(
    graphql`
      fragment SessionNodesFragment on ComputeSessionNode @relay(plural: true) {
        id @required(action: NONE)
        row_id @required(action: NONE)
        name
        status
        ...SessionStatusTagFragment
        ...SessionReservationFragment
        ...SessionSlotCellFragment
        ...SessionUsageMonitorFragment
      }
    `,
    sessionsFrgmt,
  );

  const filteredSessions = filterNonNullItems(sessions);

  const columns = _.map(
    filterEmptyItem<ColumnType<SessionNodeInList>>([
      {
        key: 'name',
        title: t('session.SessionName'),
        dataIndex: 'name',
        render: (name: string, session) => {
          return onClickSessionName ? (
            <BAILink
              type="hover"
              onClick={(e) => {
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
      },
      {
        key: 'status',
        title: t('session.Status'),
        dataIndex: 'status',
        render: (status: string, session) => {
          return <SessionStatusTag sessionFrgmt={session} />;
        },
      },
      // This column will be added back when the session list column setting ui is ready
      // {
      //   key: 'utils',
      //   title: t('session.Utilization'),
      //   render: (__, session) => {
      //     return (
      //       <Flex
      //         style={{
      //           paddingLeft: token.paddingXS,
      //         }}
      //       >
      //         <SessionUsageMonitor size="small" sessionFrgmt={session} />
      //       </Flex>
      //     );
      //   },
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
    ]),
    (column) => {
      return disableSorter ? _.omit(column, 'sorter') : column;
    },
  );

  return (
    <>
      <BAITable
        resizable
        neoStyle
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
