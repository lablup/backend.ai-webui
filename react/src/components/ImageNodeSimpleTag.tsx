/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageNodeSimpleTagFragment$key } from '../__generated__/ImageNodeSimpleTagFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { BAIImageMetaRow, imageNodeTagFacts } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface ImageNodeSimpleTagProps {
  imageFrgmt: ImageNodeSimpleTagFragment$key | null;
  withoutTag?: boolean;
  copyable?: boolean;
}

/**
 * `ImageNode` adapter over `BAIImageMetaRow`: it reads the fragment and hands
 * the row its plain facts. The v2 counterpart is `BAIImageNodeSimpleTagV2`,
 * and both render the identical row (ADR 0004).
 */
const ImageNodeSimpleTag: React.FC<ImageNodeSimpleTagProps> = ({
  imageFrgmt,
  withoutTag = false,
  copyable = true,
}) => {
  'use memo';
  const [, { tagAlias }] = useBackendAIImageMetaData();
  const image = useFragment(
    graphql`
      fragment ImageNodeSimpleTagFragment on ImageNode {
        base_image_name
        version
        architecture
        name
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

  // `namespace` is `@since(version: "24.12.0")`; before that the deprecated
  // `name` carries it, as `getImageFullName` also assumes. `architecture` is
  // nullable, and the row copies this string, so the suffix is conditional.
  const reference = `${image.registry}/${image.namespace ?? image.name}:${image.tag}`;

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

export default ImageNodeSimpleTag;
