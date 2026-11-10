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
  /** `failedIds` are the Relay ids of the folders that were not moved to trash. */
  onRequestClose?: (success: boolean, failedIds?: string[]) => void;
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
  // carried, kept apart from the selection the parent narrows to the failures.
  const [failureReport, setFailureReport] = useState<{
    failures: DeleteFailure[];
    total: number;
  } | null>(null);

  const vfolders = useFragment(
    graphql`
      fragment DeleteVFolderModalV2Fragment on VFolder @relay(plural: true) {
        id
        entityId
        metadata {
          name
        }
        permissions @since(version: "26.9.0rc1")
      }
    `,
    vfolderFrgmts,
  );

  const [commitBulkDeleteMutation, isInFlightBulkDelete] =
    useMutation<DeleteVFolderModalV2Mutation>(graphql`
      mutation DeleteVFolderModalV2Mutation(
        $input: PartialBulkDeleteVFoldersInput!
      ) {
        partialBulkDeleteVfoldersV2(input: $input) {
          successes {
            id
          }
          failed {
            id
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
          const ids = _.map(folders, (vfolder) => vfolder.entityId);
          const reportFailures = (
            failures: DeleteFailure[],
            deletedCount: number,
          ) => {
            message.error(
              t('data.folders.DeleteFailureDescription', {
                failed: failures.length,
                total: folders.length,
              }),
            );
            setFailureReport({ total: folders.length, failures });
            onRequestClose?.(
              deletedCount > 0,
              _.map(failures, (f) => f.key),
            );
          };
          // A rejected request counts every requested folder as failed.
          const failAll = (errorMessage: string) =>
            reportFailures(
              _.map(folders, (v) => ({
                key: v.id,
                name: v.metadata?.name ?? v.entityId,
                message: errorMessage,
              })),
              0,
            );
          commitBulkDeleteMutation({
            variables: { input: { ids } },
            onCompleted: (data, errors) => {
              if (errors && errors.length > 0) {
                const firstError = errors[0];
                failAll(firstError?.message ?? getErrorMessage(firstError));
                return;
              }
              const { successes, failed } = data.partialBulkDeleteVfoldersV2;
              // The mutation answers per id, so a partial failure arrives as a
              // success with `failed` populated rather than as a top-level error.
              if (failed.length > 0) {
                const folderByLocalId = _.keyBy(folders, (v) => v.entityId);
                reportFailures(
                  _.map(failed, (f) => ({
                    key: folderByLocalId[f.id]?.id ?? f.id,
                    name: folderByLocalId[f.id]?.metadata?.name ?? f.id,
                    message: f.message,
                  })),
                  successes.length,
                );
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
                    count: successes.length,
                    total: folders.length,
                  }),
                );
              }
              onRequestClose?.(true, []);
            },
            onError: (error) => {
              failAll(getErrorMessage(error));
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
