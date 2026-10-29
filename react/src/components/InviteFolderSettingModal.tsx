/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Share modal on the 26.9 model: an invite is an entity share capped at the
 bits the share permission selector picks, the invitee's mount level is a
 vfolder mount policy — two axes, two controls. The folder's own default
 mount permission is edited from the Folder Info section (#10647). See the
 TODO(needs-backend) on `handleInvite`.
*/
import { InviteFolderSettingModalCancelShareMutation } from '../__generated__/InviteFolderSettingModalCancelShareMutation.graphql';
import { InviteFolderSettingModalCreateShareMutation } from '../__generated__/InviteFolderSettingModalCreateShareMutation.graphql';
import { InviteFolderSettingModalExistingShareQuery } from '../__generated__/InviteFolderSettingModalExistingShareQuery.graphql';
import { InviteFolderSettingModalFragment$key } from '../__generated__/InviteFolderSettingModalFragment.graphql';
import { InviteFolderSettingModalQuery } from '../__generated__/InviteFolderSettingModalQuery.graphql';
import { InviteFolderSettingModalRevokeShareMutation } from '../__generated__/InviteFolderSettingModalRevokeShareMutation.graphql';
import { InviteFolderSettingModalSetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalSetMountPolicyMutation.graphql';
import { InviteFolderSettingModalUnsetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalUnsetMountPolicyMutation.graphql';
import { App } from '../app-shim';
import { localeCompare } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { useCurrentUserProjectRoles } from '../hooks/useCurrentUserProjectRoles';
import FolderDefaultMountPermissionModal, {
  type FolderMountLevel,
} from './FolderDefaultMountPermissionModal';
import { Button } from '@lablup/ui-common/Button';
import { Field } from '@lablup/ui-common/Field';
import { HStack, StackItem, VStack } from '@lablup/ui-common/Stack';
import { Heading } from '@lablup/ui-common/Text';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import {
  BAIAlert,
  BAIBadge,
  BAIButton,
  BAIEntitySharePermissionSelector,
  type BAIEntitySharePermissionBit,
  type BAIEntitySharePermissionPreset,
  BAIModal,
  type BAIModalProps,
  BAIMetadataList,
  BAIMetadataListItem,
  BAINameActionCell,
  type BAINameActionCellAction,
  BAIQuestionIconWithTooltip,
  BAIScopedUserSelect,
  BAISkeleton,
  BAITable,
  BAIText,
  ENTITY_SHARE_PERMISSION_PRESETS,
  INITIAL_FETCH_KEY,
  normalizeEntitySharePermissionBits,
  useEntitySharePermissionLabels,
  toLocalId,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
  BAISelector,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import {
  CircleXIcon,
  MailXIcon,
  PencilIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import React, {
  Suspense,
  useDeferredValue,
  useId,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

const VFOLDER_ENTITY_TYPE = 'vfolder';

type MountLevel = FolderMountLevel;

type RecipientData =
  | { kind: 'user'; userId: string; email: string }
  | { kind: 'email'; email: string };

interface ShareRow {
  shareId: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  userId: string | null;
  mountLevel: MountLevel;
  permissions: ReadonlyArray<string>;
  /** How the offer named its recipient; a restated offer must name them the same way. */
  recipient: { userId: string } | { projectId: string } | { email: string };
}

/** A share node as the list and the pre-invite check both read it. */
interface ShareNodeLike {
  entityId: string;
  status: string;
  permissions: ReadonlyArray<string>;
  recipientEntityType?: string | null;
  recipientEntityId?: string | null;
  recipientEmail?: string | null;
  recipientEntity?: { basicInfo?: { email: string } | null } | null;
}

const recipientUserIdOf = (share: ShareNodeLike) =>
  share.recipientEntityType === 'user'
    ? (share.recipientEntityId ?? null)
    : null;

/** The open shares as table rows: accepted first, then by address. */
const toShareRows = (
  shares: ReadonlyArray<ShareNodeLike>,
  policies: ReadonlyArray<{ userId: string; permission: string }> | undefined,
  defaultMountLevel: MountLevel,
  unknownUserLabel: string,
): Array<ShareRow> => {
  const policyByUserId = _.keyBy(policies, 'userId');
  return _.sortBy(
    _.map(
      _.filter(
        shares,
        (share) => share.status === 'PENDING' || share.status === 'ACCEPTED',
      ),
      (share) => {
        const userId = recipientUserIdOf(share);
        // The recipient node names the person; the address the offer was
        // sent to is the fallback, and a share naming neither is unknown.
        const email =
          share.recipientEntity?.basicInfo?.email ??
          share.recipientEmail ??
          unknownUserLabel;
        return {
          shareId: share.entityId,
          email,
          status: share.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING',
          userId,
          permissions: share.permissions,
          recipient: userId
            ? { userId }
            : share.recipientEntityType?.toLowerCase() === 'project' &&
                share.recipientEntityId
              ? { projectId: share.recipientEntityId }
              : { email },
          // No policy row (an address without an account yet) means the
          // folder's shared mount permission; the cap never decides the level.
          mountLevel:
            toMountLevel(userId ? policyByUserId[userId]?.permission : null) ??
            defaultMountLevel,
        } satisfies ShareRow;
      },
    ),
    [(row) => (row.status === 'ACCEPTED' ? 0 : 1), (row) => row.email],
  );
};

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

const useMountLevelLabels = () => {
  'use memo';
  const { t } = useTranslation();
  const options = [
    { label: t('data.ReadOnly'), value: 'ro' },
    { label: t('data.ReadWrite'), value: 'rw' },
  ];
  const labelOf = (level: MountLevel) =>
    level === 'ro' ? t('data.ReadOnly') : t('data.ReadWrite');
  return { options, labelOf };
};

const SetMountPolicyMutation = graphql`
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
`;

// Asked before an invite: an open share (pending or accepted) this recipient
// already holds is what `createEntityShare` would restate, so the inviter is
// told first.
const ExistingShareQuery = graphql`
  query InviteFolderSettingModalExistingShareQuery(
    $vfolderId: UUID!
    $scope: EntityShareScope!
    $filter: EntityShareFilter
  ) {
    entityShares(scope: $scope, filter: $filter, limit: 10) {
      edges {
        node {
          id
          entityId
          recipientEntityType
          recipientEntityId
          recipientEmail
          status
          permissions
          recipientEntity @catch(to: NULL) {
            ... on UserV2 {
              entityId
              basicInfo {
                email
              }
            }
          }
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
`;

// The notice before an invite that would restate an open share: the same
// rows the share table shows, read-only, under the question.
const ExistingShareNoticeModal: React.FC<{
  open: boolean;
  email: string;
  rows: Array<ShareRow>;
  onOk: () => void;
  onCancel: () => void;
}> = ({ open, email, rows, onOk, onCancel }) => {
  'use memo';
  const { t } = useTranslation();
  const { labelOf: mountLevelLabel } = useMountLevelLabels();
  const { summary } = useEntitySharePermissionLabels();
  return (
    <BAIModal
      open={open}
      headerContent={
        <HStack gap={2} align="center">
          <TriangleAlertIcon
            size="1em"
            style={{ color: 'var(--color-warning)' }}
          />
          {t('data.folders.ShareAlreadyExists')}
        </HStack>
      }
      okText={t('button.Overwrite')}
      cancelText={t('button.Cancel')}
      onOk={onOk}
      onCancel={onCancel}
      width={720}
    >
      <VStack gap={4} align="stretch">
        <BAIAlert
          type="warning"
          showIcon
          title={t('data.folders.ShareAlreadyExistsDesc', { email })}
        />
        <BAITable<ShareRow>
          bordered
          pagination={false}
          dataSource={rows}
          rowKey="shareId"
          data-testid="existing-share-table"
          columns={[
            {
              title: t('data.explorer.InviteeEmail'),
              dataIndex: 'email',
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
                summary(permissions),
            },
            {
              title: t('data.folders.MountPermission'),
              dataIndex: 'mountLevel',
              render: (level: ShareRow['mountLevel']) => mountLevelLabel(level),
            },
          ]}
        />
      </VStack>
    </BAIModal>
  );
};

const CreateShareMutation = graphql`
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
`;

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
        metadata {
          name
          usageMode
        }
        accessControl {
          permission
          ownershipType
        }
        ownership {
          userId
          projectId
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
      {baiModalProps.open && vfolder ? (
        <InviteFolderSettingModalBody
          vfolderId={toLocalId(vfolder.id)}
          folderName={vfolder.metadata?.name ?? ''}
          defaultMountLevel={
            toMountLevel(vfolder.accessControl?.permission) ?? 'ro'
          }
          // Model project folders stay read-only (FR-1290).
          restrictToReadOnly={
            vfolder.metadata?.usageMode === 'MODEL' &&
            vfolder.accessControl?.ownershipType === 'GROUP'
          }
          ownerUserId={vfolder.ownership?.userId ?? null}
          ownerProjectId={vfolder.ownership?.projectId ?? null}
        />
      ) : null}
    </BAIModal>
  );
};

const InviteFolderSettingModalBody: React.FC<{
  vfolderId: string;
  folderName: string;
  defaultMountLevel: MountLevel;
  restrictToReadOnly: boolean;
  ownerUserId: string | null;
  ownerProjectId: string | null;
}> = ({
  vfolderId,
  folderName,
  defaultMountLevel,
  restrictToReadOnly,
  ownerUserId,
  ownerProjectId,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const relayEnvironment = useRelayEnvironment();
  const [currentUser] = useCurrentUserInfo();
  const { accessibleProjects } = useAccessibleProjects();
  const memberProjectIds = _.compact(_.map(accessibleProjects, 'id'));
  const { options: mountLevelOptions, labelOf: mountLevelLabel } =
    useMountLevelLabels();
  const mountLevelInputId = useId();
  // The recipient tooltip anchors on the select's trigger, not on the whole
  // field, so it sits right above the input like the other tooltips.
  const recipientTriggerRef = useRef<HTMLElement | null>(null);

  const [fetchKey, updateFetchKey] = useFetchKey();

  const [recipient, setRecipient] = useState<RecipientData | null>(null);
  // The open shares the pre-invite check found, shown until the inviter
  // answers the override question.
  const [existingNotice, setExistingNotice] = useState<{
    email: string;
    rows: Array<ShareRow>;
    resolve: (proceed: boolean) => void;
  } | null>(null);
  const [mountLevel, setMountLevel] = useState<MountLevel>(defaultMountLevel);
  const [permissionBits, setPermissionBits] = useState<
    Array<BAIEntitySharePermissionBit>
  >([...sharePresetBits(defaultMountLevel)]);
  const [recipientError, setRecipientError] = useState<string | null>(null);
  const [isDefaultMountModalOpen, setIsDefaultMountModalOpen] = useState(false);

  const setMountPolicy =
    useMutationWithPromise<InviteFolderSettingModalSetMountPolicyMutation>(
      SetMountPolicyMutation,
    );
  const createShare =
    useMutationWithPromise<InviteFolderSettingModalCreateShareMutation>(
      CreateShareMutation,
    );

  const inviteTarget = recipient;
  const isEmailInvite = inviteTarget?.kind === 'email';

  const handleInvite = async () => {
    if (!inviteTarget) {
      setRecipientError(t('data.InvalidEmail'));
      return;
    }
    setRecipientError(null);
    try {
      const existing =
        await fetchQuery<InviteFolderSettingModalExistingShareQuery>(
          relayEnvironment,
          ExistingShareQuery,
          {
            vfolderId,
            scope: {
              target: [
                { entityType: VFOLDER_ENTITY_TYPE, entityId: vfolderId },
              ],
            },
            filter: {
              status: { in: ['PENDING', 'ACCEPTED'] },
              ...(inviteTarget.kind === 'user'
                ? { recipientEntityId: { equals: inviteTarget.userId } }
                : { recipientEmail: { equals: inviteTarget.email } }),
            },
          },
          { fetchPolicy: 'network-only' },
        ).toPromise();
      const existingRows = toShareRows(
        _.map(existing?.entityShares?.edges, 'node'),
        existing?.vfolderMountPolicies?.items,
        defaultMountLevel,
        t('data.invitation.UnknownUser'),
      );
      if (existingRows.length > 0) {
        const proceed = await new Promise<boolean>((resolve) =>
          setExistingNotice({
            email: inviteTarget.email,
            rows: existingRows,
            resolve,
          }),
        );
        setExistingNotice(null);
        if (!proceed) {
          return;
        }
      }
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

  return (
    <VStack gap={6} align="stretch">
      <Suspense fallback={<BAISkeleton />}>
        <FolderInfoSection
          folderName={folderName}
          defaultMountLevel={defaultMountLevel}
          ownerUserId={ownerUserId}
          ownerProjectId={ownerProjectId}
          onEdit={() => setIsDefaultMountModalOpen(true)}
        />
      </Suspense>
      <ExistingShareNoticeModal
        open={!!existingNotice}
        email={existingNotice?.email ?? ''}
        rows={existingNotice?.rows ?? []}
        onOk={() => existingNotice?.resolve(true)}
        onCancel={() => existingNotice?.resolve(false)}
      />
      <FolderDefaultMountPermissionModal
        open={isDefaultMountModalOpen}
        vfolderId={vfolderId}
        mountLevel={defaultMountLevel}
        restrictToReadOnly={restrictToReadOnly}
        onRequestClose={() => setIsDefaultMountModalOpen(false)}
      />
      <VStack gap={3} align="stretch">
        <Heading level={5}>{t('data.folders.InviteUsers')}</Heading>
        <VStack gap={1} align="stretch">
          <HStack align="end" gap={2} width="100%">
            <StackItem size="fill">
              <Suspense fallback={<BAISkeleton variant="input" width="100%" />}>
                <div
                  ref={(node) => {
                    // The ComplexSelector trigger is the popup button.
                    recipientTriggerRef.current =
                      node?.querySelector<HTMLElement>('[aria-haspopup]') ??
                      node;
                  }}
                >
                  <BAIScopedUserSelect
                    scope={{
                      project: _.map(memberProjectIds, (value) => ({ value })),
                    }}
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
                    status={recipientError ? { type: 'error' } : undefined}
                    width="100%"
                  />
                </div>
                <Tooltip
                  anchorRef={recipientTriggerRef}
                  content={recipient?.email}
                  isEnabled={!!recipient?.email}
                  placement="above"
                  hasHoverIndication={false}
                />
              </Suspense>
            </StackItem>
            <StackItem size="static">
              <BAIEntitySharePermissionSelector
                label={t('data.folders.SharePermission')}
                width={170}
                value={permissionBits}
                onChange={(bits) => setPermissionBits(bits)}
                data-testid="share-permission-selector"
              />
            </StackItem>
            <StackItem size="static">
              <Field
                label={t('data.folders.MountPermission')}
                inputID={mountLevelInputId}
                isDisabled={isEmailInvite}
              >
                <BAISelector
                  id={mountLevelInputId}
                  aria-label={t('data.folders.MountPermission')}
                  placement="below"
                  width={150}
                  options={mountLevelOptions}
                  // An e-mail invite gets the folder default, so the disabled
                  // selector shows that value rather than the last pick.
                  value={isEmailInvite ? defaultMountLevel : mountLevel}
                  onChange={(next) => setMountLevel(next as MountLevel)}
                  disabled={isEmailInvite}
                />
              </Field>
            </StackItem>
            <StackItem size="static">
              <BAIButton type="primary" action={handleInvite}>
                {t('data.folders.Invite')}
              </BAIButton>
            </StackItem>
          </HStack>
          {recipientError ? (
            <BAIText type="danger" size="sm" role="alert">
              {recipientError}
            </BAIText>
          ) : null}
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
        <Suspense fallback={<BAISkeleton />}>
          <SharedUserTable
            vfolderId={vfolderId}
            defaultMountLevel={defaultMountLevel}
            fetchKey={fetchKey}
            updateFetchKey={updateFetchKey}
          />
        </Suspense>
      </VStack>
    </VStack>
  );
};

// The folder's own info: its name and how a shared user mounts it by default.
// Editing is for the owner, a superadmin or an admin of the owning project;
// domain admins have no per-project ownership rights.
const FolderInfoSection: React.FC<{
  folderName: string;
  defaultMountLevel: MountLevel;
  ownerUserId: string | null;
  ownerProjectId: string | null;
  onEdit: () => void;
}> = ({
  folderName,
  defaultMountLevel,
  ownerUserId,
  ownerProjectId,
  onEdit,
}) => {
  'use memo';
  const { t } = useTranslation();
  const [currentUser] = useCurrentUserInfo();
  const { isSuperAdmin, projectAdminIds } = useCurrentUserProjectRoles();
  const { labelOf: mountLevelLabel } = useMountLevelLabels();

  const canEdit =
    (!!ownerUserId && ownerUserId === currentUser?.uuid) ||
    isSuperAdmin ||
    (!!ownerProjectId && projectAdminIds.includes(ownerProjectId));

  return (
    <VStack gap={3} align="stretch">
      <HStack justify="between" align="center">
        <Heading level={5}>{t('data.FolderInfo')}</Heading>
        {canEdit && (
          <Button
            variant="secondary"
            icon={<PencilIcon size="1em" />}
            label={t('button.Edit')}
            onClick={onEdit}
            data-testid="edit-default-mount-permission"
          />
        )}
      </HStack>
      <BAIMetadataList columns={2} bordered size="small">
        <BAIMetadataListItem label={t('data.folders.Name')}>
          {folderName}
        </BAIMetadataListItem>
        <BAIMetadataListItem
          label={
            <HStack gap={1} align="center">
              {t('data.folders.DefaultMountPermission')}
              <BAIQuestionIconWithTooltip
                title={t('data.folders.SharedMountPermissionDesc')}
              />
            </HStack>
          }
        >
          <BAIText data-testid="default-mount-permission">
            {mountLevelLabel(defaultMountLevel)}
          </BAIText>
        </BAIMetadataListItem>
      </BAIMetadataList>
    </VStack>
  );
};

const SharedUserTable: React.FC<{
  vfolderId: string;
  defaultMountLevel: MountLevel;
  fetchKey: string;
  updateFetchKey: () => void;
}> = ({ vfolderId, defaultMountLevel, fetchKey, updateFetchKey }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const { options: mountLevelOptions, labelOf: mountLevelLabel } =
    useMountLevelLabels();

  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = deferredFetchKey !== fetchKey;

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
                status
                permissions
                # The person the offer goes to, when the caller may read them;
                # an address resolves to the user holding it.
                recipientEntity @catch(to: NULL) {
                  ... on UserV2 {
                    entityId
                    basicInfo {
                      email
                    }
                  }
                }
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

  const policyByUserId = _.keyBy(vfolderMountPolicies?.items, 'userId');
  const rows = toShareRows(
    _.map(entityShares?.edges, 'node'),
    vfolderMountPolicies?.items,
    defaultMountLevel,
    t('data.invitation.UnknownUser'),
  );

  const setMountPolicy =
    useMutationWithPromise<InviteFolderSettingModalSetMountPolicyMutation>(
      SetMountPolicyMutation,
    );
  const createShare =
    useMutationWithPromise<InviteFolderSettingModalCreateShareMutation>(
      CreateShareMutation,
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

  // The manager has no update mutation for a share: offering again to the
  // same recipient restates what the standing share lends, accepted or not.
  const handleChangeSharePermission = async (
    row: ShareRow,
    bits: Array<BAIEntitySharePermissionBit>,
  ) => {
    try {
      await createShare({
        input: {
          targetEntityType: VFOLDER_ENTITY_TYPE,
          targetEntityId: vfolderId,
          recipient: row.recipient,
          permissions: bits,
        },
      });
      message.success(t('data.permission.PermissionModified'));
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
              <BAIBadge color="success" text={t('data.invitation.Accepted')} />
            ) : (
              <BAIBadge color="warning" text={t('data.invitation.Pending')} />
            ),
        },
        {
          title: t('data.folders.SharePermission'),
          dataIndex: 'permissions',
          render: (permissions: ShareRow['permissions'], row) => (
            <BAIEntitySharePermissionSelector
              label={t('data.folders.SharePermission')}
              isLabelHidden
              width={150}
              value={normalizeEntitySharePermissionBits(permissions)}
              onChange={(bits) => handleChangeSharePermission(row, bits)}
              data-testid="share-permission-cap"
            />
          ),
        },
        {
          title: t('data.folders.MountPermission'),
          dataIndex: 'mountLevel',
          // A mount policy row is keyed by user id, so a share sent to an
          // account is editable before it is accepted; an e-mail invite gets
          // its user id on acceptance.
          render: (level: ShareRow['mountLevel'], row) =>
            row.userId ? (
              <BAISelector
                aria-label={t('data.folders.MountPermission')}
                placement="below"
                width={130}
                options={mountLevelOptions}
                value={level}
                onChange={(next) =>
                  handleChangeMountLevel(row, next as MountLevel)
                }
              />
            ) : row.status === 'PENDING' ? (
              mountLevelLabel(level)
            ) : (
              '-'
            ),
        },
      ]}
    />
  );
};

export default InviteFolderSettingModal;
