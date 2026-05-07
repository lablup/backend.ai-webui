/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { DeploymentTagChips_metadata$key } from '../__generated__/DeploymentTagChips_metadata.graphql';
import { useWebUINavigate } from '../hooks';
import { Tag } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface DeploymentTagChipsProps {
  metadataFrgmt: DeploymentTagChips_metadata$key | null | undefined;
  /**
   * When true, click and Enter/Space keypress events stop bubbling so the
   * surrounding row click handler does not also fire (used inside the
   * deployment list table).
   */
  stopRowClick?: boolean;
  /** Rendered when there are no tags to display. */
  fallback?: React.ReactNode;
}

/**
 * Render a deployment metadata's tags as clickable chips. Activating a chip
 * (mouse click or keyboard Enter/Space) navigates to the deployment list
 * pre-filtered by that tag using `iContains`. Tag entries are split on
 * commas so legacy comma-joined values render as individual chips.
 */
const DeploymentTagChips: React.FC<DeploymentTagChipsProps> = ({
  metadataFrgmt,
  stopRowClick = false,
  fallback = null,
}) => {
  'use memo';
  const webuiNavigate = useWebUINavigate();
  const location = useLocation();

  const metadata = useFragment(
    graphql`
      fragment DeploymentTagChips_metadata on ModelDeploymentMetadata {
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

  const navigateToFiltered = (tag: string) => {
    const filter = JSON.stringify({ tags: { iContains: tag } });
    // Stay within the admin deployments list when activated from there;
    // otherwise navigate to the user-facing deployment list.
    const targetPathname = location.pathname.startsWith('/admin-deployments')
      ? '/admin-deployments'
      : '/deployments';

    webuiNavigate({
      pathname: targetPathname,
      search: new URLSearchParams({ filter }).toString(),
    });
  };

  return (
    <BAIFlex wrap="wrap" gap="xxs">
      {tags.map((tag) => (
        <Tag
          key={tag}
          role="button"
          tabIndex={0}
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            if (stopRowClick) e.stopPropagation();
            navigateToFiltered(tag);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (stopRowClick) e.stopPropagation();
              navigateToFiltered(tag);
            }
          }}
        >
          {tag}
        </Tag>
      ))}
    </BAIFlex>
  );
};

export default DeploymentTagChips;
