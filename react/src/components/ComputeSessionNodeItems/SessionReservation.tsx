import { useSuspendedBackendaiClient } from '../../hooks';
import BAIIntervalView from '../BAIIntervalView';
import DoubleTag from '../DoubleTag';
import { SessionReservationFragment$key } from './__generated__/SessionReservationFragment.graphql';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const SessionReservation: React.FC<{
  sessionFrgmt: SessionReservationFragment$key;
}> = ({ sessionFrgmt }) => {
  const baiClient = useSuspendedBackendaiClient();
  const { t } = useTranslation();
  const session = useFragment(
    graphql`
      fragment SessionReservationFragment on ComputeSessionNode {
        id
        created_at
        terminated_at
      }
    `,
    sessionFrgmt,
  );
  return (
    <>
      {dayjs(session.created_at).format('lll')}
      <BAIIntervalView
        callback={() => {
          return session?.created_at
            ? baiClient.utils.elapsedTime(
                session.created_at,
                session?.terminated_at,
              )
            : '-';
        }}
        delay={1000}
        render={(intervalValue) => (
          <DoubleTag
            values={[
              { label: t('session.ElapsedTime') },
              { label: intervalValue },
            ]}
          />
        )}
      />
    </>
  );
};

export default SessionReservation;
