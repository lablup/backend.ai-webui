import { BAISessionTypeTagV2Fragment$key } from '../../__generated__/BAISessionTypeTagV2Fragment.graphql';
import { Tag } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

const typeTagColor = {
  INTERACTIVE: 'geekblue',
  BATCH: 'cyan',
  INFERENCE: 'purple',
};

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

  return (
    <Tag color={_.get(typeTagColor, _.toUpper(type || ''))}>
      {_.toUpper(type || '')}
    </Tag>
  );
};

export default BAISessionTypeTagV2;
