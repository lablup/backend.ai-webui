/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteVFolderModalV2Fragment$key } from '../__generated__/DeleteVFolderModalV2Fragment.graphql';
import { DeleteVFolderModalV2Mutation } from '../__generated__/DeleteVFolderModalV2Mutation.graphql';
import { App } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIBulkErrorModal,
  type BAIColumnsType,
  BAIModal,
  type BAIModalProps,
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

interface DeleteVFolderModalV2Props extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside this area use it. */
  open?: boolean;
  vfolderFrgmts?: DeleteVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteVFolderModalV2: React.FC<DeleteVFolderModalV2Props> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  // Older managers have no `items` / `failed` on the payload and reject the
  // whole document, so the per-id selections are gated and the deprecated
  // count is selected instead.
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
      fragment DeleteVFolderModalV2Fragment on VFolder @relay(plural: true) {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts,
  );

  const [commitBulkDeleteMutation, isInFlightBulkDelete] =
    useMutation<DeleteVFolderModalV2Mutation>(graphql`
      mutation DeleteVFolderModalV2Mutation(
        $input: BulkDeleteVFoldersV2Input!
      ) {
        bulkDeleteVfoldersV2(input: $input) {
          items @since(version: "26.9.0") {
            id
          }
          failed @since(version: "26.9.0") {
            vfolderId
            message
          }
          deletedCount @deprecatedSince(version: "26.9.0")
        }
      }
    `);

  // TODO(needs-backend): V2 `VFolder` does not expose a per-user action
  // permission (legacy `VirtualFolderNode.permissions` had `delete_vfolder`).
  // `accessControl.permission` is a mount-level enum (RO/RW/RW_DELETE), not
  // an entity-level action permission, so it cannot be used to filter out
  // undeletable folders here. Send all selected folders and let the backend
  // reject unauthorized ones until a proper permission field is exposed.
  const folders = vfolders ?? [];

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
      <BAIModal
        isOpen={baiModalProps.open}
        onOpenChange={(next) => {
          if (!next) onRequestClose?.(false);
        }}
        title={t('data.folders.MoveToTrash')}
        maskClosable={false}
        okText={t('data.folders.Delete')}
        okButtonProps={{ danger: true }}
        confirmLoading={isInFlightBulkDelete}
        onOk={() => {
          if (folders.length === 0) {
            onRequestClose?.(false);
            return;
          }
          const ids = _.map(folders, (vfolder) => toLocalId(vfolder.id));
          commitBulkDeleteMutation({
            variables: { input: { ids } },
            onCompleted: (data, errors) => {
              if (errors && errors.length > 0) {
                const firstError = errors[0];
                message.error(
                  firstError?.message ?? getErrorMessage(firstError),
                );
                return;
              }
              const deletedCount = supportsPerIdResults
                ? (data?.bulkDeleteVfoldersV2?.items?.length ?? 0)
                : (data?.bulkDeleteVfoldersV2?.deletedCount ?? 0);
              const failed = data?.bulkDeleteVfoldersV2?.failed ?? [];
              // The mutation answers per id, so a partial failure arrives as a
              // success with `failed` populated rather than as a top-level error.
              if (failed.length > 0) {
                const nameByLocalId = _.fromPairs(
                  _.map(folders, (v) => [toLocalId(v.id), v.metadata?.name]),
                );
                setFailureReport({
                  total: folders.length,
                  failures: _.map(failed, (f) => ({
                    key: f.vfolderId,
                    name: nameByLocalId[f.vfolderId] ?? f.vfolderId,
                    message: f.message,
                  })),
                });
              } else if (deletedCount === 0) {
                // Older managers report only the count, so there is no reason
                // to show per folder.
                message.error(
                  t('data.folders.FailedToDeleteFolders', {
                    folderNames: _.map(folders, (v) => v?.metadata?.name).join(
                      ', ',
                    ),
                  }),
                );
              }
              if (deletedCount === 0) {
                return;
              }
              if (folders.length === 1) {
                message.success(
                  t('data.folders.FolderDeleted', {
                    folderName: folders[0]?.metadata?.name,
                  }),
                );
              } else {
                message.success(
                  t('data.folders.MultipleFolderDeleted', {
                    count: deletedCount,
                    total: folders.length,
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
        {...baiModalProps}
      >
        <Text>
          {folders.length === 1
            ? t('data.folders.MoveToTrashDescription', {
                folderName: folders[0]?.metadata?.name,
              })
            : t('data.folders.MoveToTrashMultipleDescription', {
                folderLength: folders.length,
              })}
        </Text>
      </BAIModal>
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

export default DeleteVFolderModalV2;
