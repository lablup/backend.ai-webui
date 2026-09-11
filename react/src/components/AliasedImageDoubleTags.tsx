/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AliasedImageDoubleTagsFragment$key } from '../__generated__/AliasedImageDoubleTagsFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { BAIImageTagBadges, imageNodeTagFacts } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface AliasedImageDoubleTagsProps {
  imageFrgmt?: AliasedImageDoubleTagsFragment$key | null;
  highlightKeyword?: string;
}

/**
 * `ImageNode` adapter for the tag chips of an image, for the table columns that
 * show the tags on their own rather than as part of an image row (ADR 0004).
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
        tags @since(version: "24.12.0") {
          key
          value
        }
      }
    `,
    imageFrgmt,
  );
  const [, { tagAlias }] = useBackendAIImageMetaData();

  return (
    <BAIImageTagBadges
      facts={imageNodeTagFacts(image?.tags, image?.labels, tagAlias)}
      highlightKeyword={highlightKeyword}
    />
  );
};

export default AliasedImageDoubleTags;
