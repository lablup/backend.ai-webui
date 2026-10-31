/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { MyFoldersPanelQuery } from '../../../__generated__/MyFoldersPanelQuery.graphql';
import { useVFolderInvitations } from '../../../hooks/useVFolderInvitations';
import type { PanelComponentProps } from '../types';
import MemberCard from './MemberCard';
import { Stat } from '@lablup/ui-common/lab';
import { BAIFlex, BAILink, useUpdateEffect } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

// Three equal columns, so the labels and values line up whatever the counts are.
const STAT_COLUMN = { flex: '1 1 0', minWidth: 0 } as const;

const MyFolderCounts: React.FC<{ fetchKey: string }> = ({ fetchKey }) => {
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

  const invitationCount = invitations.length;

  return (
    <BAIFlex direction="row" gap="lg" align="start">
      <BAIFlex style={STAT_COLUMN} direction="column" align="start">
        <Stat
          label={t('data.Folders')}
          value={String(data.folders?.count ?? 0)}
          description={
            max ? t('dashboard.card.FolderLimit', { max }) : undefined
          }
        />
      </BAIFlex>
      <BAIFlex style={STAT_COLUMN} direction="column" align="start">
        <Stat
          label={t('data.folders.TrashBin')}
          value={String(data.trash?.count ?? 0)}
        />
      </BAIFlex>
      <BAIFlex style={STAT_COLUMN} direction="column" align="start">
        <Stat
          label={t('data.Invited')}
          value={String(invitationCount)}
          media={
            invitationCount > 0 ? (
              <BAILink
                style={{ textAlign: 'start' }}
                onClick={() => setInvitationParam('true')}
              >
                {t('dashboard.card.PendingCount', { count: invitationCount })}
              </BAILink>
            ) : undefined
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
