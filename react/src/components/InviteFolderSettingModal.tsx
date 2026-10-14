/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Share modal on the 26.9 model: an invite is an entity share capped at the
 bits the share permission selector picks, the invitee's mount level is a
 vfolder mount policy — two axes, two controls. See the TODO(needs-backend)
 on `handleInvite`.
*/
import { InviteFolderSettingModalCancelShareMutation } from '../__generated__/InviteFolderSettingModalCancelShareMutation.graphql';
import { InviteFolderSettingModalCreateShareMutation } from '../__generated__/InviteFolderSettingModalCreateShareMutation.graphql';
import { InviteFolderSettingModalFragment$key } from '../__generated__/InviteFolderSettingModalFragment.graphql';
import { InviteFolderSettingModalQuery } from '../__generated__/InviteFolderSettingModalQuery.graphql';
import { InviteFolderSettingModalRecipientsQuery } from '../__generated__/InviteFolderSettingModalRecipientsQuery.graphql';
import { InviteFolderSettingModalRevokeShareMutation } from '../__generated__/InviteFolderSettingModalRevokeShareMutation.graphql';
import { InviteFolderSettingModalSetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalSetMountPolicyMutation.graphql';
import { InviteFolderSettingModalUnsetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalUnsetMountPolicyMutation.graphql';
import { App } from '../app-shim';
import { localeCompare } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { Selector } from '@lablup/ui-common/Selector';
import { HStack, StackItem, VStack } from '@lablup/ui-common/Stack';
import { Heading } from '@lablup/ui-common/Text';
import { Token } from '@lablup/ui-common/Token';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIBadge,
  BAIButton,
  BAIEntitySharePermissionSelector,
  type BAIEntitySharePermissionBit,
  type BAIEntitySharePermissionPreset,
  BAIModal,
  type BAIModalProps,
  BAINameActionCell,
  type BAINameActionCellAction,
  BAIQuestionIconWithTooltip,
  BAIScopedUserSelect,
  BAISkeleton,
  BAITable,
  BAIText,
  ENTITY_SHARE_PERMISSION_PRESETS,
  INITIAL_FETCH_KEY,
  toLocalId,
  useEntitySharePermissionLabels,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleXIcon, MailXIcon } from 'lucide-react';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';

type MountLevel = 'ro' | 'rw';

type RecipientData =
  | { kind: 'user'; userId: string; email: string }
  | { kind: 'email'; email: string };

interface ShareRow {
  shareId: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  userId: string | null;
  mountLevel: MountLevel | null;
  permissions: ReadonlyArray<string>;
}

const toMountLevel = (permission?: string | null): MountLevel | null =>
  permission === 'READ_ONLY' || permission === 'ro'
    ? 'ro'
    : permission === 'READ_WRITE' ||
        permission === 'RW_DELETE' ||
        permission === 'rw' ||
        permission === 'wd'
      ? 'rw'
      : null;

const toMountPermission = (level: MountLevel) =>
  level === 'ro' ? 'READ_ONLY' : 'READ_WRITE';

// The share permission starts from the preset that mirrors the mount level;
// the two stay independent once the user touches either.
const SHARE_PRESET_BY_MOUNT_LEVEL: Record<
  MountLevel,
  BAIEntitySharePermissionPreset
> = { ro: 'READ_ONLY', rw: 'READ_WRITE' };

const sharePresetBits = (level: MountLevel) =>
  _.find(
    ENTITY_SHARE_PERMISSION_PRESETS,
    (preset) => preset.key === SHARE_PRESET_BY_MOUNT_LEVEL[level],
  )?.bits ?? [];

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : _.get(_.castArray(error)[0], 'message');
  return errorMessage || fallback;
};

interface InviteFolderSettingModalProps extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  open?: boolean;
  vfolderFrgmt: InviteFolderSettingModalFragment$key | null;
  onRequestClose: () => void;
}

