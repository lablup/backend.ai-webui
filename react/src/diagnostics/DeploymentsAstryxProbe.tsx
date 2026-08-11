/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 18 probe orchestrator — lives under `react/src` (not `theme-probe/`)
 because Relay only compiles `graphql` tags inside the configured source
 roots (`relay.config.js` → `react/src`). The theme-probe harness page
 (`react/theme-probe/deployments.tsx`) mounts this against a
 relay-test-utils mock environment; it renders nothing in the app itself.
*/
import type { DeploymentsAstryxProbeQuery } from '../__generated__/DeploymentsAstryxProbeQuery.graphql';
import DeploymentRevisionDetail from '../components/DeploymentRevisionDetail';
import DeploymentRevisionDetailDrawer from '../components/DeploymentRevisionDetailDrawer';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Fetches one mock `ModelRevision` and renders the real
 * `DeploymentRevisionDetail` — inline, or inside the real
 * `DeploymentRevisionDetailDrawer` when `inDrawer` is set.
 */
export const DeploymentsProbeRevision: React.FC<{ inDrawer?: boolean }> = ({
  inDrawer,
}) => {
  'use memo';
  const data = useLazyLoadQuery<DeploymentsAstryxProbeQuery>(
    graphql`
      query DeploymentsAstryxProbeQuery {
        revision: node(id: "probe-revision") {
          ... on ModelRevision {
            ...DeploymentRevisionDetail_revision @alias(as: "revisionDetail")
          }
        }
      }
    `,
    {},
  );
  const frgmt = data.revision?.revisionDetail ?? null;
  if (inDrawer) {
    return (
      <DeploymentRevisionDetailDrawer
        open
        revisionFrgmt={frgmt}
        status="current"
      />
    );
  }
  return frgmt ? (
    <div style={{ padding: 24 }}>
      <DeploymentRevisionDetail revisionFrgmt={frgmt} status="current" />
    </div>
  ) : null;
};
