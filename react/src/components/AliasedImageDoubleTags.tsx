/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AliasedImageDoubleTagsFragment$key } from '../__generated__/AliasedImageDoubleTagsFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { ImageTagBadges } from './ImageTags';
import { imageNodeTagFacts } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface AliasedImageDoubleTagsProps {
  imageFrgmt?: AliasedImageDoubleTagsFragment$key | null;
  highlightKeyword?: string;
}

/**
 * The tag chips of a v1 `ImageNode`, for the table columns that show the tags
 * on their own rather than as part of an image row.
 */
const AliasedImageDoubleTags: React.FC<AliasedImageDoubleTagsProps> = ({
  imageFrgmt,
  highlightKeyword,
}) => {
  'use memo';
  const image = useFragment(
    graphql`
      fragment AliasedImageDoubleTagsFragment on ImageNode {
        labels {
          key
          value
        }
        tags {
          key
          value
        }
      }
    `,
    imageFrgmt,
  );
  const [, { tagAlias }] = useBackendAIImageMetaData();

  return (
    <ImageTagBadges
      facts={imageNodeTagFacts(image?.tags, image?.labels, tagAlias)}
      highlightKeyword={highlightKeyword}
    />
  );
};

export default AliasedImageDoubleTags;
