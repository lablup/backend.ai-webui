import { BAISessionTypeTokenV2Fragment$key } from '../../__generated__/BAISessionTypeTokenV2Fragment.graphql';
import { tokenColorForStatus } from '../../helper';
import { Token } from '@lablup/ui-common/Token';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionTypeTokenV2Props {
  /** v2 `SessionV2MetadataInfo` fragment. */
  metadataFrgmt: BAISessionTypeTokenV2Fragment$key | null;
}

/**
 * v2 counterpart of `BAISessionTypeToken`. Consumes the `SessionV2MetadataInfo`
 * fragment directly instead of receiving the session type via a prop.
 */
const BAISessionTypeTokenV2: React.FC<BAISessionTypeTokenV2Props> = ({
  metadataFrgmt,
}) => {
  'use memo';
  const metadata = useFragment(
    graphql`
      fragment BAISessionTypeTokenV2Fragment on SessionV2MetadataInfo {
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
    <Token
      color={tokenColorForStatus('sessionType', upperType)}
      label={upperType}
    />
  );
};

export default BAISessionTypeTokenV2;
