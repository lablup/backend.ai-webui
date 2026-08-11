/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 17 probe cases — mounts the REAL Sessions-area fragment components
 (nothing re-created) against a relay-test-utils mock environment, so the
 before/after screenshots compare the actual modules:

   case=tags    SessionStatusTag variants + SessionReservation
   case=idle    SessionIdleChecks (network timeout + lifetime rows)
   case=detail  SessionStatusDetailModal (scheduler + error payload)

 This file lives under react/src so the Relay compiler generates its query
 artifact; it is imported only by the theme-probe harness
 (react/theme-probe/sessions.tsx) and is not routed in the app.
*/
import { AstryxSessionProbeCasesQuery } from '../__generated__/AstryxSessionProbeCasesQuery.graphql';
import SessionIdleChecks from '../components/ComputeSessionNodeItems/SessionIdleChecks';
import SessionReservation from '../components/ComputeSessionNodeItems/SessionReservation';
import SessionStatusDetailModal from '../components/ComputeSessionNodeItems/SessionStatusDetailModal';
import SessionStatusTag from '../components/ComputeSessionNodeItems/SessionStatusTag';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

export const AstryxSessionProbeCases: React.FC<{ caseName: string }> = ({
  caseName,
}) => {
  const data = useLazyLoadQuery<AstryxSessionProbeCasesQuery>(
    graphql`
      query AstryxSessionProbeCasesQuery(
        $id1: GlobalIDField!
        $id2: GlobalIDField!
        $id3: GlobalIDField!
      ) {
        running: compute_session_node(id: $id1) {
          ...SessionStatusTagFragment
          ...SessionReservationFragment
          ...SessionIdleChecksNodeFragment
        }
        pending: compute_session_node(id: $id2) {
          ...SessionStatusTagFragment
        }
        error: compute_session_node(id: $id3) {
          ...SessionStatusTagFragment
          ...SessionStatusDetailModalFragment
        }
      }
    `,
    { id1: 'probe-running', id2: 'probe-pending', id3: 'probe-error' },
  );

  if (caseName === 'tags') {
    return (
      <BAIFlex direction="column" align="start" gap="md">
        <SessionStatusTag sessionFrgmt={data.running} />
        <SessionStatusTag sessionFrgmt={data.pending} />
        <SessionStatusTag sessionFrgmt={data.error} showInfo />
        <BAIFlex gap="xs" wrap="wrap">
          {data.running && <SessionReservation sessionFrgmt={data.running} />}
        </BAIFlex>
      </BAIFlex>
    );
  }
  if (caseName === 'idle') {
    return (
      <SessionIdleChecks
        sessionNodeFrgmt={data.running ?? null}
        direction="row"
      />
    );
  }
  if (caseName === 'detail' && data.error) {
    return (
      <SessionStatusDetailModal
        sessionFrgmt={data.error}
        open
        mask={false}
        getContainer={false}
      />
    );
  }
  return null;
};

export default AstryxSessionProbeCases;
