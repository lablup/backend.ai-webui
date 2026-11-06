/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectUsersPanelQuery } from '../../../__generated__/ProjectUsersPanelQuery.graphql';
import StatRow from '../charts/StatRow';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const ProjectUserCounts: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({ projectId });
  const data = useLazyLoadQuery<ProjectUsersPanelQuery>(
    graphql`
      query ProjectUsersPanelQuery($projectId: UUID!) {
        active: projectUsersV2(
          scope: { projectId: $projectId }
          filter: { status: { equals: ACTIVE } }
          limit: 1
        ) {
          count
        }
        inactive: projectUsersV2(
          scope: { projectId: $projectId }
          filter: { status: { equals: INACTIVE } }
          limit: 1
        ) {
          count
        }
        adminRoles: projectRoles(
          projectId: $projectId
          filter: {
            status: { equals: ACTIVE }
            permissions: { some: { entityType: { iEquals: "scope_admin" } } }
          }
          limit: 5
        ) @catch(to: RESULT) {
          edges {
            node {
              entityId
              name
              usersV2(limit: 1) {
                count
              }
            }
          }
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const roles = data.adminRoles.ok
    ? filterOutNullAndUndefined(
        data.adminRoles.value?.edges.map((edge) => edge?.node),
      )
    : [];

  // One stat per admin role; the manager counts its members, nothing is summed here.
  return (
    <StatRow
      items={[
        {
          key: 'active',
          label: t('general.Active'),
          value: String(data.active?.count ?? 0),
        },
        {
          key: 'inactive',
          label: t('general.Inactive'),
          value: String(data.inactive?.count ?? 0),
        },
        ...roles.map((role) => ({
          key: role.entityId,
          label:
            roles.length > 1
              ? `${t('dashboard.card.Admins')} · ${role.name}`
              : t('dashboard.card.Admins'),
          value: String(role.usersV2?.count ?? 0),
        })),
      ]}
    />
  );
};
/** The project's members by account status, and its admins. */
const ProjectUsersPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('webui.menu.Users')}
      tooltip={t('dashboard.card.ProjectUsersTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <ProjectUserCounts projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectUsersPanel;
