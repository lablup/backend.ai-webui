import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import BAIImageMetaRow from '../BAIImageMetaRow';
import { imageNodeTagFacts } from '../BAIImageTagBadges';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagProps {
  /** v1 `ImageNode` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * `ImageNode` adapter over {@link BAIImageMetaRow}: it reads the fragment and
 * hands the row its plain facts. The v2 counterpart is
 * `BAIImageNodeSimpleTagV2`, and both render the identical row (ADR 0004).
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
    <BAIImageMetaRow
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
