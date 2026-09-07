/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusCellFragment$key } from '../../__generated__/SessionReclamationStatusCellFragment.graphql';
import SessionReclamationStatusPopover from './SessionReclamationStatusPopover';
import {
  getOverallReclamation,
  useReclamationColorMap,
  type IdleCheckItem,
  type IdleChecks,
} from './idleChecks';
import { StatusDot } from '@astryxdesign/core/StatusDot';
import { Text } from '@astryxdesign/core/Text';
import { useMemoizedJSONParse, BAIFlex } from 'backend.ai-ui';
import { graphql, useFragment } from 'react-relay';

interface SessionReclamationStatusProps {
  utilizationCheck: IdleCheckItem | undefined;
}

/**
 * Overall reclamation risk of one session, from an already-parsed utilization
 * idle check. Callers that hold the parsed payload render this directly; the
 * `SessionReclamationStatusCell` wrapper below is the Relay boundary for those
 * that only hold the fragment.
 */
export const SessionReclamationStatus: React.FC<
  SessionReclamationStatusProps
> = ({ utilizationCheck }) => {
  'use memo';
  const colorMap = useReclamationColorMap();

  const extra = utilizationCheck?.extra;
  if (!extra?.resources) {
    return <>-</>;
  }

  const overall = getOverallReclamation(
    extra.resources,
    extra.thresholds_check_operator,
  );

  if (!overall) {
    return <>-</>;
  }

  const { variant, label } = colorMap[overall.color];

  return (
    <BAIFlex gap="xxs" align="center">
      <StatusDot variant={variant} label={label} />
      <Text>{label}</Text>
      <SessionReclamationStatusPopover utilizationExtra={extra} />
    </BAIFlex>
  );
};

interface SessionReclamationStatusCellProps {
  sessionFrgmt: SessionReclamationStatusCellFragment$key | null | undefined;
}

const SessionReclamationStatusCell: React.FC<
  SessionReclamationStatusCellProps
> = ({ sessionFrgmt }) => {
  'use memo';
  const session = useFragment(
    graphql`
      fragment SessionReclamationStatusCellFragment on ComputeSessionNode {
        id
        idle_checks
      }
    `,
    sessionFrgmt,
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(session?.idle_checks, {
    fallbackValue: {},
  });

  return <SessionReclamationStatus utilizationCheck={idleChecks.utilization} />;
};

export default SessionReclamationStatusCell;
