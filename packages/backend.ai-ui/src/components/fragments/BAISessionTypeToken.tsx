import { BAISessionTypeTokenFragment$key } from '../../__generated__/BAISessionTypeTokenFragment.graphql';
import { tokenColorForStatus } from '../../helper';
import { useBAIi18n } from '../../hooks/useBAIi18n';
import { Token } from '@lablup/ui-common/Token';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

const SESSION_TYPE_LABEL_KEYS: Record<string, string> = {
  INTERACTIVE: 'comp:BAISessionTypeToken.Interactive',
  BATCH: 'comp:BAISessionTypeToken.Batch',
  INFERENCE: 'comp:BAISessionTypeToken.Inference',
  SYSTEM: 'comp:BAISessionTypeToken.System',
};

/** Takes the upper-cased type; unknown types fall back to the raw value. */
export const useSessionTypeLabel = () => {
  const { t } = useBAIi18n();
  return (upperType: string) => {
    const key = SESSION_TYPE_LABEL_KEYS[upperType];
    return key ? t(key) : upperType;
  };
};

export interface BAISessionTypeTokenProps {
  sessionFrgmt: BAISessionTypeTokenFragment$key;
}

const BAISessionTypeToken: React.FC<BAISessionTypeTokenProps> = ({
  sessionFrgmt,
}) => {
  'use memo';
  const getLabel = useSessionTypeLabel();
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
      label={getLabel(type)}
    />
  );
};

export default BAISessionTypeToken;
