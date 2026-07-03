/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SessionReclamationStatusCellFragment$key } from '../../__generated__/SessionReclamationStatusCellFragment.graphql';
import { IdleChecks } from './SessionIdleChecks';
import SessionReclamationStatusPopover, {
  getOverallReclamation,
  useReclamationColorMap,
} from './SessionReclamationStatusPopover';
import { Badge, Typography } from 'antd';
import { useMemoizedJSONParse, BAIFlex } from 'backend.ai-ui';
import { graphql, useFragment } from 'react-relay';

interface SessionReclamationStatusCellProps {
  sessionFrgmt: SessionReclamationStatusCellFragment$key | null;
}

const SessionReclamationStatusCell: React.FC<
  SessionReclamationStatusCellProps
> = ({ sessionFrgmt }) => {
  'use memo';
  const colorMap = useReclamationColorMap();

  const session = useFragment(
    graphql`
      fragment SessionReclamationStatusCellFragment on ComputeSessionNode {
        id
        idle_checks @since(version: "24.12.0")
      }
    `,
    sessionFrgmt,
  );

  const idleChecks: IdleChecks = useMemoizedJSONParse(session?.idle_checks, {
    fallbackValue: {},
  });

  const utilization = idleChecks.utilization;
  const extra = utilization?.extra;
  const resources = extra?.resources;

  if (!utilization || !resources) {
    return <>-</>;
  }

  const overall = getOverallReclamation(
    resources,
    extra.thresholds_check_operator,
  );

  if (!overall) {
    return <>-</>;
  }

  const { token: badgeColor, label } = colorMap[overall.color];

  return (
    <BAIFlex gap="xxs" align="center">
      <Badge color={badgeColor} />
      <Typography.Text>{label}</Typography.Text>
      <SessionReclamationStatusPopover
        resources={resources}
        thresholdsCheckOperator={extra.thresholds_check_operator}
      />
    </BAIFlex>
  );
};

export default SessionReclamationStatusCell;
