/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectUsersPanelQuery } from '../../../__generated__/ProjectUsersPanelQuery.graphql';
import DonutChart from '../charts/DonutChart';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import { toDonutRows } from '../memberCards/memberCardData';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, filterOutNullAndUndefined } from 'backend.ai-ui';
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

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      gap="sm"
      style={{ flex: 1, minHeight: 0 }}
    >
      <DonutChart
        label={t('webui.menu.Users')}
        emptyText={t('dashboard.card.NoUsers')}
        columnLabels={{
          name: t('general.Status'),
          value: t('dashboard.card.Count'),
          percent: t('dashboard.card.Share'),
        }}
        rows={toDonutRows([
          {
            key: 'ACTIVE',
            label: t('general.Active'),
            count: data.active?.count,
          },
          {
            key: 'INACTIVE',
            label: t('general.Inactive'),
            count: data.inactive?.count,
          },
        ])}
      />
      {/* One line per admin role; the manager counts its members, nothing is summed here. */}
      {roles.map((role) => (
        <Text key={role.entityId} type="supporting">
          {roles.length > 1
            ? `${role.name} · ${t('dashboard.card.AdminCount', { count: role.usersV2?.count ?? 0 })}`
            : t('dashboard.card.AdminCount', {
                count: role.usersV2?.count ?? 0,
              })}
        </Text>
      ))}
    </BAIFlex>
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
