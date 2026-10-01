/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  EntityShareNodesFragment$data,
  EntityShareNodesFragment$key,
  PermissionBit,
} from '../../__generated__/EntityShareNodesFragment.graphql';
import useEntityShareMutations from './useEntityShareMutations';
import { Badge } from '@astryxdesign/core/Badge';
import {
  badgeVariantForStatus,
  type BAIColumnsType,
  BAIId,
  BAINameActionCell,
  type BAINameActionCellAction,
  BAITable,
  type BAITableProps,
  BAIText,
  filterOutEmpty,
  filterOutNullAndUndefined,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Check, LogOut, Share2, Undo2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

export type EntityShareNodeInList = NonNullable<
  EntityShareNodesFragment$data[number]
>;

/** Which side of the shares in the table the viewer stands on. */
export type EntityShareViewerSide = 'SHARER' | 'RECIPIENT';

export const ENTITY_SHARE_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELED',
  'REVOKED',
] as const;

export const ENTITY_SHARE_PERMISSIONS = [
  'READ',
  'UPDATE',
  'CREATE',
  'SOFT_DELETE',
  'HARD_DELETE',
] as const;

export interface EntityShareNodesProps extends Omit<
  BAITableProps<EntityShareNodeInList>,
  'dataSource' | 'columns'
> {
  entitySharesFrgmt: EntityShareNodesFragment$key;
  side: EntityShareViewerSide;
  onShareChanged?: () => void;
  /** Opens the per-entity share manager from the target cell. */
  onManageTarget?: (target: { entityType: string; entityId: string }) => void;
}

const EntityShareNodes: React.FC<EntityShareNodesProps> = ({
  entitySharesFrgmt,
  side,
  onShareChanged,
  onManageTarget,
  ...tableProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const { accept, reject, cancel, revoke, leave } = useEntityShareMutations();

  const shares = useFragment(
    graphql`
      fragment EntityShareNodesFragment on EntityShare @relay(plural: true) {
        id
        entityId
        sharerUserId
        recipientEntityType
        recipientEntityId
        recipientEmail
        targetEntityType
        targetEntityId
        permissions
        status
        expiresAt
        createdAt
        updatedAt
      }
    `,
    entitySharesFrgmt,
  );

  const runAndNotify = (run: () => Promise<unknown>) => async () => {
    await run();
    onShareChanged?.();
  };

  const getActions = (
    share: EntityShareNodeInList,
  ): Array<BAINameActionCellAction> => {
    if (side === 'RECIPIENT') {
      return filterOutEmpty([
        share.status === 'PENDING' && {
          key: 'accept',
          title: t('entityShare.Accept'),
          icon: <Check />,
          // The hook already reported the error; a popover has nothing to keep open.
          action: () =>
            runAndNotify(() => accept(share.entityId))().catch(() => {}),
        },
        share.status === 'PENDING' && {
          key: 'reject',
          title: t('entityShare.Reject'),
          icon: <X />,
          type: 'danger' as const,
          popConfirm: {
            title: t('entityShare.RejectConfirm'),
            okText: t('entityShare.Reject'),
            okButtonProps: { danger: true },
            cancelText: t('button.Cancel'),
            onConfirm: runAndNotify(() => reject(share.entityId)),
          },
        },
        share.status === 'ACCEPTED' && {
          key: 'leave',
          title: t('entityShare.Leave'),
          icon: <LogOut />,
          type: 'danger' as const,
          popConfirm: {
            title: t('entityShare.LeaveConfirm'),
            okText: t('entityShare.Leave'),
            okButtonProps: { danger: true },
            cancelText: t('button.Cancel'),
            onConfirm: runAndNotify(() => leave(share.entityId)),
          },
        },
      ]);
    }
    return filterOutEmpty([
      share.status === 'PENDING' && {
        key: 'cancel',
        title: t('entityShare.CancelOffer'),
        icon: <Undo2 />,
        type: 'danger' as const,
        popConfirm: {
          title: t('entityShare.CancelOfferConfirm'),
          okText: t('entityShare.CancelOffer'),
          okButtonProps: { danger: true },
          cancelText: t('button.Cancel'),
          onConfirm: runAndNotify(() => cancel(share.entityId)),
        },
      },
      share.status === 'ACCEPTED' && {
        key: 'revoke',
        title: t('entityShare.Revoke'),
        icon: <X />,
        type: 'danger' as const,
        popConfirm: {
          title: t('entityShare.RevokeConfirm'),
          okText: t('entityShare.Revoke'),
          okButtonProps: { danger: true },
          cancelText: t('button.Cancel'),
          onConfirm: runAndNotify(() => revoke(share.entityId)),
        },
      },
    ]);
  };

  const columns: BAIColumnsType<EntityShareNodeInList> = filterOutEmpty([
    {
      key: 'target',
      title: t('entityShare.Target'),
      fixed: 'left',
      render: (__, share) => (
        <BAINameActionCell
          title={
            <BAIText>
              {share.targetEntityType}
              {' · '}
              <BAIId uuid={share.targetEntityId} />
            </BAIText>
          }
          showActions="always"
          actions={filterOutEmpty([
            ...getActions(share),
            onManageTarget && {
              key: 'manage',
              title: t('entityShare.ManageShares'),
              icon: <Share2 />,
              showInMenu: 'always' as const,
              onClick: () =>
                onManageTarget({
                  entityType: share.targetEntityType,
                  entityId: share.targetEntityId,
                }),
            },
          ])}
        />
      ),
    },
    {
      key: 'recipient',
      title: t('entityShare.Recipient'),
      render: (__, share) =>
        share.recipientEmail ? (
          <BAIText>{share.recipientEmail}</BAIText>
        ) : share.recipientEntityId ? (
          <BAIText>
            {share.recipientEntityType}
            {' · '}
            <BAIId uuid={share.recipientEntityId} />
          </BAIText>
        ) : (
          '-'
        ),
    },
    side === 'RECIPIENT' && {
      key: 'sharer',
      title: t('entityShare.Sharer'),
      render: (__, share) =>
        share.sharerUserId ? <BAIId uuid={share.sharerUserId} /> : '-',
    },
    {
      key: 'permissions',
      title: t('entityShare.Permissions'),
      render: (__, share) =>
        _.isEmpty(share.permissions)
          ? t('entityShare.NoPermissionCeiling')
          : _.map(share.permissions, (permission: PermissionBit) =>
              t(`entityShare.permission.${permission}`, {
                defaultValue: permission,
              }),
            ).join(', '),
    },
    {
      key: 'status',
      title: t('entityShare.Status'),
      render: (__, share) => (
        <Badge
          variant={badgeVariantForStatus('entityShare', share.status)}
          label={t(`entityShare.status.${share.status}`, {
            defaultValue: share.status,
          })}
        />
      ),
    },
    {
      key: 'createdAt',
      title: t('entityShare.CreatedAt'),
      render: (__, share) => dayjs(share.createdAt).format('ll LTS'),
    },
    {
      key: 'expiresAt',
      title: t('entityShare.ExpiresAt'),
      render: (__, share) =>
        share.expiresAt ? dayjs(share.expiresAt).format('ll LTS') : '-',
    },
  ]);

  return (
    <BAITable
      scroll={{ x: 'max-content' }}
      resizable
      rowKey="id"
      size="small"
      dataSource={filterOutNullAndUndefined(shares)}
      columns={columns}
      {...tableProps}
    />
  );
};

export default EntityShareNodes;
