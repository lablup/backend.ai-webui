/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { DeleteForeverVFolderModalV2Fragment$key } from '../__generated__/DeleteForeverVFolderModalV2Fragment.graphql';
import { DeleteForeverVFolderModalV2Mutation } from '../__generated__/DeleteForeverVFolderModalV2Mutation.graphql';
import { Alert, App, theme, Typography } from 'antd';
import {
  BAIConfirmModalWithInput,
  BAIConfirmModalWithInputProps,
  BAIFlex,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface DeleteForeverVFolderModalV2Props extends Omit<
  BAIConfirmModalWithInputProps,
  'confirmText' | 'content' | 'title' | 'onOk' | 'onCancel'
> {
  vfolderFrgmts?: DeleteForeverVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const DeleteForeverVFolderModalV2: React.FC<
  DeleteForeverVFolderModalV2Props
> = ({ vfolderFrgmts, onRequestClose, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const { getErrorMessage } = useErrorMessageResolver();

  const vfolders = useFragment(
    graphql`
      fragment DeleteForeverVFolderModalV2Fragment on VirtualFolderNode
      @relay(plural: true) {
        id
        name
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
  // For single-folder deletion the user must type the folder's own name —
  // matches the BAIConfirmModalWithInput convention used elsewhere for
  // irreversible per-resource actions. Bulk deletion falls back to a
  // generic confirmation word since there is no single name to bind to.
  const confirmText =
    purgeable.length === 1
      ? (purgeable[0]?.name ?? t('data.folders.DeleteForeverConfirmText'))
      : t('data.folders.DeleteForeverConfirmText');

  return (
    <BAIConfirmModalWithInput
      {...modalProps}
      title={t('dialog.title.DeleteForever')}
      okText={t('data.folders.DeleteForever')}
      confirmLoading={isInFlightBulkPurge}
      confirmText={confirmText}
      content={
        <BAIFlex
          direction="column"
          gap="md"
          align="stretch"
          style={{ marginBottom: token.marginXS, width: '100%' }}
        >
          <Alert
            type="warning"
            title={t('dialog.warning.DeleteForeverDesc')}
            style={{ width: '100%' }}
          />
          <Typography.Text>
            {purgeable.length === 1
              ? t('data.folders.DeleteForeverDescription', {
                  folderName: purgeable[0]?.name,
                })
              : t('data.folders.DeleteForeverMultipleDescription', {
                  folderLength: purgeable.length,
                })}
          </Typography.Text>
          <BAIFlex>
            <Typography.Text style={{ marginRight: token.marginXXS }}>
              {t('data.folders.TypeToConfirmDeleteForever')}
            </Typography.Text>
            (<Typography.Text code>{confirmText}</Typography.Text>)
          </BAIFlex>
        </BAIFlex>
      }
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
              message.error(firstError?.message ?? getErrorMessage(firstError));
              return;
            }
            const purgedCount = data?.bulkPurgeVfoldersV2?.purgedCount ?? 0;
            if (purgedCount === 0) {
              message.error(
                t('data.folders.FailedToDeleteFolders', {
                  folderNames: _.map(purgeable, 'name').join(', '),
                }),
              );
              return;
            }
            if (purgeable.length === 1) {
              message.success(
                t('data.folders.FolderDeletedForever', {
                  folderName: purgeable[0]?.name,
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
      onCancel={() => onRequestClose?.(false)}
    />
  );
};

export default DeleteForeverVFolderModalV2;
