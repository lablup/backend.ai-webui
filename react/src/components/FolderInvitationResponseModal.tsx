/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Ticket 16 — converted to Astryx. antd `List`/`List.Item.Meta` becomes Astryx
 `List` + `ListItem` (`label`/`description`/`startContent`/`endContent`), the
 nested `Descriptions size="small"` becomes a single-column `MetadataList`,
 and `BAIButton action` becomes Astryx `Button clickAction` (its native
 async-with-loading form). The empty state is rendered explicitly — Astryx
 `List` has no `locale.emptyText` slot.
*/
import { App } from '../app-shim';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  InvitationItem,
  useVFolderInvitations,
} from '../hooks/useVFolderInvitations';
import VFolderPermissionCell from './VFolderPermissionCell';
import BAIModal from './astryx-bui/BAIModalAstryx';
import type { BAIModalAstryxProps as BAIModalProps } from './astryx-bui/BAIModalAstryx';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { List, ListItem } from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { HStack } from '@astryxdesign/core/Stack';
import { useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { FolderIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface FolderInvitationResponseModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: the opener passes `open` + `onCancel`. */
  open?: boolean;
  onCancel?: () => void;
}

const FolderInvitationResponseModal: React.FC<
  FolderInvitationResponseModalProps
> = ({ onCancel, ...baiModalProps }) => {
  'use memo';
  const { message } = App.useApp();
  const { t } = useTranslation();
  const [
    invitations,
    { acceptInvitation, rejectInvitation, updateInvitations },
  ] = useVFolderInvitations();
  const { getErrorMessage } = useErrorMessageResolver();
  const { upsertNotification } = useSetBAINotification();

  useEffect(() => {
    updateInvitations();
  }, [updateInvitations]);

  const renderInvitationItem = (item: InvitationItem) => (
    <ListItem
      key={item.id}
      label={item.vfolder_name ?? ''}
      startContent={<FolderIcon size="1em" />}
      description={
        <MetadataList columns="single">
          <MetadataListItem label={t('data.From')}>
            {item.inviter_user_email || item.inviter || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('data.Permission')}>
            <VFolderPermissionCell permission={item.perm} />
          </MetadataListItem>
        </MetadataList>
      }
      endContent={
        <HStack gap={2}>
          <Button
            variant="primary"
            label={t('summary.Accept')}
            clickAction={async () => {
              try {
                await acceptInvitation(item.id);
                message.success(
                  t('data.invitation.SuccessfullyAcceptedInvitation'),
                );

                upsertNotification({
                  key: `folder-invitation-success-${item.id}`,
                  icon: 'folder',
                  message: `${item.vfolder_name}: ${t('data.invitation.SuccessfullyAcceptedInvitation')}`,
                  toText: t('data.folders.OpenAFolder'),
                  to: {
                    search: new URLSearchParams({
                      folder: item.vfolder_id,
                    }).toString(),
                  },
                  open: true,
                });
              } catch (e: any) {
                if (
                  e?.statusCode === 409 ||
                  e?.error_code === 'vfolder_create_already-exists'
                ) {
                  message.error(t('data.FolderAlreadyExists'));
                  return;
                }
                message.error(
                  getErrorMessage(
                    e.message || t('data.invitation.FailedToAcceptInvitation'),
                  ),
                );
              }
            }}
          />
          <Button
            variant="destructive"
            label={t('summary.Decline')}
            clickAction={async () => {
              try {
                await rejectInvitation(item.id);
                message.success(
                  t('data.invitation.SuccessfullyDeclinedInvitation'),
                );
              } catch (e: any) {
                message.error(
                  getErrorMessage(
                    e?.message ||
                      t('data.invitation.FailedToDeclineInvitation'),
                  ),
                );
              }
            }}
          />
        </HStack>
      }
    />
  );

  return (
    <BAIModal
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      title={t('data.InvitedFolders')}
      {...baiModalProps}
    >
      {_.isEmpty(invitations) ? (
        <EmptyState title={t('data.invitation.NoMoreInvitation')} isCompact />
      ) : (
        <List hasDividers>
          {invitations.map((item) => renderInvitationItem(item))}
        </List>
      )}
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
