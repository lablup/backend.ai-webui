import { BAIDeploymentTagTokens_metadata$key } from '../../__generated__/BAIDeploymentTagTokens_metadata.graphql';
import BAIFlex from '../BAIFlex';
import { Token } from '@astryxdesign/core/Token';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIDeploymentTagTokensProps {
  metadataFrgmt: BAIDeploymentTagTokens_metadata$key | null | undefined;
  /**
   * Called when a token is activated. When provided, tokens render as
   * interactive buttons; when omitted, they are plain labels.
   */
  onTagClick?: (tag: string) => void;
  /**
   * When true, the click stops bubbling so the surrounding row click handler
   * does not also fire (used inside table row contexts).
   */
  stopRowClick?: boolean;
  /** Rendered when there are no tags to display. */
  fallback?: React.ReactNode;
}

/**
 * Render a deployment metadata's tags as tokens. Tag entries are split on
 * commas so legacy comma-joined values render as individual tokens.
 */
const BAIDeploymentTagTokens: React.FC<BAIDeploymentTagTokensProps> = ({
  metadataFrgmt,
  onTagClick,
  stopRowClick = false,
  fallback = null,
}) => {
  'use memo';

  const metadata = useFragment(
    graphql`
      fragment BAIDeploymentTagTokens_metadata on ModelDeploymentMetadata {
        tags
      }
    `,
    metadataFrgmt ?? null,
  );

  const tags = (metadata?.tags ?? []).flatMap((tag) =>
    tag
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  );

  if (tags.length === 0) return <>{fallback}</>;

  return (
    <BAIFlex wrap="wrap" gap="xxs">
      {tags.map((tag) => (
        <Token
          key={tag}
          label={tag}
          onClick={
            onTagClick
              ? (e) => {
                  if (stopRowClick) e.stopPropagation();
                  onTagClick(tag);
                }
              : undefined
          }
        />
      ))}
    </BAIFlex>
  );
};

export default BAIDeploymentTagTokens;
