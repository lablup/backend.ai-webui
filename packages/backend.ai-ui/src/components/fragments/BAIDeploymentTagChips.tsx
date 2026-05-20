import { BAIDeploymentTagChips_metadata$key } from '../../__generated__/BAIDeploymentTagChips_metadata.graphql';
import BAIFlex from '../BAIFlex';
import { Tag } from 'antd';
import React from 'react';
import { graphql, useFragment } from 'react-relay';

export interface BAIDeploymentTagChipsProps {
  metadataFrgmt: BAIDeploymentTagChips_metadata$key | null | undefined;
  /**
   * Called when a chip is activated (mouse click or keyboard Enter/Space).
   * When provided, chips render as interactive buttons. When omitted, chips
   * are presented as plain (non-interactive) tags.
   */
  onTagClick?: (tag: string) => void;
  /**
   * When true, click and Enter/Space keypress events stop bubbling so the
   * surrounding row click handler does not also fire (used inside table
   * row contexts).
   */
  stopRowClick?: boolean;
  /** Rendered when there are no tags to display. */
  fallback?: React.ReactNode;
}

/**
 * Render a deployment metadata's tags as chips. When `onTagClick` is provided
 * the chips become interactive and forward the activated tag value to the
 * caller (typical use: navigate to a list filtered by that tag). Tag entries
 * are split on commas so legacy comma-joined values render as individual
 * chips.
 */
const BAIDeploymentTagChips: React.FC<BAIDeploymentTagChipsProps> = ({
  metadataFrgmt,
  onTagClick,
  stopRowClick = false,
  fallback = null,
}) => {
  'use memo';

  const metadata = useFragment(
    graphql`
      fragment BAIDeploymentTagChips_metadata on ModelDeploymentMetadata {
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

  const interactive = !!onTagClick;

  return (
    <BAIFlex wrap="wrap" gap="xxs">
      {tags.map((tag) =>
        interactive ? (
          <Tag
            key={tag}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
              if (stopRowClick) e.stopPropagation();
              onTagClick?.(tag);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLSpanElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (stopRowClick) e.stopPropagation();
                onTagClick?.(tag);
              }
            }}
          >
            {tag}
          </Tag>
        ) : (
          <Tag key={tag}>{tag}</Tag>
        ),
      )}
    </BAIFlex>
  );
};

export default BAIDeploymentTagChips;
