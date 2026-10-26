/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyFoldersPanelQuery } from '../../../__generated__/MyFoldersPanelQuery.graphql';
import { useWebUINavigate } from '../../../hooks';
import { useProjectPath } from '../../../hooks/useRouteScope';
import { useVFolderInvitations } from '../../../hooks/useVFolderInvitations';
import type { PanelComponentProps } from '../types';
import MemberCard from './MemberCard';
import { Stat } from '@lablup/ui-common/lab';
import { BAIFlex, BAILink, useUpdateEffect } from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const STAT_FLEX = { flex: '1 1 96px' } as const;

const MyFolderCounts: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const [invitations, { updateInvitations }] = useVFolderInvitations();
  useUpdateEffect(() => {
    updateInvitations();
  }, [fetchKey]);

  const data = useLazyLoadQuery<MyFoldersPanelQuery>(
    graphql`
      query MyFoldersPanelQuery {
        folders: myVfolders(
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
  const max = data.myUserResourcePolicyV2?.maxVfolderCount;

  return (
    <BAIFlex direction="row" gap="lg" wrap="wrap" align="start">
      <BAIFlex style={STAT_FLEX} direction="column">
        <Stat
          label={t('data.MyFolders')}
          value={String(data.folders?.count ?? 0)}
          description={
            max ? t('dashboard.card.FolderLimit', { max }) : undefined
          }
        />
      </BAIFlex>
      <BAIFlex style={STAT_FLEX} direction="column">
        <Stat
          label={t('data.folders.TrashBin')}
          value={String(data.trash?.count ?? 0)}
        />
      </BAIFlex>
      <BAIFlex style={STAT_FLEX} direction="column">
        <Stat
          label={t('data.InvitedFolders')}
          value={
            invitations.length > 0 ? (
              <BAILink
                onClick={() =>
                  webuiNavigate({
                    pathname: buildProjectPath('data'),
                    search: new URLSearchParams({
                      invitation: 'true',
                    }).toString(),
                  })
                }
              >
                {invitations.length}
              </BAILink>
            ) : (
              '0'
            )
          }
          description={
            invitations.length > 0
              ? t('data.InvitedFoldersTooltip', { count: invitations.length })
              : undefined
          }
        />
      </BAIFlex>
    </BAIFlex>
  );
};

/** The viewer's own folders (`myVfolders` is user-owned only) against the policy limit, the trash, and pending invitations. */
const MyFoldersPanel: React.FC<PanelComponentProps> = ({ fetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <MemberCard title={t('data.MyFolders')} fetchKey={fetchKey}>
      {(key) => <MyFolderCounts fetchKey={key} />}
    </MemberCard>
  );
};

export default MyFoldersPanel;
