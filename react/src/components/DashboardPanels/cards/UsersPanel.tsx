/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { UsersPanelDomainQuery } from '../../../__generated__/UsersPanelDomainQuery.graphql';
import type { UsersPanelProjectQuery } from '../../../__generated__/UsersPanelProjectQuery.graphql';
import type { CardScope } from '../cardScope';
import StatRow, { type StatRowItem } from '../charts/StatRow';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import { filterOutNullAndUndefined } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Count = { readonly count: number } | null | undefined;

const useAccountStats = (
  active: Count,
  inactive: Count,
): Array<StatRowItem> => {
  'use memo';
  const { t } = useTranslation();
  return [
    {
      key: 'active',
      label: t('general.Active'),
      value: String(active?.count ?? 0),
    },
    {
      key: 'inactive',
      label: t('general.Inactive'),
      value: String(inactive?.count ?? 0),
    },
  ];
};

const ProjectUsers: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({ projectId });
  const data = useLazyLoadQuery<UsersPanelProjectQuery>(
    graphql`
      query UsersPanelProjectQuery($projectId: UUID!) {
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
  const accountStats = useAccountStats(data.active, data.inactive);
  const roles = data.adminRoles.ok
    ? filterOutNullAndUndefined(
        data.adminRoles.value?.edges.map((edge) => edge?.node),
      )
    : [];
  // One stat per admin role; the manager counts its members, nothing is summed here.
  return (
    <StatRow
      items={[
        ...accountStats,
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

/** Domain admins are the accounts with the `ADMIN` role in the domain. */
const DomainUsers: React.FC<{ domainId: string; fetchKey: string }> = ({
  domainId,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const variables = useDeferredValue({ domainId });
  const data = useLazyLoadQuery<UsersPanelDomainQuery>(
    graphql`
      query UsersPanelDomainQuery($domainId: UUID!) {
        active: scopedUsersV2(
          scope: { domain: [{ value: $domainId }] }
          filter: { status: { equals: ACTIVE } }
          limit: 1
        ) {
          count
        }
        inactive: scopedUsersV2(
          scope: { domain: [{ value: $domainId }] }
          filter: { status: { equals: INACTIVE } }
          limit: 1
        ) {
          count
        }
        admins: scopedUsersV2(
          scope: { domain: [{ value: $domainId }] }
          filter: { status: { equals: ACTIVE }, role: { equals: ADMIN } }
          limit: 1
        ) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const accountStats = useAccountStats(data.active, data.inactive);
  return (
    <StatRow
      items={[
        ...accountStats,
        {
          key: 'admins',
          label: t('dashboard.card.Admins'),
          value: String(data.admins?.count ?? 0),
        },
      ]}
    />
  );
};

const UserCounts: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return null;
    case 'project':
      return <ProjectUsers projectId={scope.projectId} fetchKey={fetchKey} />;
    case 'domain':
      return <DomainUsers domainId={scope.domainId} fetchKey={fetchKey} />;
  }
};

/** Accounts in the page's scope by status, and its admins. */
const UsersPanel: React.FC<PanelComponentProps> = ({ scope, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        project: {
          title: t('webui.menu.Users'),
          tooltip: t('dashboard.card.ProjectUsersTooltip'),
        },
        domain: {
          title: t('webui.menu.Users'),
          tooltip: t('dashboard.card.DomainUsersTooltip'),
        },
      }}
    >
      {(cardScope, key) => <UserCounts scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default UsersPanel;
