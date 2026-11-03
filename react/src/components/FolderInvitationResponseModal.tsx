/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Pending folder shares offered to the current user, each a labeled block with
 Accept / Decline. The empty state is rendered explicitly — Astryx `List` has
 no `locale.emptyText` slot.
*/
import { App } from '../app-shim';
import { useSetBAINotification } from '../hooks/useBAINotification';
import {
  InvitationItem,
  useVFolderInvitations,
} from '../hooks/useVFolderInvitations';
import { Button } from '@lablup/ui-common/Button';
import { Divider } from '@lablup/ui-common/Divider';
import { EmptyState } from '@lablup/ui-common/EmptyState';
import { MetadataListItem } from '@lablup/ui-common/MetadataList';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import * as stylex from '@stylexjs/stylex';
import {
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  useEntitySharePermissionLabels,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const styles = stylex.create({
  details: { flex: 1, minWidth: 0 },
});

// The label column hugs its longest label; the default column left a gap wider
// than the values beside it.
const LABEL_WIDTH = 'max-content';

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
  const { summary: sharePermissionSummary } = useEntitySharePermissionLabels();

  useEffect(() => {
    updateInvitations();
  }, [updateInvitations]);

  const renderInvitationItem = (item: InvitationItem) => {
    // A folder the caller may not read yet is named by its id.
    const folderName = item.vfolderName ?? item.vfolderId;
    return (
      <HStack key={item.id} gap={4} align="start">
        <BAIMetadataList
          columns="single"
          label={{ position: 'start', width: LABEL_WIDTH }}
          xstyle={styles.details}
        >
          <MetadataListItem label={t('data.Foldername')}>
            {folderName}
          </MetadataListItem>
          <MetadataListItem label={t('data.From')}>
            {item.sharerEmail || t('data.invitation.UnknownUser')}
          </MetadataListItem>
          <MetadataListItem label={t('data.folders.FolderSharePermission')}>
            {sharePermissionSummary(item.permissions)}
          </MetadataListItem>
        </BAIMetadataList>
        <HStack gap={2} justify="end">
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
                    _.get(_.castArray(e)[0], 'message') ||
                      t('data.invitation.FailedToDeclineInvitation'),
                  ),
                );
              }
            }}
          />
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
                  message: `${folderName}: ${t('data.invitation.SuccessfullyAcceptedInvitation')}`,
                  toText: t('data.folders.OpenAFolder'),
                  to: {
                    search: new URLSearchParams({
                      folder: item.vfolderId,
                    }).toString(),
                  },
                  open: true,
                });
              } catch (e: any) {
                message.error(
                  getErrorMessage(
                    _.get(_.castArray(e)[0], 'message') ||
                      t('data.invitation.FailedToAcceptInvitation'),
                  ),
                );
              }
            }}
          />
        </HStack>
      </HStack>
    );
  };

  return (
    <BAIModal
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      title={t('data.InvitedFolders')}
      maskClosable={false}
      footer={null}
      {...baiModalProps}
    >
      {_.isEmpty(invitations) ? (
        <EmptyState title={t('data.invitation.NoMoreInvitation')} isCompact />
      ) : (
        <VStack gap={4}>
          {invitations.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && <Divider />}
              {renderInvitationItem(item)}
            </React.Fragment>
          ))}
        </VStack>
      )}
    </BAIModal>
  );
};

export default FolderInvitationResponseModal;
