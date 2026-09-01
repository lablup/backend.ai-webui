/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteForeverVFolderModalV2Fragment$key } from '../__generated__/DeleteForeverVFolderModalV2Fragment.graphql';
import { DeleteForeverVFolderModalV2Mutation } from '../__generated__/DeleteForeverVFolderModalV2Mutation.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  BAIDeleteConfirmModal,
  type BAIDeleteConfirmModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteForeverVFolderModalV2Props extends Omit<
  BAIDeleteConfirmModalProps,
  'confirmText' | 'items' | 'title' | 'onOk' | 'isOpen' | 'onOpenChange'
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
  // `failed` has existed since 26.4.4, but `successes` did not — selecting it
  // on an older manager rejects the whole document, so both move behind the
  // flag and the deprecated count is selected instead.
  const supportsPerIdResults = useSuspendedBackendaiClient().supports(
    'bulk-mutation-per-id-results',
  );

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
        $supportsPerIdResults: Boolean!
      ) {
        bulkPurgeVfoldersV2(input: $input) {
          successes @include(if: $supportsPerIdResults)
          failed @include(if: $supportsPerIdResults) {
            vfolderId
            message
          }
          purgedCount @skip(if: $supportsPerIdResults)
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
      maskClosable={false}
      okText={t('data.folders.DeleteForever')}
      cancelText={t('button.Cancel')}
      confirmLoading={isInFlightBulkPurge}
      items={_.map(purgeable, (vfolder) => ({
        key: vfolder.id ?? '',
        label: vfolder.metadata?.name ?? '',
      }))}
      requireConfirmInput
      confirmText={confirmText}
      inputLabel={t('dialog.PleaseTypeToConfirm', { confirmText })}
      inputProps={{ placeholder: confirmText }}
      cannotBeUndoneText={t('dialog.warning.CannotBeUndone')}
      onOk={() => {
        if (purgeable.length === 0) {
          onRequestClose?.(false);
          return;
        }
        const ids = _.map(purgeable, (vfolder) => toLocalId(vfolder.id));
        commitBulkPurgeMutation({
          variables: { input: { ids }, supportsPerIdResults },
          onCompleted: (data, errors) => {
            if (errors && errors.length > 0) {
              const firstError = errors[0];
              message.error(firstError?.message ?? getErrorMessage(firstError));
              return;
            }
            const purgedCount = supportsPerIdResults
              ? (data?.bulkPurgeVfoldersV2?.successes?.length ?? 0)
              : (data?.bulkPurgeVfoldersV2?.purgedCount ?? 0);
            const failed = data?.bulkPurgeVfoldersV2?.failed ?? [];
            // The mutation answers per id, so a partial failure arrives as a
            // success with `failed` populated rather than as a top-level error.
            if (failed.length > 0) {
              const nameByLocalId = _.fromPairs(
                _.map(purgeable, (v) => [toLocalId(v.id), v.metadata?.name]),
              );
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: _.map(failed, (f) =>
                    nameByLocalId[f.vfolderId]
                      ? `${nameByLocalId[f.vfolderId]} (${f.message})`
                      : f.message,
                  ).join(', '),
                }),
              );
            }
            if (purgedCount === 0) {
              if (failed.length === 0) {
                message.error(
                  t('data.folders.FailedToDeleteFolders', {
                    folderNames: _.map(
                      purgeable,
                      (v) => v?.metadata?.name,
                    ).join(', '),
                  }),
                );
              }
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
