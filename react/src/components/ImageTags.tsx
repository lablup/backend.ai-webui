/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ImageTagsUNSAFELazySessionImageTagQuery } from '../__generated__/ImageTagsUNSAFELazySessionImageTagQuery.graphql';
import { BAIImageNodeSimpleTagV2 } from 'backend.ai-ui';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface UNSAFELazySessionImageTagProps {
  sessionId: string | null;
}

/**
 * The session detail's fallback when the session exposes no image node: the
 * same image row, built from the `compute_session` image string alone.
 */
export const UNSAFELazySessionImageTag: React.FC<
  UNSAFELazySessionImageTagProps
> = ({ sessionId }) => {
  'use memo';
  const { compute_session } =
    useLazyLoadQuery<ImageTagsUNSAFELazySessionImageTagQuery>(
      graphql`
        query ImageTagsUNSAFELazySessionImageTagQuery($uuid: UUID!) {
          compute_session(id: $uuid) {
            image
            mounts
            architecture
          }
        }
      `,
      {
        uuid: sessionId || '',
      },
      {
        fetchPolicy: sessionId ? 'store-or-network' : 'store-only',
      },
    );

  const imageFullName =
    compute_session?.image &&
    compute_session?.architecture &&
    compute_session.image + '@' + compute_session.architecture;

  // No image node means no tags to show, so the row stays compact.
  return imageFullName ? (
    <BAIImageNodeSimpleTagV2 fullName={imageFullName} variant="compact" />
  ) : null;
};
