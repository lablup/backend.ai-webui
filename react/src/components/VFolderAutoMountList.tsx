/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { VFolderAutoMountListDeleteMutation } from '../__generated__/VFolderAutoMountListDeleteMutation.graphql';
import type {
  VFolderAutoMountListQuery,
  VFolderAutoMountListQuery$data,
} from '../__generated__/VFolderAutoMountListQuery.graphql';
import { App } from '../app-shim';
import FolderLink from './FolderLink';
import VFolderAutoMountSettingModal, {
  type VFolderAutoMountScopeType,
} from './VFolderAutoMountSettingModal';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import { Token } from '@lablup/ui-common/Token';
import {
  BAIFetchKeyButton,
  BAIFlex,
  BAINameActionCell,
  BAITable,
  BAIUnmountAfterClose,
  INITIAL_FETCH_KEY,
  filterOutNullAndUndefined,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { PlusIcon, SquarePenIcon, Trash2 } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

type AutoMountNode = NonNullable<
  VFolderAutoMountListQuery$data['scopedVfolderAutoMounts']
>['edges'][number]['node'];

export interface VFolderAutoMountListProps {
  scopeType: VFolderAutoMountScopeType;
  /** UUID of the project or the user whose auto-mounts are listed. */
  scopeId: string;
}

const VFolderAutoMountList: React.FC<VFolderAutoMountListProps> = ({
  scopeType,
  scopeId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [fetchKey, updateFetchKey] = useFetchKey();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [editing, setEditing] = useState<{
    open: boolean;
    node: AutoMountNode | null;
  }>({ open: false, node: null });

  const variables = {
    scope:
      scopeType === 'PROJECT'
        ? { project: [{ value: scopeId }] }
        : { user: [{ value: scopeId }] },
    filter: { scopeType: { equals: scopeType } },
    limit: pagination.pageSize,
    offset: (pagination.current - 1) * pagination.pageSize,
  };
  const deferredVariables = useDeferredValue(variables);
  const deferredFetchKey = useDeferredValue(fetchKey);

  const { scopedVfolderAutoMounts } =
    useLazyLoadQuery<VFolderAutoMountListQuery>(
      graphql`
        query VFolderAutoMountListQuery(
          $scope: VFolderAutoMountScope!
          $filter: VFolderAutoMountFilter
          $limit: Int
          $offset: Int
        ) {
          scopedVfolderAutoMounts(
            scope: $scope
            filter: $filter
            orderBy: [{ field: MOUNT_DESTINATION, direction: ASC }]
            limit: $limit
            offset: $offset
          ) {
            count
            edges {
              node {
                id
                entityId
                vfolderId
                mountDestination
                subpath
                mountPermission
                vfolder {
                  metadata {
                    name
                  }
                }
                ...VFolderAutoMountSettingModalFragment
              }
            }
          }
        }
      `,
      deferredVariables,
      {
        fetchKey: deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );
  const isPending =
    deferredFetchKey !== fetchKey || !_.isEqual(deferredVariables, variables);

  const deleteAutoMount =
    useMutationWithPromise<VFolderAutoMountListDeleteMutation>(graphql`
      mutation VFolderAutoMountListDeleteMutation(
        $input: DeleteVFolderAutoMountInput!
      ) {
        deleteVfolderAutoMount(input: $input) {
          vfolderAutoMount {
            id
          }
        }
      }
    `);

  const handleDelete = async (node: AutoMountNode) => {
    try {
      await deleteAutoMount({ input: { id: node.entityId } });
      message.success(t('autoMount.AutoMountRemoved'));
      updateFetchKey();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const permissionLabel = (permission: string) =>
    permission === 'READ_ONLY'
      ? t('data.ReadOnly')
      : permission === 'READ_WRITE'
        ? t('data.ReadWrite')
        : t('autoMount.ReadWriteDelete');

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex justify="between" align="center" gap="sm">
        <Text color="secondary">
          {scopeType === 'PROJECT'
            ? t('autoMount.ProjectAutoMountDesc')
            : t('autoMount.UserAutoMountDesc')}
        </Text>
        <BAIFlex gap="xs" align="center">
          <BAIFetchKeyButton
            loading={isPending}
            value=""
            onChange={() => updateFetchKey()}
          />
          <Button
            variant="primary"
            icon={<PlusIcon size="1em" />}
            label={t('autoMount.AddAutoMount')}
            onClick={() => setEditing({ open: true, node: null })}
          />
        </BAIFlex>
      </BAIFlex>
      <BAITable<AutoMountNode>
        rowKey="id"
        size="small"
        loading={isPending}
        dataSource={filterOutNullAndUndefined(
          _.map(scopedVfolderAutoMounts?.edges, 'node'),
        )}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: scopedVfolderAutoMounts?.count ?? 0,
          onChange: (current, pageSize) => setPagination({ current, pageSize }),
        }}
        columns={[
          {
            key: 'folder',
            title: t('autoMount.Folder'),
            render: (__, record) => (
              <BAINameActionCell
                title={
                  <FolderLink
                    folderId={record.vfolderId}
                    folderName={
                      record.vfolder?.metadata?.name ?? record.vfolderId
                    }
                  />
                }
                showActions="always"
                actions={[
                  {
                    key: 'edit',
                    title: t('autoMount.EditAutoMount'),
                    icon: <SquarePenIcon />,
                    onClick: () => setEditing({ open: true, node: record }),
                  },
                  {
                    key: 'remove',
                    title: t('autoMount.RemoveAutoMount'),
                    icon: <Trash2 />,
                    type: 'danger' as const,
                    popConfirm: {
                      title: t('autoMount.RemoveAutoMountConfirm'),
                      description: record.mountDestination,
                      okButtonProps: { danger: true },
                      okText: t('button.Remove'),
                      onConfirm: () => handleDelete(record),
                    },
                  },
                ]}
              />
            ),
          },
          {
            key: 'mountDestination',
            title: t('autoMount.MountDestination'),
            dataIndex: 'mountDestination',
          },
          {
            key: 'subpath',
            title: t('autoMount.Subpath'),
            dataIndex: 'subpath',
          },
          {
            key: 'mountPermission',
            title: t('autoMount.MountPermission'),
            render: (__, record) => (
              <Token label={permissionLabel(record.mountPermission)} />
            ),
          },
        ]}
      />
      <BAIUnmountAfterClose>
        <VFolderAutoMountSettingModal
          open={editing.open}
          scopeType={scopeType}
          scopeId={scopeId}
          autoMountFrgmt={editing.node}
          onRequestClose={(success) => {
            setEditing({ open: false, node: editing.node });
            if (success && !editing.node) {
              updateFetchKey();
            }
          }}
        />
      </BAIUnmountAfterClose>
    </BAIFlex>
  );
};

export default VFolderAutoMountList;
