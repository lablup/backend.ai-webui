import { BAISessionTypeTokenFragment$key } from '../../__generated__/BAISessionTypeTokenFragment.graphql';
import { tokenColorForStatus } from '../../helper';
import { Token } from '@lablup/ui-common/Token';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

export interface BAISessionTypeTokenProps {
  sessionFrgmt: BAISessionTypeTokenFragment$key;
}

const BAISessionTypeToken: React.FC<BAISessionTypeTokenProps> = ({
  sessionFrgmt,
}) => {
  const session = useFragment(
    graphql`
      fragment BAISessionTypeTokenFragment on ComputeSessionNode {
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
    <Token color={tokenColorForStatus('sessionType', type)} label={type} />
  );
};

export default BAISessionTypeToken;
