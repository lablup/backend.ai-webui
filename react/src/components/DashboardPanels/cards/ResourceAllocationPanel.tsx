/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ResourceAllocationPanelDomainQuery } from '../../../__generated__/ResourceAllocationPanelDomainQuery.graphql';
import type { ResourceAllocationPanelProjectQuery } from '../../../__generated__/ResourceAllocationPanelProjectQuery.graphql';
import type { CardScope } from '../cardScope';
import ResourceUsageBars from '../memberCards/ResourceUsageBars';
import { toLimitUsageRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ProjectAllocation: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue({ projectId });
  const data = useLazyLoadQuery<ResourceAllocationPanelProjectQuery>(
    graphql`
      query ResourceAllocationPanelProjectQuery($projectId: UUID!) {
        projectResourceAllocationV2(projectId: $projectId) {
          project {
            limits {
              resourceType
              quantity
              unlimited
            }
            used {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <ResourceUsageBars
      rows={toLimitUsageRows(data.projectResourceAllocationV2?.project)}
    />
  );
};

const DomainAllocation: React.FC<{ domainName: string; fetchKey: string }> = ({
  domainName,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue({ domainName });
  const data = useLazyLoadQuery<ResourceAllocationPanelDomainQuery>(
    graphql`
      query ResourceAllocationPanelDomainQuery($domainName: String!) {
        adminDomainResourceAllocationV2(domainName: $domainName) {
          domain {
            limits {
              resourceType
              quantity
              unlimited
            }
            used {
              resourceType
              quantity
            }
          }
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  return (
    <ResourceUsageBars
      rows={toLimitUsageRows(data.adminDomainResourceAllocationV2?.domain)}
    />
  );
};

const Allocation: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return null;
    case 'project':
      return (
        <ProjectAllocation projectId={scope.projectId} fetchKey={fetchKey} />
      );
    case 'domain':
      return (
        <DomainAllocation domainName={scope.domainName} fetchKey={fetchKey} />
      );
  }
};

/** What the sessions in the page's scope use against that scope's own limit, per slot. */
const ResourceAllocationPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        project: {
          title: t('dashboard.card.ResourceAllocation'),
          tooltip: t('dashboard.card.ResourceAllocationTooltip'),
        },
        domain: {
          title: t('dashboard.card.ResourceAllocation'),
          tooltip: t('dashboard.card.DomainResourceAllocationTooltip'),
        },
      }}
    >
      {(cardScope, key) => <Allocation scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default ResourceAllocationPanel;
