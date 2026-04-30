/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RestoreVFolderModalV2Fragment$key } from '../__generated__/RestoreVFolderModalV2Fragment.graphql';
import { RestoreVFolderModalV2Mutation } from '../__generated__/RestoreVFolderModalV2Mutation.graphql';
import { useSetBAINotification } from '../hooks/useBAINotification';
import { Typography, message } from 'antd';
import {
  BAIModal,
  BAIModalProps,
  toLocalId,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useRelayEnvironment } from 'react-relay';
import { commitMutation } from 'relay-runtime';

interface RestoreVFolderModalV2Props extends BAIModalProps {
  vfolderFrgmts?: RestoreVFolderModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const RestoreVFolderModalV2: React.FC<RestoreVFolderModalV2Props> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const environment = useRelayEnvironment();
  const [isRestoring, setIsRestoring] = useState(false);

  const vfolders = useFragment(
    graphql`
      fragment RestoreVFolderModalV2Fragment on VFolder @relay(plural: true) {
        id
        metadata {
          name
        }
      }
    `,
    vfolderFrgmts,
  );

  // TODO: replace this fan-out with a single bulk mutation once the manager
  // exposes one. Today only a per-folder `restoreVFolder` mutation exists, so
  // bulk restore commits one mutation per folder and aggregates results,
  // mirroring the legacy modal.
  const restoreSingle = (id: string) =>
    new Promise<void>((resolve, reject) => {
      commitMutation<RestoreVFolderModalV2Mutation>(environment, {
        mutation: graphql`
          mutation RestoreVFolderModalV2Mutation($vfolderId: UUID!) {
            restoreVFolder(vfolderId: $vfolderId) {
              id
            }
          }
        `,
        variables: { vfolderId: toLocalId(id) },
        onCompleted: (_data, errors) => {
          if (errors && errors.length > 0) {
            reject(errors[0]);
            return;
          }
          resolve();
        },
        onError: (error) => reject(error),
      });
    });

  return (
    <BAIModal
      title={t('data.folders.Restore')}
      centered
      okText={t('data.folders.Restore')}
      confirmLoading={isRestoring}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        const promises = _.map(vfolders, (vfolder) =>
          restoreSingle(vfolder.id).catch((error) => {
            upsertNotification({
              message: getErrorMessage(error),
              description: error?.description,
              open: true,
            });
            return Promise.reject(error);
          }),
        );
        setIsRestoring(true);
        Promise.allSettled(promises).then((results) => {
          setIsRestoring(false);
          const success = results.every(
            (result) => result.status === 'fulfilled',
          );
          if (success) {
            if (vfolders?.length === 1) {
              message.success(
                t('data.folders.FolderRestored', {
                  folderName: vfolders?.[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderRestored', {
                  folderLength: vfolders?.length,
                }),
              );
            }
          }
          onRequestClose?.(success);
        });
      }}
      {...baiModalProps}
    >
      <Typography.Text>
        {vfolders?.length === 1
          ? t('data.folders.RestoreDescription', {
              folderName: vfolders?.[0]?.metadata?.name,
            })
          : t('data.folders.RestoreMultipleDescription', {
              folderLength: vfolders?.length,
            })}
      </Typography.Text>
    </BAIModal>
  );
};

export default RestoreVFolderModalV2;
