/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { ProjectFoldersPanelQuery } from '../../../__generated__/ProjectFoldersPanelQuery.graphql';
import MemberCard, { NoProjectText } from '../memberCards/MemberCard';
import type { PanelComponentProps } from '../types';
import { adminProjectId } from './projectCardData';
import { Stat } from '@lablup/ui-common/lab';
import { BAIFlex } from 'backend.ai-ui';
import React, { useDeferredValue } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const STAT_FLEX = { flex: '1 1 96px' } as const;

const ProjectFolderCounts: React.FC<{
  projectId: string;
  fetchKey: string;
}> = ({ projectId, fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  // The policy field takes `ID!`, the folder field `UUID!`: the same id twice.
  const variables = useDeferredValue({
    projectId,
    policyProjectId: projectId,
  });
  const data = useLazyLoadQuery<ProjectFoldersPanelQuery>(
    graphql`
      query ProjectFoldersPanelQuery($projectId: UUID!, $policyProjectId: ID!) {
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
  // 0 is no limit, as for the user policy's max_vfolder_count.
  const limit = data.policy.ok
    ? data.policy.value?.maxVfolderCount || null
    : null;

  return (
    <BAIFlex direction="row" gap="lg" wrap="wrap" align="start">
      <BAIFlex style={STAT_FLEX} direction="column">
        <Stat
          label={t('general.Folders')}
          value={String(data.ready?.count ?? 0)}
          description={
            limit ? t('dashboard.card.FolderLimit', { max: limit }) : undefined
          }
        />
      </BAIFlex>
      <BAIFlex style={STAT_FLEX} direction="column">
        <Stat
          label={t('data.folders.TrashBin')}
          value={String(data.trash?.count ?? 0)}
        />
      </BAIFlex>
    </BAIFlex>
  );
};

/** The project's folders (trash apart) against the project's folder limit. */
const ProjectFoldersPanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = adminProjectId(scope);
  return (
    <MemberCard
      title={t('general.Folders')}
      tooltip={t('dashboard.card.ProjectFoldersTooltip')}
      fetchKey={fetchKey}
    >
      {(key) =>
        projectId ? (
          <ProjectFolderCounts projectId={projectId} fetchKey={key} />
        ) : (
          <NoProjectText />
        )
      }
    </MemberCard>
  );
};

export default ProjectFoldersPanel;
