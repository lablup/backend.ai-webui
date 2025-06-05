import { SessionReservationFragment$key } from '../../__generated__/SessionReservationFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import BAIIntervalView from '../BAIIntervalView';
import DoubleTag from '../DoubleTag';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment } from 'react-relay';

const SessionReservation: React.FC<{
  sessionFrgmt: SessionReservationFragment$key;
  mode?: 'simple-elapsed' | 'detail';
}> = ({ sessionFrgmt, mode = 'detail' }) => {
  const { t } = useTranslation();
  const session = useFragment(
    graphql`
      fragment SessionReservationFragment on ComputeSessionNode {
        id
        created_at
        starts_at
        terminated_at
      }
    `,
    sessionFrgmt,
  );

  return (
    <>
      {mode !== 'simple-elapsed' && dayjs(session.created_at).format('lll')}
      <BAIIntervalView
        key={session.id}
        callback={() => {
          const begin = session?.starts_at || session?.created_at;
          return begin && dayjs(begin).isBefore()
            ? formatDurationAsDays(begin, session?.terminated_at)
            : '-';
        }}
        delay={1000}
        render={(intervalValue) =>
          mode === 'simple-elapsed' ? (
            intervalValue
          ) : (
            <DoubleTag
              values={[
                { label: t('session.ElapsedTime') },
                { label: intervalValue },
              ]}
            />
          )
        }
      />
    </>
  );
};

export default SessionReservation;
