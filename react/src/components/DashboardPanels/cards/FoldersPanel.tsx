/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FoldersPanelDomainQuery } from '../../../__generated__/FoldersPanelDomainQuery.graphql';
import type { FoldersPanelMineQuery } from '../../../__generated__/FoldersPanelMineQuery.graphql';
import type { FoldersPanelProjectQuery } from '../../../__generated__/FoldersPanelProjectQuery.graphql';
import { useVFolderInvitations } from '../../../hooks/useVFolderInvitations';
import type { CardScope } from '../cardScope';
import StatRow, { type StatRowItem } from '../charts/StatRow';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import { BAILink, useUpdateEffect } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type Count = { readonly count: number } | null | undefined;

/** Ready folders against the limit, and the trash; a limit of 0 means none. */
const useFolderStats = (
  ready: Count,
  trash: Count,
  limit: number | null | undefined,
): Array<StatRowItem> => {
  'use memo';
  const { t } = useTranslation();
  return [
    {
      key: 'ready',
      label: t('general.Folders'),
      value: String(ready?.count ?? 0),
      description: limit
        ? t('dashboard.card.FolderLimit', { max: limit })
        : undefined,
    },
    {
      key: 'trash',
      label: t('data.folders.TrashBin'),
      value: String(trash?.count ?? 0),
    },
  ];
};

/** `myVfolders` is the viewer's own folders only; invitations are theirs too. */
const MineFolders: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  // The app-wide FolderInvitationResponseModalOpener opens on `?invitation=true`, as the invitation notification does.
  const [, setInvitationParam] = useQueryState(
    'invitation',
    parseAsString.withOptions({ history: 'replace' }),
  );
  const [invitations, { updateInvitations }] = useVFolderInvitations();
  useUpdateEffect(() => {
    updateInvitations();
  }, [fetchKey]);
  const data = useLazyLoadQuery<FoldersPanelMineQuery>(
    graphql`
      query FoldersPanelMineQuery {
        ready: myVfolders(
          filter: {
            status: {
              notIn: [
                DELETE_PENDING
                DELETE_ONGOING
                DELETE_COMPLETE
                DELETE_ERROR
              ]
            }
          }
          limit: 1
        ) {
          count
        }
        trash: myVfolders(
          filter: { status: { equals: DELETE_PENDING } }
          limit: 1
        ) {
          count
        }
        myUserResourcePolicyV2 {
          maxVfolderCount
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const invitationCount = invitations.length;
  const folderStats = useFolderStats(
    data.ready,
    data.trash,
    data.myUserResourcePolicyV2?.maxVfolderCount,
  );
  return (
    <StatRow
      items={[
        ...folderStats,
        {
          key: 'invited',
          label: t('data.Invited'),
          value: String(invitationCount),
          media:
            invitationCount > 0 ? (
              <BAILink
                style={{ textAlign: 'start' }}
                onClick={() => setInvitationParam('true')}
              >
                {t('dashboard.card.PendingCount', { count: invitationCount })}
              </BAILink>
            ) : undefined,
        },
      ]}
    />
  );
};

const ProjectFolders: React.FC<{ projectId: string; fetchKey: string }> = ({
  projectId,
  fetchKey,
}) => {
  'use memo';
  // The policy field takes `ID!`, the folder field `UUID!`: the same id twice.
  const variables = useDeferredValue({
    projectId,
    policyProjectId: projectId,
  });
  const data = useLazyLoadQuery<FoldersPanelProjectQuery>(
    graphql`
      query FoldersPanelProjectQuery($projectId: UUID!, $policyProjectId: ID!) {
        ready: projectVfolders(
          projectId: $projectId
          filter: {
            status: {
              notIn: [
                DELETE_PENDING
                DELETE_ONGOING
                DELETE_COMPLETE
                DELETE_ERROR
              ]
            }
          }
          limit: 1
        ) {
          count
        }
        trash: projectVfolders(
          projectId: $projectId
          filter: { status: { equals: DELETE_PENDING } }
          limit: 1
        ) {
          count
        }
        policy: scopedProjectResourcePolicyV2(projectId: $policyProjectId)
          @catch(to: RESULT) {
          maxVfolderCount
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const items = useFolderStats(
    data.ready,
    data.trash,
    data.policy.ok ? data.policy.value?.maxVfolderCount : null,
  );
  return <StatRow items={items} />;
};

/** Folders of every project and user in the domain; the domain has no folder limit. */
const DomainFolders: React.FC<{ domainId: string; fetchKey: string }> = ({
  domainId,
  fetchKey,
}) => {
  'use memo';
  const variables = useDeferredValue({ domainId });
  const data = useLazyLoadQuery<FoldersPanelDomainQuery>(
    graphql`
      query FoldersPanelDomainQuery($domainId: UUID!) {
        ready: scopedVFoldersV2(
          scope: { domain: [{ value: $domainId }] }
          filter: {
            status: {
              notIn: [
                DELETE_PENDING
                DELETE_ONGOING
                DELETE_COMPLETE
                DELETE_ERROR
              ]
            }
          }
          limit: 1
        ) {
          count
        }
        trash: scopedVFoldersV2(
          scope: { domain: [{ value: $domainId }] }
          filter: { status: { equals: DELETE_PENDING } }
          limit: 1
        ) {
          count
        }
      }
    `,
    variables,
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const items = useFolderStats(data.ready, data.trash, null);
  return <StatRow items={items} />;
};

const FolderCounts: React.FC<{ scope: CardScope; fetchKey: string }> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  switch (scope.kind) {
    case 'mine':
      return <MineFolders fetchKey={fetchKey} />;
    case 'project':
      return <ProjectFolders projectId={scope.projectId} fetchKey={fetchKey} />;
    case 'domain':
      return <DomainFolders domainId={scope.domainId} fetchKey={fetchKey} />;
  }
};
/** Folders in the page's scope (trash apart) against the folder limit, and the trash. */
const FoldersPanel: React.FC<PanelComponentProps> = ({ scope, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <ScopedCard
      scope={scope}
      fetchKey={fetchKey}
      heading={{
        mine: { title: t('data.MyFolders') },
        project: {
          title: t('general.Folders'),
          tooltip: t('dashboard.card.ProjectFoldersTooltip'),
        },
        domain: {
          title: t('general.Folders'),
          tooltip: t('dashboard.card.DomainFoldersTooltip'),
        },
      }}
    >
      {(cardScope, key) => <FolderCounts scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default FoldersPanel;
