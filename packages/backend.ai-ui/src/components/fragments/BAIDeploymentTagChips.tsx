/*
 to-astryx W2-D: antd `Tag` -> Astryx `Badge` (MAPPING §3.5 — not closable).
 The chips carry no colour, so they land on the default `neutral` variant; the
 interactive branch keeps its own `role="button"` / `tabIndex` / key handling,
 which `Badge` passes through to the root element like antd's `Tag` did.
*/
import { BAIDeploymentTagChips_metadata$key } from '../../__generated__/BAIDeploymentTagChips_metadata.graphql';
import BAIFlex from '../BAIFlex';
import { Badge } from '@astryxdesign/core/Badge';
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
          <Badge
            key={tag}
            variant="neutral"
            label={tag}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={(e: React.MouseEvent<HTMLElement>) => {
              if (stopRowClick) e.stopPropagation();
              onTagClick?.(tag);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (stopRowClick) e.stopPropagation();
                onTagClick?.(tag);
              }
            }}
          />
        ) : (
          <Badge key={tag} variant="neutral" label={tag} />
        ),
      )}
    </BAIFlex>
  );
};

export default BAIDeploymentTagChips;
