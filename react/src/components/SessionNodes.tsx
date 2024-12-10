import BAILink from './BAILink';
import BAITable from './BAITable';
import SessionOccupiedSlot from './ComputeSessionNodeItems/SessionOccupiedSlot';
import SessionReservation from './ComputeSessionNodeItems/SessionReservation';
import SessionStatusTag from './ComputeSessionNodeItems/SessionStatusTag';
import SessionDetailDrawer from './SessionDetailDrawer';
import { SessionNodesFragment$key } from './__generated__/SessionNodesFragment.graphql';
import { TableProps } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

interface SessionNodesProps extends Omit<TableProps, 'dataSource' | 'columns'> {
  sessionsFrgmt: SessionNodesFragment$key;
}
const SessionNodes: React.FC<SessionNodesProps> = ({
  sessionsFrgmt,
  ...tableProps
}) => {
  const { t } = useTranslation();
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const sessions = useFragment(
    graphql`
      fragment SessionNodesFragment on ComputeSessionNode @relay(plural: true) {
        id
        row_id
        name
        ...SessionStatusTagFragment
        ...SessionReservationFragment
        ...SessionOccupiedSlotFragment
      }
    `,
    sessionsFrgmt,
  );

  return (
    <>
      <BAITable
        rowKey={(record) => record.rowId}
        dataSource={sessions}
        columns={[
          {
            key: 'name',
            title: t('session.SessionName'),
            dataIndex: 'name',
            render: (name: string, session) => {
              return (
                <BAILink
                  to={'#'}
                  type="hover"
                  onClick={(e) => {
                    session.row_id && setSelectedSessionId(session.row_id);
                  }}
                >
                  {name}
                </BAILink>
              );
            },
            sorter: true,
          },
          {
            key: 'status',
            title: t('session.Status'),
            dataIndex: 'status',
            render: (status: string, session) => {
              // @ts-expect-error
              return <SessionStatusTag sessionFrgmt={session} />;
            },
          },
          {
            key: 'utils',
            title: t('session.Utilization'),
          },
          {
            key: 'accelerator',
            title: t('session.launcher.AIAccelerator'),
            render: (__, session) => {
              return (
                <SessionOccupiedSlot
                  // @ts-expect-error
                  sessionFrgmt={session}
                  type="accelerator"
                />
              );
            },
          },
          {
            key: 'cpu',
            title: t('session.launcher.CPU'),
            render: (__, session) => {
              // @ts-expect-error
              return <SessionOccupiedSlot sessionFrgmt={session} type="cpu" />;
            },
          },
          {
            key: 'mem',
            title: t('session.launcher.Memory'),
            render: (__, session) => {
              // @ts-expect-error
              return <SessionOccupiedSlot sessionFrgmt={session} type="mem" />;
            },
          },
          {
            key: 'elapsedTime',
            title: t('session.ElapsedTime'),
            render: (__, session) => {
              return (
                <SessionReservation
                  mode="simple-elapsed"
                  // @ts-expect-error
                  sessionFrgmt={session}
                />
              );
            },
          },
        ]}
        {...tableProps}
      />
      <SessionDetailDrawer
        open={!selectedSessionId}
        sessionId={selectedSessionId}
        onClose={() => {
          setSelectedSessionId(undefined);
        }}
      />
    </>
  );
};

export default SessionNodes;
