/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { VFolderDeleteModalV2BulkDeleteMutation } from '../__generated__/VFolderDeleteModalV2BulkDeleteMutation.graphql';
import { VFolderDeleteModalV2Fragment$key } from '../__generated__/VFolderDeleteModalV2Fragment.graphql';
import { App, Typography, theme } from 'antd';
import {
  BAIAlert,
  BAIFlex,
  BAIModal,
  BAIModalProps,
  toLocalId,
  useBAILogger,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useMutation } from 'react-relay';

interface VFolderDeleteModalV2Props extends BAIModalProps {
  vfolderFrgmts?: VFolderDeleteModalV2Fragment$key;
  onRequestClose?: (success: boolean) => void;
}

const VFolderDeleteModalV2: React.FC<VFolderDeleteModalV2Props> = ({
  vfolderFrgmts,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { logger } = useBAILogger();

  const vfolders = useFragment(
    graphql`
      fragment VFolderDeleteModalV2Fragment on VFolder @relay(plural: true) {
        id @required(action: NONE)
        metadata {
          name
        }
        accessControl {
          permission
        }
      }
    `,
    vfolderFrgmts ?? null,
  );

  const [commitBulkDelete, isInFlight] =
    useMutation<VFolderDeleteModalV2BulkDeleteMutation>(graphql`
      mutation VFolderDeleteModalV2BulkDeleteMutation(
        $input: BulkDeleteVFoldersV2Input!
      ) {
        bulkDeleteVfoldersV2(input: $input) {
          deletedCount
        }
      }
    `);

  const foldersByPermission = _.groupBy(vfolders ?? [], (vfolder) => {
    if (vfolder?.accessControl?.permission === 'RW_DELETE') {
      return 'deletable';
    }
    return 'undeletable';
  });

  const deletable = foldersByPermission.deletable ?? [];
  const undeletable = foldersByPermission.undeletable ?? [];

  return (
    <BAIModal
      title={t('data.folders.MoveToTrash')}
      centered
      okText={t('data.folders.Delete')}
      okButtonProps={{ danger: true, disabled: deletable.length === 0 }}
      confirmLoading={isInFlight}
      onCancel={() => onRequestClose?.(false)}
      onOk={() => {
        if (deletable.length === 0) {
          onRequestClose?.(false);
          return;
        }
        commitBulkDelete({
          variables: {
            input: {
              ids: deletable.map((v) => toLocalId(v!.id)),
            },
          },
          onCompleted: (_data, errors) => {
            if (errors && errors.length > 0) {
              logger.error(errors[0]);
              message.error(errors[0]?.message || t('general.ErrorOccurred'));
              onRequestClose?.(false);
              return;
            }
            if (deletable.length === 1) {
              message.success(
                t('data.folders.FolderDeleted', {
                  folderName: deletable[0]?.metadata?.name,
                }),
              );
            } else {
              message.success(
                t('data.folders.MultipleFolderDeleted', {
                  count: deletable.length,
                  total: deletable.length,
                }),
              );
            }
            onRequestClose?.(true);
          },
          onError: (error) => {
            logger.error(error);
            message.error(getErrorMessage(error));
            onRequestClose?.(false);
          },
        });
      }}
      {...baiModalProps}
    >
      <BAIFlex direction="column" gap={'sm'} align="stretch">
        {vfolders && undeletable.length > 0 && (
          <BAIAlert
            showIcon
            ghostInfoBg={false}
            title={t('data.folders.ExcludedFolders', {
              count: undeletable.length,
            })}
            description={
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  paddingTop: token.paddingXXS,
                  listStyle: 'circle',
                }}
              >
                {undeletable.map((vfolder) => (
                  <li key={vfolder!.id}>{vfolder!.metadata?.name}</li>
                ))}
              </ul>
            }
          />
        )}
        <Typography.Text>
          {deletable.length === 1
            ? t('data.folders.MoveToTrashDescription', {
                folderName: deletable[0]?.metadata?.name,
              })
            : t('data.folders.MoveToTrashMultipleDescription', {
                folderLength: deletable.length,
              })}
        </Typography.Text>
      </BAIFlex>
    </BAIModal>
  );
};

export default VFolderDeleteModalV2;
