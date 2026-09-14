import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import BAIImageNodeSimpleTagV2, {
  imageNodeTagFacts,
} from './BAIImageNodeSimpleTagV2';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagProps {
  /** v1 `ImageNode` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * `ImageNode` adapter over {@link BAIImageNodeSimpleTagV2}: it reads the v1
 * fragment and hands that component its plain facts, so both schemas render
 * the identical row (ADR 0004).
 */
const BAIImageNodeSimpleTag: React.FC<BAIImageNodeSimpleTagProps> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias }] = useBAIImageMetaData();
  const image = useFragment(
    graphql`
      fragment BAIImageNodeSimpleTagFragment on ImageNode {
        base_image_name
        version
        architecture
        tags {
          key
          value
        }
        labels {
          key @required(action: NONE)
          value
        }
        registry
        namespace
        tag
      }
    `,
    imageFrgmt,
  );

  if (!image) return null;

  // `architecture` is nullable and the row copies this string, so the suffix
  // is conditional.
  const reference = `${image.registry}/${image.namespace}:${image.tag}`;

  return (
    <BAIImageNodeSimpleTagV2
      fullName={
        image.architecture ? `${reference}@${image.architecture}` : reference
      }
      variant={withoutTag ? 'compact' : 'full'}
      name={tagAlias(image.base_image_name || '')}
      version={image.version}
      architecture={image.architecture}
      tags={imageNodeTagFacts(image.tags, image.labels, tagAlias)}
      copyable={copyable}
    />
  );
};

export default BAIImageNodeSimpleTag;
