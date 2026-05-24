import { BAISessionTypeTagFragment$key } from '../../__generated__/BAISessionTypeTagFragment.graphql';
import { Tag } from 'antd';
import * as _ from 'lodash-es';
import React from 'react';
import { useFragment, graphql } from 'react-relay';

const typeTagColor = {
  INTERACTIVE: 'geekblue',
  BATCH: 'cyan',
  INFERENCE: 'purple',
};

export interface BAISessionTypeTagProps {
  /** v1 `ComputeSessionNode` fragment. Omit when passing `type` directly. */
  sessionFrgmt?: BAISessionTypeTagFragment$key | null;
  /**
   * Session type value (e.g. from the v2 `SessionV2` API). Takes precedence
   * over `sessionFrgmt` when provided.
   */
  type?: string | null;
}

const BAISessionTypeTag: React.FC<BAISessionTypeTagProps> = ({
  sessionFrgmt,
  type,
}) => {
  const session = useFragment(
    graphql`
      fragment BAISessionTypeTagFragment on ComputeSessionNode {
        type
      }
    `,
    sessionFrgmt ?? null,
  );

  const resolvedType = type ?? session?.type;

  if (_.isEmpty(resolvedType)) {
    return <>-</>;
  }

  return (
    <Tag color={_.get(typeTagColor, _.toUpper(resolvedType || ''))}>
      {_.toUpper(resolvedType || '')}
    </Tag>
  );
};

export default BAISessionTypeTag;
