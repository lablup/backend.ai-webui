/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourcePoliciesPanelQuery } from '../../../__generated__/ResourcePoliciesPanelQuery.graphql';
import { useProjectPath } from '../../../hooks/useRouteScope';
import ScopedCard from '../cards/ScopedCard';
import StatRow from '../charts/StatRow';
import { countText, readCounts } from '../countAliases';
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
        keypair: adminKeypairResourcePoliciesV2(limit: 1) @catch(to: RESULT) {
          count
        }
        user: adminUserResourcePoliciesV2(limit: 1) @catch(to: RESULT) {
          count
        }
        project: adminProjectResourcePoliciesV2(limit: 1) @catch(to: RESULT) {
          count
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const counts = readCounts(data, ['keypair', 'user', 'project']);
  const link = (tab: string, count: number | null) =>
    count === null ? (
      countText(count)
    ) : (
      <BAILink
        to={`${buildPath('resource-policy', { scope: 'admin' })}?tab=${tab}`}
      >
        {String(count)}
      </BAILink>
    );
  return (
    <StatRow
      items={[
        {
          key: 'keypair',
          label: t('resourcePolicy.KeypairResourcePolicy'),
          value: link('keypair', counts.keypair),
        },
        {
          key: 'user',
          label: t('resourcePolicy.UserResourcePolicy'),
          value: link('user', counts.user),
        },
        {
          key: 'project',
          label: t('resourcePolicy.ProjectResourcePolicy'),
          value: link('project', counts.project),
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
