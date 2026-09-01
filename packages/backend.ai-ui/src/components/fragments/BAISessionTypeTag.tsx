/*
 to-astryx W2-D: antd `Tag` -> Astryx `Badge` (MAPPING §3.5 — not closable).

 PILOT-DECISION: the local `typeTagColor` map is DELETED in favour of the
 repo-global `STATUS_BADGE_VARIANT.sessionType` lookup (ticket 13). It is the
 same three values with `geekblue -> blue` applied by the lookup's policy
 class 2 (Astryx has no geekblue), and it is the one place the session-type
 hues are decided — 65 files each inventing their own is the failure mode that
 module exists to prevent.
*/
import { BAISessionTypeTagFragment$key } from '../../__generated__/BAISessionTypeTagFragment.graphql';
import { badgeVariantForStatus } from '../../helper/astryxTagVariant';
import { Badge } from '@astryxdesign/core/Badge';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionTypeTagProps {
  sessionFrgmt: BAISessionTypeTagFragment$key;
}

const BAISessionTypeTag: React.FC<BAISessionTypeTagProps> = ({
  sessionFrgmt,
}) => {
  const session = useFragment(
    graphql`
      fragment BAISessionTypeTagFragment on ComputeSessionNode {
        type
      }
    `,
    sessionFrgmt,
  );

  if (_.isEmpty(session.type)) {
    return <>-</>;
  }

  const type = _.toUpper(session.type || '');
  return (
    <Badge variant={badgeVariantForStatus('sessionType', type)} label={type} />
  );
};

export default BAISessionTypeTag;
