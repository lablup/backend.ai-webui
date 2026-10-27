/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourcePoliciesPanelQuery } from '../../../__generated__/ResourcePoliciesPanelQuery.graphql';
import { useProjectPath } from '../../../hooks/useRouteScope';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import type { PanelComponentProps } from '../types';
import { BAILink } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const PolicyCounts: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const buildPath = useProjectPath();
  const data = useLazyLoadQuery<ResourcePoliciesPanelQuery>(
    graphql`
      query ResourcePoliciesPanelQuery {
        keypair: adminKeypairResourcePoliciesV2(limit: 1) {
          count
        }
        user: adminUserResourcePoliciesV2(limit: 1) {
          count
        }
        project: adminProjectResourcePoliciesV2(limit: 1) {
          count
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const link = (tab: string, count: number | undefined) => (
    <BAILink
      to={`${buildPath('resource-policy', { scope: 'admin' })}?tab=${tab}`}
    >
      {String(count ?? 0)}
    </BAILink>
  );
  return (
    <StatRow
      items={[
        {
          key: 'keypair',
          label: t('resourcePolicy.KeypairResourcePolicy'),
          value: link('keypair', data.keypair?.count),
        },
        {
          key: 'user',
          label: t('resourcePolicy.UserResourcePolicy'),
          value: link('user', data.user?.count),
        },
        {
          key: 'project',
          label: t('resourcePolicy.ProjectResourcePolicy'),
          value: link('project', data.project?.count),
        },
      ]}
    />
  );
};

/** How many keypair, user and project resource policies the cluster has; each count opens its tab. */
const ResourcePoliciesPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const heading = {
    title: t('dashboard.card.ResourcePolicies'),
    tooltip: t('dashboard.card.ResourcePoliciesTooltip'),
  };
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{ project: heading, domain: heading }}
    >
      {(_cardScope, key) => <PolicyCounts fetchKey={key} />}
    </ScopedCard>
  );
};

export default ResourcePoliciesPanel;
