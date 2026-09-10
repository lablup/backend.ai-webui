/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteForeverVFolderModalV2Fragment$key } from '../__generated__/DeleteForeverVFolderModalV2Fragment.graphql';
import { DeleteForeverVFolderModalV2Mutation } from '../__generated__/DeleteForeverVFolderModalV2Mutation.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import {
  BAIBulkErrorModal,
  type BAIColumnsType,
  BAIDeleteConfirmModal,
  type BAIDeleteConfirmModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteFailure {
  key: string;
  name: string;
  message: string;
}

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
  // Per-folder failures of the last request; `total` is what the request
  // carried, kept apart from the selection the parent clears on success.
  const [failureReport, setFailureReport] = useState<{
    failures: DeleteFailure[];
    total: number;
  } | null>(null);

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
          successes @since(version: "26.9.0")
          failed @since(version: "26.9.0") {
            vfolderId
            message
          }
          purgedCount @deprecatedSince(version: "26.9.0")
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

  const failureColumns: BAIColumnsType<DeleteFailure> = [
    { key: 'name', title: t('data.folders.Name'), dataIndex: 'name' },
    {
      key: 'message',
      title: t('data.folders.ErrorMessage'),
      dataIndex: 'message',
    },
  ];

  return (
    <>
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
            variables: { input: { ids } },
            onCompleted: (data, errors) => {
              if (errors && errors.length > 0) {
                const firstError = errors[0];
                message.error(
                  firstError?.message ?? getErrorMessage(firstError),
                );
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
                setFailureReport({
                  total: purgeable.length,
                  failures: _.map(failed, (f) => ({
                    key: f.vfolderId,
                    name: nameByLocalId[f.vfolderId] ?? f.vfolderId,
                    message: f.message,
                  })),
                });
              } else if (purgedCount === 0) {
                // Older managers report only the count, so there is no reason
                // to show per folder.
                message.error(
                  t('data.folders.FailedToDeleteFolders', {
                    folderNames: _.map(
                      purgeable,
                      (v) => v?.metadata?.name,
                    ).join(', '),
                  }),
                );
              }
              if (purgedCount === 0) {
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
      <BAIBulkErrorModal<DeleteFailure>
        open={!!failureReport}
        alertDescription={t('data.folders.DeleteFailureDescription', {
          failed: failureReport?.failures.length ?? 0,
          total: failureReport?.total ?? 0,
        })}
        columns={failureColumns}
        dataSource={failureReport?.failures ?? []}
        onRequestClose={() => setFailureReport(null)}
      />
    </>
  );
};

export default DeleteForeverVFolderModalV2;
