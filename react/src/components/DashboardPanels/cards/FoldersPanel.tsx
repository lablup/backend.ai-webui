/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FoldersPanelMineQuery } from '../../../__generated__/FoldersPanelMineQuery.graphql';
import type { FoldersPanelProjectQuery } from '../../../__generated__/FoldersPanelProjectQuery.graphql';
import { useVFolderInvitations } from '../../../hooks/useVFolderInvitations';
import type { CardScope } from '../cardScope';
import StatRow, { type StatRowItem } from '../charts/StatRow';
import { countText, readCounts } from '../countAliases';
import { readSecondary } from '../panelPermission';
import type { PanelComponentProps } from '../types';
import ScopedCard from './ScopedCard';
import { BAILink, useUpdateEffect } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

/** Ready folders against the limit, and the trash; a limit of 0 means none. */
const useFolderStats = (
  ready: number | null,
  trash: number | null,
  limit: number | null | undefined,
): Array<StatRowItem> => {
  'use memo';
  const { t } = useTranslation();
  return [
    {
      key: 'ready',
      label: t('general.Folders'),
      value: countText(ready),
      description: limit
        ? t('dashboard.card.FolderLimit', { max: limit })
        : undefined,
    },
    {
      key: 'trash',
      label: t('data.folders.TrashBin'),
      value: countText(trash),
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
        ) @catch(to: RESULT) {
          count
        }
        trash: myVfolders(
          filter: { status: { equals: DELETE_PENDING } }
          limit: 1
        ) @catch(to: RESULT) {
          count
        }
        myUserResourcePolicyV2 @catch(to: RESULT) {
          maxVfolderCount
        }
      }
    `,
    {},
    { fetchPolicy: 'store-and-network', fetchKey },
  );
  const invitationCount = invitations.length;
  const counts = readCounts(data, ['ready', 'trash']);
  const folderStats = useFolderStats(
    counts.ready,
    counts.trash,
    readSecondary(data.myUserResourcePolicyV2).value?.maxVfolderCount,
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
        ) @catch(to: RESULT) {
          count
        }
        trash: projectVfolders(
          projectId: $projectId
          filter: { status: { equals: DELETE_PENDING } }
          limit: 1
        ) @catch(to: RESULT) {
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
  const counts = readCounts(data, ['ready', 'trash']);
  const items = useFolderStats(
    counts.ready,
    counts.trash,
    readSecondary(data.policy).value?.maxVfolderCount,
  );
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
      }}
    >
      {(cardScope, key) => <FolderCounts scope={cardScope} fetchKey={key} />}
    </ScopedCard>
  );
};

export default FoldersPanel;
