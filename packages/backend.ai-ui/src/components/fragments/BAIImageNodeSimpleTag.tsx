import { BAIImageNodeSimpleTagFragment$key } from '../../__generated__/BAIImageNodeSimpleTagFragment.graphql';
import { useBAIImageMetaData } from '../provider/BAIMetaDataProvider';
import { imageNodeTagFacts } from './BAIImageNodeSimpleTagV2';
import ImageNodeSimpleTag from './ImageNodeSimpleTag';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIImageNodeSimpleTagProps {
  /** v1 `ImageNode` fragment. */
  imageFrgmt: BAIImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * One-line identity of a v1 `ImageNode` (ADR 0005), drawn by the shared
 * `ImageNodeSimpleTag` row. `BAIImageNodeSimpleTagV2` reads the v2 schema
 * into the same row.
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

  // `architecture` is nullable and the copy control emits this string, so the
  // suffix is conditional.
  const base = `${image.registry}/${image.namespace}:${image.tag}`;
  const fullName = image.architecture ? `${base}@${image.architecture}` : base;

  return (
    <ImageNodeSimpleTag
      fullName={fullName}
      name={tagAlias(image.base_image_name || '')}
      version={image.version}
      architecture={image.architecture}
      facts={imageNodeTagFacts(image.tags, image.labels, tagAlias)}
      withoutTag={withoutTag}
      copyable={copyable}
    />
  );
};

export default BAIImageNodeSimpleTag;
