/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReservationFragment$key } from '../../__generated__/SessionReservationFragment.graphql';
import { formatDurationAsDays } from '../../helper';
import { Typography } from 'antd';
import { BAIDoubleTag, BAIIntervalView } from 'backend.ai-ui';
import dayjs from 'dayjs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

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

  const formattedCreatedAt = dayjs(session.created_at).format('lll');
  return (
    <>
      {mode !== 'simple-elapsed' && (
        <Typography.Text>{formattedCreatedAt}</Typography.Text>
      )}
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
            <Typography.Text title={formattedCreatedAt || ''}>
              {intervalValue}
            </Typography.Text>
          ) : (
            <BAIDoubleTag
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
