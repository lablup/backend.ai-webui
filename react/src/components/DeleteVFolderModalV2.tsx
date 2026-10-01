/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteVFolderModalV2Fragment$key } from '../__generated__/DeleteVFolderModalV2Fragment.graphql';
import { DeleteVFolderModalV2Mutation } from '../__generated__/DeleteVFolderModalV2Mutation.graphql';
import { App } from '../app-shim';
import { VStack } from '@lablup/ui-common/Stack';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIBulkErrorModal,
  type BAIColumnsType,
  BAIListAlert,
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
        permissions
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
          items {
            id
          }
          failed {
            vfolderId
            message
          }
        }
      }
    `);

  const { deletable: folders = [], undeletable = [] } = _.groupBy(
    vfolders ?? [],
    (vfolder) =>
      _.includes(vfolder.permissions, 'SOFT_DELETE')
        ? 'deletable'
        : 'undeletable',
  );

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
              const deletedCount =
                data?.bulkDeleteVfoldersV2?.items?.length ?? 0;
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
        <VStack gap={3} align="stretch">
          {undeletable.length > 0 && (
            <BAIListAlert
              banner
              title={t('data.folders.ExcludedFolders', {
                count: undeletable.length,
              })}
              items={_.map(undeletable, (vfolder) => ({
                key: vfolder.id,
                content: vfolder.metadata?.name,
              }))}
            />
          )}
          <Text>
            {folders.length === 1
              ? t('data.folders.MoveToTrashDescription', {
                  folderName: folders[0]?.metadata?.name,
                })
              : t('data.folders.MoveToTrashMultipleDescription', {
                  folderLength: folders.length,
                })}
          </Text>
        </VStack>
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
