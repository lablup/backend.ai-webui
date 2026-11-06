/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectResourceAllocationPanelQuery } from '../../../__generated__/ProjectResourceAllocationPanelQuery.graphql';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import ResourceUsageBars from '../memberCards/ResourceUsageBars';
import { toLimitUsageRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ProjectAllocation: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue({ projectId });
  const data = useLazyLoadQuery<ProjectResourceAllocationPanelQuery>(
    graphql`
      query ProjectResourceAllocationPanelQuery($projectId: UUID!) {
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

/** What the project's sessions use against the project's own limit, per slot. */
const ProjectResourceAllocationPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('dashboard.card.ResourceAllocation')}
      tooltip={t('dashboard.card.ResourceAllocationTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <ProjectAllocation projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectResourceAllocationPanel;
