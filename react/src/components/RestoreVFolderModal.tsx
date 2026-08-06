/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { RestoreVFolderModalFragment$key } from '../__generated__/RestoreVFolderModalFragment.graphql';
import { VFolderNodesFragment$data } from '../__generated__/VFolderNodesFragment.graphql';
import { message } from '../app-shim';
import { useSuspendedBackendaiClient } from '../hooks';
import { useTanMutation } from '../hooks/reactQueryAlias';
import { useSetBAINotification } from '../hooks/useBAINotification';
import BAIModal from './astryx-bui/BAIModalAstryx';
import type { BAIModalAstryxProps as BAIModalProps } from './astryx-bui/BAIModalAstryx';
import { Text } from '@astryxdesign/core/Text';
import { toLocalId, useErrorMessageResolver } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

type VFolderType = NonNullable<VFolderNodesFragment$data[number]>;

interface RestoreVFolderModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  /** App-level contract, kept: consumers outside the pilot graph use it. */
  open?: boolean;
  vfolderFrgmts?: RestoreVFolderModalFragment$key;
  onRequestClose?: (success: boolean) => void;
}

const RestoreVFolderModal: React.FC<RestoreVFolderModalProps> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  const { t } = useTranslation();
  const { upsertNotification } = useSetBAINotification();
  const { getErrorMessage } = useErrorMessageResolver();
  const baiClient = useSuspendedBackendaiClient();

  const vfolders = useFragment(
    graphql`
      fragment RestoreVFolderModalFragment on VirtualFolderNode
      @relay(plural: true) {
        id
        name
      }
    `,
    vfolderFrgmts,
  );

  const restoreMutation = useTanMutation({
    mutationFn: (id: string) => {
      return baiClient.vfolder.restore_from_trash_bin(toLocalId(id));
    },
  });

  return (
    <BAIModal
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose?.(false);
      }}
      title={t('data.folders.Restore')}
      actionLabel={t('data.folders.Restore')}
      onAction={() => {
        const promises = _.map(vfolders, (vfolder: VFolderType) =>
          restoreMutation.mutateAsync(vfolder.id).catch((error) => {
            upsertNotification({
              message: getErrorMessage(error),
              description: error?.description,
              open: true,
            });
            return Promise.reject(error);
          }),
        );
        Promise.allSettled(promises).then((results) => {
          const success = results.every(
            (result) => result.status === 'fulfilled',
          );
          if (success) {
            if (vfolders?.length === 1) {
              message.success(
                t('data.folders.FolderRestored', {
                  folderName: vfolders?.[0]?.name,
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
      <Text>
        {vfolders?.length === 1
          ? t('data.folders.RestoreDescription', {
              folderName: vfolders?.[0]?.name,
            })
          : t('data.folders.RestoreMultipleDescription', {
              folderLength: vfolders?.length,
            })}
      </Text>
    </BAIModal>
  );
};

export default RestoreVFolderModal;
