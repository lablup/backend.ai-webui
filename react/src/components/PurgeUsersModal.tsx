/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { PurgeUsersModalBulkMutation } from '../__generated__/PurgeUsersModalBulkMutation.graphql';
import { PurgeUsersModalFragment$key } from '../__generated__/PurgeUsersModalFragment.graphql';
import { App } from '../app-shim';
import BAIDeleteConfirmModalAstryx from './astryx-bui/BAIDeleteConfirmModalAstryx';
import { CheckboxInput } from '@astryxdesign/core/CheckboxInput';
import { VStack } from '@astryxdesign/core/Stack';
import {
  filterOutNullAndUndefined,
  toLocalId,
  useBAILogger,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

// PILOT-DECISION (matches ticket-16 precedent DeleteForeverVFolderModalV2):
// full component swap to `BAIDeleteConfirmModalAstryx` rather than a
// piecemeal Form/Checkbox rename. Purge is the permanent-delete flow
// (`.claude/rules/destructive-confirmation.md`), and BAIDeleteConfirmModal
// (BUI/antd) has no Astryx equivalent to extend in place. The public prop
// contract (`usersFrgmt`/`open`/`onOk`/`onCancel`) is kept unchanged so
// AdminUserManagement.tsx's 2 call sites don't need to change.
export interface PurgeUsersModalProps {
  usersFrgmt: PurgeUsersModalFragment$key;
  open?: boolean;
  onOk?: () => void;
  onCancel?: () => void;
}

const PurgeUsersModal: React.FC<PurgeUsersModalProps> = ({
  usersFrgmt,
  open,
  onOk,
  onCancel,
}) => {
  'use memo';

  const userList = filterOutNullAndUndefined(
    useFragment(
      graphql`
        fragment PurgeUsersModalFragment on UserV2 @relay(plural: true) {
          id
          basicInfo {
            email
          }
        }
      `,
      usersFrgmt,
    ),
  );

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { logger } = useBAILogger();
  const [isPending, setIsPending] = useState(false);
  // The two purge options are independent booleans, not a validated form —
  // per BAIDeleteConfirmModalAstryx's own PILOT-DECISION 1, a form STATE
  // ENGINE is only warranted when there's something to validate. Plain state
  // is the whole mechanism here too.
  const [purgeSharedVfolders, setPurgeSharedVfolders] = useState(false);
  const [deleteModelServices, setDeleteModelServices] = useState(false);

  const [commitBulkPurge, isInFlightBulkPurge] =
    useMutation<PurgeUsersModalBulkMutation>(graphql`
      mutation PurgeUsersModalBulkMutation($input: BulkPurgeUsersV2Input!) {
        adminBulkPurgeUsersV2(input: $input) {
          purgedCount
          failed {
            userId
            message
          }
        }
      }
    `);

  const handleAction = () => {
    return new Promise<void>((resolve, reject) => {
      setIsPending(true);
      // checked = delete endpoints (don't delegate), unchecked = delegate ownership
      const delegateEndpointOwnership = !deleteModelServices;

      const userIds = userList.map((user) => toLocalId(user.id));
      commitBulkPurge({
        variables: {
          input: {
            userIds,
            options: {
              purgeSharedVfolders,
              delegateEndpointOwnership,
            },
          },
        },
        onCompleted: (res, errors) => {
          setIsPending(false);
          if (errors && errors.length > 0) {
            message.error(errors.map((e) => e.message).join(', '));
            reject(new Error(errors.map((e) => e.message).join(', ')));
            return;
          }
          const adminBulkPurgeUsersV2 = res.adminBulkPurgeUsersV2;
          if (!adminBulkPurgeUsersV2) {
            message.error(t('error.UnknownError'));
            reject(new Error(t('error.UnknownError')));
            return;
          }
          const { purgedCount, failed } = adminBulkPurgeUsersV2;

          if (failed.length > 0) {
            const failedMessages = failed.map((f) => f.message).join(', ');
            message.error(failedMessages);
          }

          if (purgedCount > 0) {
            message.success(
              t('credential.UsersPermanentlyDeleted', {
                total: userList.length,
                count: purgedCount,
              }),
            );
            onOk?.();
            resolve();
          } else {
            reject(new Error(t('error.UnknownError')));
          }
        },
        onError: (error) => {
          setIsPending(false);
          message.error(error.message);
          logger.error(error);
          reject(error);
        },
      });
    });
  };

  return (
    <BAIDeleteConfirmModalAstryx
      isOpen={!!open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
      title={t('credential.PermanentlyDeleteUsers')}
      isActionLoading={isPending || isInFlightBulkPurge}
      items={_.map(userList, (user) => ({
        key: user.id,
        label: user.basicInfo.email,
      }))}
      requireConfirmInput
      confirmText={t('credential.PermanentlyDelete')}
      inputLabel={t('credential.TypePermanentlyDelete', {
        text: t('credential.PermanentlyDelete'),
      })}
      inputPlaceholder={t('credential.PermanentlyDelete')}
      cannotBeUndoneText={t('dialog.warning.CannotBeUndone')}
      actionLabel={t('credential.PermanentlyDelete')}
      cancelLabel={t('button.Cancel')}
      extraContent={
        <VStack gap={1} align="stretch">
          <CheckboxInput
            label={t('credential.DeleteSharedVirtualFolders')}
            value={purgeSharedVfolders}
            onChange={setPurgeSharedVfolders}
          />
          <CheckboxInput
            label={t('credential.DeleteDeploymentsAsWell')}
            value={deleteModelServices}
            onChange={setDeleteModelServices}
          />
        </VStack>
      }
      onAction={handleAction}
    />
  );
};

export default PurgeUsersModal;
