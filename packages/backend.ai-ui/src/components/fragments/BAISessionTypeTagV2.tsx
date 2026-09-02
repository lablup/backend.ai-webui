/*
 to-astryx W2-D: antd `Tag` -> Astryx `Badge`, with the local `typeTagColor`
 map replaced by the repo-global `STATUS_BADGE_VARIANT.sessionType` lookup —
 see the sibling `BAISessionTypeTag` for the full PILOT-DECISION.
*/
import { BAISessionTypeTagV2Fragment$key } from '../../__generated__/BAISessionTypeTagV2Fragment.graphql';
import { badgeVariantForStatus } from '../../helper/astryxTagVariant';
import { Badge } from '@astryxdesign/core/Badge';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionTypeTagV2Props {
  /** v2 `SessionV2MetadataInfo` fragment. */
  metadataFrgmt: BAISessionTypeTagV2Fragment$key | null;
}

/**
 * v2 counterpart of `BAISessionTypeTag`. Consumes the `SessionV2MetadataInfo`
 * fragment directly instead of receiving the session type via a prop.
 */
const BAISessionTypeTagV2: React.FC<BAISessionTypeTagV2Props> = ({
  metadataFrgmt,
}) => {
  'use memo';
  const metadata = useFragment(
    graphql`
      fragment BAISessionTypeTagV2Fragment on SessionV2MetadataInfo {
        sessionType
      }
    `,
    metadataFrgmt ?? null,
  );

  const type = metadata?.sessionType;

  if (_.isEmpty(type)) {
    return <>-</>;
  }

  const upperType = _.toUpper(type || '');
  return (
    <Badge
      variant={badgeVariantForStatus('sessionType', upperType)}
      label={upperType}
    />
  );
};

export default BAISessionTypeTagV2;