const InviteFolderSettingModal: React.FC<InviteFolderSettingModalProps> = ({
  vfolderFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const vfolder = useFragment(
    graphql`
      fragment InviteFolderSettingModalFragment on VFolder {
        id
        accessControl {
          permission
        }
      }
    `,
    vfolderFrgmt,
  );

  return (
    <BAIModal
      {...baiModalProps}
      isOpen={baiModalProps.open}
      onOpenChange={(next) => {
        if (!next) onRequestClose();
      }}
      title={t('data.explorer.ShareFolder')}
      maskClosable={false}
      footer={null}
      width={720}
    >
      <Suspense fallback={<BAISkeleton />}>
        {baiModalProps.open && vfolder ? (
          <InviteFolderSettingModalBody
            vfolderId={toLocalId(vfolder.id)}
            defaultMountLevel={
              toMountLevel(vfolder.accessControl?.permission) ?? 'ro'
            }
          />
        ) : null}
      </Suspense>
    </BAIModal>
  );
};

const InviteFolderSettingModalBody: React.FC<{
  vfolderId: string;
  defaultMountLevel: MountLevel;
}> = ({ vfolderId, defaultMountLevel }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const { accessibleProjects } = useAccessibleProjects();
  const memberProjectIds = _.compact(_.map(accessibleProjects, 'id'));

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = deferredFetchKey !== fetchKey;

  const [recipient, setRecipient] = useState<RecipientData | null>(null);
  const [mountLevel, setMountLevel] = useState<MountLevel>(defaultMountLevel);
  const [permissionBits, setPermissionBits] = useState<
    Array<BAIEntitySharePermissionBit>
  >([...sharePresetBits(defaultMountLevel)]);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const { summary: sharePermissionSummary } = useEntitySharePermissionLabels();

  const mountLevelOptions = [
    { label: t('data.ReadOnly'), value: 'ro' },
    { label: t('data.ReadWrite'), value: 'rw' },
  ];
  const mountLevelLabel = (level: MountLevel) =>
    level === 'ro' ? t('data.ReadOnly') : t('data.ReadWrite');

  const { entityShares, vfolderMountPolicies } =
    useLazyLoadQuery<InviteFolderSettingModalQuery>(
      graphql`
        query InviteFolderSettingModalQuery(
          $vfolderId: UUID!
          $scope: EntityShareScope!
        ) {
          entityShares(scope: $scope, limit: 100) {
            edges {
              node {
                id
                entityId
                recipientEntityType
                recipientEntityId
                recipientEmail
                permissions
                status
                permissions
              }
            }
          }
          vfolderMountPolicies(vfolderId: $vfolderId) {
            items {
              id
              userId
              permission
            }
          }
        }
      `,
      {
        vfolderId,
        scope: {
          target: [{ entityType: VFOLDER_ENTITY_TYPE, entityId: vfolderId }],
        },
      },
      {
        fetchKey: deferredFetchKey,
        fetchPolicy:
          deferredFetchKey === INITIAL_FETCH_KEY
            ? 'store-and-network'
            : 'network-only',
      },
    );

  const openShares = _.filter(
    _.map(entityShares?.edges, 'node'),
    (share) => share.status === 'PENDING' || share.status === 'ACCEPTED',
  );
  const recipientUserId = (share: (typeof openShares)[number]) =>
    share.recipientEntityType === 'user'
      ? (share.recipientEntityId ?? null)
      : null;

  // A share sent to a user id carries no e-mail until it is accepted; look the
  // address up among the users the caller's projects reach.
  const unnamedUserIds = _.compact(
    _.map(
      _.filter(openShares, (share) => !share.recipientEmail),
      recipientUserId,
    ),
  );
  const { scopedUsersV2: recipientUsers } =
    useLazyLoadQuery<InviteFolderSettingModalRecipientsQuery>(
      graphql`
        query InviteFolderSettingModalRecipientsQuery(
          $scope: UserScope!
          $filter: UserV2Filter
          $limit: Int!
          $skip: Boolean!
        ) {
          scopedUsersV2(scope: $scope, filter: $filter, limit: $limit)
            @skip(if: $skip) {
            edges {
              node {
                entityId
                basicInfo {
                  email
                }
              }
            }
          }
        }
      `,
      {
        scope: { project: _.map(memberProjectIds, (value) => ({ value })) },
        filter: unnamedUserIds.length ? { uuid: { in: unnamedUserIds } } : null,
        limit: Math.max(unnamedUserIds.length, 1),
        skip: unnamedUserIds.length === 0,
      },
      {
        fetchPolicy: unnamedUserIds.length ? 'store-or-network' : 'store-only',
        fetchKey: deferredFetchKey,
      },
    );
  const emailByUserId = _.fromPairs(
    _.map(recipientUsers?.edges, (edge) => [
      edge.node.entityId,
      edge.node.basicInfo.email,
    ]),
  );
  const policyByUserId = _.keyBy(vfolderMountPolicies?.items, 'userId');

  const rows: Array<ShareRow> = _.sortBy(
    _.map(openShares, (share) => {
      const userId = recipientUserId(share);
      return {
        shareId: share.entityId,
        email:
          share.recipientEmail ??
          (userId ? emailByUserId[userId] : null) ??
          userId ??
          share.entityId,
        status: share.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING',
        userId,
        permissions: share.permissions,
        // An address without an account gets the folder default once it has
        // one; a listed user has their policy row from the invite.
        mountLevel:
          toMountLevel(userId ? policyByUserId[userId]?.permission : null) ??
          (userId ? null : defaultMountLevel),
      };
    }),
    [(row) => (row.status === 'ACCEPTED' ? 0 : 1), (row) => row.email],
  );

  const setMountPolicy =
    useMutationWithPromise<InviteFolderSettingModalSetMountPolicyMutation>(
      graphql`
        mutation InviteFolderSettingModalSetMountPolicyMutation(
          $vfolderId: UUID!
          $input: SetVFolderMountPolicyInput!
        ) {
          setVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {
            policy {
              id
              userId
              permission
            }
          }
        }
      `,
    );
  const unsetMountPolicy =
    useMutationWithPromise<InviteFolderSettingModalUnsetMountPolicyMutation>(
      graphql`
        mutation InviteFolderSettingModalUnsetMountPolicyMutation(
          $vfolderId: UUID!
          $input: UnsetVFolderMountPolicyInput!
        ) {
          unsetVFolderMountPolicy(vfolderId: $vfolderId, input: $input) {
            vfolderId
            userId
            removed
          }
        }
      `,
    );
  const revokeShare =
    useMutationWithPromise<InviteFolderSettingModalRevokeShareMutation>(graphql`
      mutation InviteFolderSettingModalRevokeShareMutation($id: UUID!) {
        revokeEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);
  const createShare =
    useMutationWithPromise<InviteFolderSettingModalCreateShareMutation>(graphql`
      mutation InviteFolderSettingModalCreateShareMutation(
        $input: CreateEntityShareInput!
      ) {
        createEntityShare(input: $input) {
          share {
            id
            entityId
            recipientEmail
            status
          }
        }
      }
    `);
  const cancelShare =
    useMutationWithPromise<InviteFolderSettingModalCancelShareMutation>(graphql`
      mutation InviteFolderSettingModalCancelShareMutation($id: UUID!) {
        cancelEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);

  const inviteTarget = recipient;
  const isEmailInvite = inviteTarget?.kind === 'email';

  const handleInvite = async () => {
    if (!inviteTarget) {
      setRecipientError(t('data.InvalidEmail'));
      return;
    }
    setRecipientError(null);
    try {
      // The offer is an entity share capped at the picked bits; the mount
      // level is a policy row, which an address without an account only
      // gets at the folder default once it has one.
      // TODO(needs-backend): the manager rejects the OneOf `recipient` input
      // with one key set (BA-8482), so the invite fails until that lands.
      await createShare({
        input: {
          targetEntityType: VFOLDER_ENTITY_TYPE,
          targetEntityId: vfolderId,
          recipient:
            inviteTarget.kind === 'user'
              ? { userId: inviteTarget.userId }
              : { email: inviteTarget.email },
          permissions: permissionBits,
        },
      });
      if (inviteTarget.kind === 'user') {
        await setMountPolicy({
          vfolderId,
          input: {
            userId: inviteTarget.userId,
            permission: toMountPermission(mountLevel),
          },
        });
      }
      message.success(t('data.invitation.Invited'));
      setRecipient(null);
      updateFetchKey();
    } catch (error) {
      message.error(getErrorMessage(error));
    }
  };

  const handleChangeMountLevel = async (row: ShareRow, level: MountLevel) => {
    if (!row.userId) return;
    try {
      await setMountPolicy({
        vfolderId,
        input: { userId: row.userId, permission: toMountPermission(level) },
      });
      message.success(t('data.permission.PermissionModified'));
      updateFetchKey();
    } catch (error) {
      message.error(resolveErrorMessage(error, t('general.ErrorOccurred')));
    }
  };

  const handleStopSharing = async (row: ShareRow) => {
    try {
      await revokeShare({ id: row.shareId });
      if (row.userId && policyByUserId[row.userId]) {
        await unsetMountPolicy({ vfolderId, input: { userId: row.userId } });
      }
      message.success(t('data.invitation.SharingStopped'));
      updateFetchKey();
    } catch (error) {
      message.error(resolveErrorMessage(error, t('general.ErrorOccurred')));
    }
  };

  const handleCancelInvitation = async (row: ShareRow) => {
    try {
      await cancelShare({ id: row.shareId });
      message.success(t('data.invitation.InvitationCanceled'));
      updateFetchKey();
    } catch (error) {
      message.error(resolveErrorMessage(error, t('general.ErrorOccurred')));
    }
  };

  const rowActions = (row: ShareRow): Array<BAINameActionCellAction> =>
    row.status === 'ACCEPTED'
      ? [
          {
            key: 'kick-out',
            title: t('data.folders.KickOut'),
            icon: <CircleXIcon />,
            type: 'danger',
            popConfirm: {
              title: t('data.folders.KickOutConfirm', { email: row.email }),
              okText: t('button.Confirm'),
              cancelText: t('button.Cancel'),
              okButtonProps: { danger: true },
              onConfirm: () => handleStopSharing(row),
            },
          },
        ]
      : [
          {
            key: 'cancel-invitation',
            title: t('data.folders.CancelInvitation'),
            icon: <MailXIcon />,
            type: 'danger',
            popConfirm: {
              title: t('data.folders.CancelInvitationConfirm', {
                email: row.email,
              }),
              okText: t('button.Confirm'),
              cancelText: t('button.Cancel'),
              okButtonProps: { danger: true },
              onConfirm: () => handleCancelInvitation(row),
            },
          },
        ];

  return (
    <VStack gap={6} align="stretch">
      <VStack gap={3} align="stretch">
        <Heading level={5}>{t('data.folders.InviteUsers')}</Heading>
        <VStack gap={1} align="stretch">
          <HStack align="end" gap={2} width="100%">
            <StackItem size="fill">
              <Tooltip
                content={recipient?.email}
                isEnabled={!!recipient?.email}
                placement="above"
                hasHoverIndication={false}
              >
                <BAIScopedUserSelect
                  projectId={memberProjectIds}
                  allowCustomSelect
                  allowClear
                  filter={
                    currentUser?.email
                      ? { email: { notEquals: currentUser.email } }
                      : undefined
                  }
                  label={t('general.E-Mail')}
                  placeholder={t('data.folders.SearchUser')}
                  value={recipient?.email ?? null}
                  onChange={(_value, option) => {
                    const picked = _.castArray(option ?? [])[0];
                    setRecipient(
                      !picked
                        ? null
                        : picked.userId
                          ? {
                              kind: 'user',
                              userId: picked.userId,
                              email: picked.value,
                            }
                          : { kind: 'email', email: picked.value },
                    );
                    setRecipientError(null);
                  }}
                  status={
                    recipientError
                      ? { type: 'error', message: recipientError }
                      : undefined
                  }
                  width="100%"
                />
              </Tooltip>
            </StackItem>
            <StackItem size="static">
              <BAIEntitySharePermissionSelector
                label={t('data.folders.SharePermission')}
                labelTooltip={t('data.folders.SharePermissionDesc')}
                width={170}
                value={permissionBits}
                onChange={(bits) => setPermissionBits(bits)}
                data-testid="share-permission-selector"
              />
            </StackItem>
            <StackItem size="static">
              <Selector
                label={t('data.folders.MountPermission')}
                placement="below"
                width={150}
                options={mountLevelOptions}
                value={mountLevel}
                onChange={(next) => setMountLevel(next as MountLevel)}
                isDisabled={isEmailInvite}
              />
            </StackItem>
            <StackItem size="static">
              <BAIButton type="primary" action={handleInvite}>
                {t('data.folders.Invite')}
              </BAIButton>
            </StackItem>
          </HStack>
          {isEmailInvite && (
            <BAIText type="warning" size="sm">
              {t('data.folders.EmailInviteUsesSharedMountPermission', {
                permission: mountLevelLabel(defaultMountLevel),
              })}
            </BAIText>
          )}
        </VStack>
      </VStack>

      <VStack align="stretch" gap={3}>
        <HStack gap={2} align="center">
          <Heading level={5}>{t('data.folders.SharedUser')}</Heading>
          <BAIQuestionIconWithTooltip
            title={t('data.folders.SharedUsersAndInvitationsDesc')}
          />
        </HStack>
        <BAITable<ShareRow>
          scroll={{ x: 'max-content' }}
          bordered
          pagination={false}
          loading={isRefetching}
          dataSource={rows}
          rowKey="shareId"
          columns={[
            {
              title: t('data.explorer.InviteeEmail'),
              dataIndex: 'email',
              sorter: (a, b) => localeCompare(a.email, b.email),
              render: (email: string, row) => (
                <BAINameActionCell
                  title={email}
                  showActions="always"
                  actions={rowActions(row)}
                />
              ),
            },
            {
              title: t('general.Status'),
              dataIndex: 'status',
              render: (status: ShareRow['status']) =>
                status === 'ACCEPTED' ? (
                  <BAIBadge
                    color="success"
                    text={t('data.invitation.Accepted')}
                  />
                ) : (
                  <BAIBadge
                    color="warning"
                    text={t('data.invitation.Pending')}
                  />
                ),
            },
            {
              title: t('data.folders.SharePermission'),
              dataIndex: 'permissions',
              render: (permissions: ShareRow['permissions']) =>
                permissions.length > 0 ? (
                  <Token
                    size="sm"
                    label={sharePermissionSummary(permissions)}
                  />
                ) : (
                  '-'
                ),
            },
            {
              title: t('data.folders.MountPermission'),
              dataIndex: 'mountLevel',
              render: (level: ShareRow['mountLevel'], row) =>
                row.status === 'ACCEPTED' && row.userId ? (
                  <Selector
                    label={t('data.folders.MountPermission')}
                    isLabelHidden
                    placement="below"
                    width={130}
                    options={mountLevelOptions}
                    value={level ?? defaultMountLevel}
                    onChange={(next) =>
                      handleChangeMountLevel(row, next as MountLevel)
                    }
                  />
                ) : row.status === 'PENDING' && level ? (
                  mountLevelLabel(level)
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </VStack>
    </VStack>
  );
};

export default InviteFolderSettingModal;
