/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AliasedImageTagTokensFragment$key } from '../__generated__/AliasedImageTagTokensFragment.graphql';
import { useBackendAIImageMetaData } from '../hooks';
import { ImageTagTokens } from './ImageTags';
import { imageNodeTagFacts } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

interface AliasedImageTagTokensProps {
  imageFrgmt?: AliasedImageTagTokensFragment$key | null;
  highlightKeyword?: string;
}

/**
 * The tag chips of a v1 `ImageNode`, for the table columns that show the tags
 * on their own rather than as part of an image row.
 */
const AliasedImageTagTokens: React.FC<AliasedImageTagTokensProps> = ({
  imageFrgmt,
  highlightKeyword,
}) => {
  'use memo';
  const image = useFragment(
    graphql`
      fragment AliasedImageTagTokensFragment on ImageNode {
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
    <ImageTagTokens
      facts={imageNodeTagFacts(image?.tags, image?.labels, tagAlias)}
      highlightKeyword={highlightKeyword}
    />
  );
};

export default AliasedImageTagTokens;
