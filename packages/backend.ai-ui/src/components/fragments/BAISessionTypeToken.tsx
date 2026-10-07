import { BAISessionTypeTokenFragment$key } from '../../__generated__/BAISessionTypeTokenFragment.graphql';
import { tokenColorForStatus } from '../../helper';
import { getSessionTypeLabel } from '../../helper/sessionTypeLabel';
import { useBAIi18n } from '../../hooks/useBAIi18n';
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
  'use memo';
  const { t } = useBAIi18n();
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
    <Token
      color={tokenColorForStatus('sessionType', type)}
      label={getSessionTypeLabel(t, type)}
    />
  );
};

export default BAISessionTypeToken;
