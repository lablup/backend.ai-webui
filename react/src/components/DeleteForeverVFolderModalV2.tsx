/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteForeverVFolderModalV2Fragment$key } from '../__generated__/DeleteForeverVFolderModalV2Fragment.graphql';
import { DeleteForeverVFolderModalV2Mutation } from '../__generated__/DeleteForeverVFolderModalV2Mutation.graphql';
import { App } from '../app-shim';
import BAIDeleteConfirmModal from './astryx-bui/BAIDeleteConfirmModalAstryx';
import type { BAIDeleteConfirmModalAstryxProps } from './astryx-bui/BAIDeleteConfirmModalAstryx';
import { toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteForeverVFolderModalV2Props extends Omit<
  BAIDeleteConfirmModalAstryxProps,
  'confirmText' | 'items' | 'title' | 'onAction' | 'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderFrgmts?: DeleteForeverVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteForeverVFolderModalV2: React.FC<
  DeleteForeverVFolderModalV2Props
> = ({ vfolderFrgmts, onRequestClose, open, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const vfolders = useFragment(
    graphql`
      fragment DeleteForeverVFolderModalV2Fragment on VFolder
      @relay(plural: true) {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts,
  );

  const [commitBulkPurgeMutation, isInFlightBulkPurge] =
    useMutation<DeleteForeverVFolderModalV2Mutation>(graphql`
      mutation DeleteForeverVFolderModalV2Mutation(
        $input: BulkPurgeVFoldersV2Input!
      ) {
        bulkPurgeVfoldersV2(input: $input) {
          purgedCount
        }
      }
    `);

  const purgeable = vfolders ?? [];

  // P13: BUI's `BAIDeleteConfirmModal` resolved its confirm string and copy
  // from its own `comp:*` i18n namespace; the Astryx rebuild lives host-side,
  // so every string is supplied explicitly from `resources/i18n`.
  const confirmText =
    purgeable.length === 1
      ? (purgeable[0]?.metadata?.name ?? t('button.Delete'))
      : t('button.Delete');

  return (
    <BAIDeleteConfirmModal
      {...modalProps}
      isOpen={!!open}
      onOpenChange={(next) => {
        if (!next) onRequestClose?.(false);
      }}
      title={t('dialog.title.DeleteForever')}
      description={
        purgeable.length === 1
          ? t('data.folders.DeleteForeverDescription', {
              folderName: purgeable[0]?.metadata?.name ?? '',
            })
          : undefined
      }
      actionLabel={t('data.folders.DeleteForever')}
      cancelLabel={t('button.Cancel')}
      isActionLoading={isInFlightBulkPurge}
      items={_.map(purgeable, (vfolder) => ({
        key: vfolder.id ?? '',
        label: vfolder.metadata?.name ?? '',
      }))}
      requireConfirmInput
      confirmText={confirmText}
      inputLabel={t('dialog.PleaseTypeToConfirm', { confirmText })}
      inputPlaceholder={confirmText}
      cannotBeUndoneText={t('dialog.warning.CannotBeUndone')}
      onAction={() => {
        if (purgeable.length === 0) {
          onRequestClose?.(false);
          return;
        }
        const ids = _.map(purgeable, (vfolder) => toLocalId(vfolder.id));
        commitBulkPurgeMutation({
          variables: { input: { ids } },
          onCompleted: (data, errors) => {
            if (errors && errors.length > 0) {
              const firstError = errors[0];
              message.error(firstError?.message ?? getErrorMessage(firstError));
              return;
            }
            const purgedCount = data?.bulkPurgeVfoldersV2?.purgedCount ?? 0;
            if (purgedCount === 0) {
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: _.map(purgeable, (v) => v?.metadata?.name).join(
                    ', ',
                  ),
                }),
              );
              return;
            }
            if (purgeable.length === 1) {
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: purgeable[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeletedForever', {
                  count: purgedCount,
                  total: purgeable.length,
                }),
              );
            }
            onRequestClose?.(true);
          },
          onError: (error) => {
            message.error(getErrorMessage(error));
          },
        });
      }}
    />
  );
};

export default DeleteForeverVFolderModalV2;
