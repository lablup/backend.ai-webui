/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Share modal on the 26.9 model: an invite is an entity share, the invitee's
 mount level is a vfolder mount policy. The invite itself still goes through
 the legacy `/folders/{id}/invite` endpoint, which writes both rows — see the
 TODO(needs-backend) on `handleInvite`.
*/
import { InviteFolderSettingModalV2CancelShareMutation } from '../__generated__/InviteFolderSettingModalV2CancelShareMutation.graphql';
import { InviteFolderSettingModalV2Fragment$key } from '../__generated__/InviteFolderSettingModalV2Fragment.graphql';
import { InviteFolderSettingModalV2Query } from '../__generated__/InviteFolderSettingModalV2Query.graphql';
import { InviteFolderSettingModalV2RevokeShareMutation } from '../__generated__/InviteFolderSettingModalV2RevokeShareMutation.graphql';
import { InviteFolderSettingModalV2SetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalV2SetMountPolicyMutation.graphql';
import { InviteFolderSettingModalV2UnsetMountPolicyMutation } from '../__generated__/InviteFolderSettingModalV2UnsetMountPolicyMutation.graphql';
import { InviteFolderSettingModalV2UserSearchQuery } from '../__generated__/InviteFolderSettingModalV2UserSearchQuery.graphql';
import { App } from '../app-shim';
import { localeCompare, useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentUserInfo } from '../hooks/backendai';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import { Banner } from '@lablup/ui-common/Banner';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Selector } from '@lablup/ui-common/Selector';
import { HStack, VStack } from '@lablup/ui-common/Stack';
import { Heading } from '@lablup/ui-common/Text';
import {
  Typeahead,
  TypeaheadItem,
  type SearchSource,
  type SearchableItem,
} from '@lablup/ui-common/Typeahead';
import {
  BAIBadge,
  BAIButton,
  BAIModal,
  type BAIModalProps,
  BAIPopconfirm,
  BAIQuestionIconWithTooltip,
  BAISkeleton,
  BAITable,
  INITIAL_FETCH_KEY,
  filterOutNullAndUndefined,
  toLocalId,
  useErrorMessageResolver,
  useFetchKey,
  useMutationWithPromise,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { CircleXIcon, MailXIcon } from 'lucide-react';
import React, { Suspense, useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchQuery,
  graphql,
  useFragment,
  useLazyLoadQuery,
  useRelayEnvironment,
} from 'react-relay';

/**
 * First manager tag carrying entity shares (lablup/backend.ai#14275) and
 * vfolder mount policies (lablup/backend.ai#14679).
 */
export const ENTITY_SHARE_MANAGER_VERSION = '26.9.0a1';

const VFOLDER_ENTITY_TYPE = 'vfolder';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ITEM_PREFIX = 'email:';

type MountLevel = 'ro' | 'rw';

type RecipientData =
  | { kind: 'user'; userId: string; email: string; name?: string | null }
  | { kind: 'email'; email: string };
type RecipientItem = SearchableItem<RecipientData>;

interface SharedUser {
  perm: string;
  shared_to: { uuid: string; email: string };
}

interface ShareRow {
  shareId: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED';
  userId: string | null;
  mountLevel: MountLevel | null;
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

const resolveErrorMessage = (error: unknown, fallback: string) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : _.get(_.castArray(error)[0], 'message');
  return errorMessage || fallback;
};

const UserSearchQuery = graphql`
  query InviteFolderSettingModalV2UserSearchQuery(
    $scope: UserScope!
    $filter: UserV2Filter
    $limit: Int!
  ) {
    scopedUsersV2(scope: $scope, filter: $filter, limit: $limit) {
      edges {
        node {
          id
          basicInfo {
            email
            username
            fullName
          }
        }
      }
    }
  }
`;

interface InviteFolderSettingModalV2Props extends Omit<
  BAIModalProps,
  'isOpen' | 'onOpenChange'
> {
  open?: boolean;
  vfolderFrgmt: InviteFolderSettingModalV2Fragment$key | null;
  onRequestClose: () => void;
}

const InviteFolderSettingModalV2: React.FC<InviteFolderSettingModalV2Props> = ({
  vfolderFrgmt,
  onRequestClose,
  ...baiModalProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const vfolder = useFragment(
    graphql`
      fragment InviteFolderSettingModalV2Fragment on VFolder {
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
      width={640}
    >
      <Suspense fallback={<BAISkeleton />}>
        {baiModalProps.open && vfolder ? (
          <InviteFolderSettingModalV2Body
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

const InviteFolderSettingModalV2Body: React.FC<{
  vfolderId: string;
  defaultMountLevel: MountLevel;
}> = ({ vfolderId, defaultMountLevel }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const relayEnv = useRelayEnvironment();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { getErrorMessage } = useErrorMessageResolver();
  const [currentUser] = useCurrentUserInfo();
  const { accessibleProjects } = useAccessibleProjects();
  const memberProjectIds = _.compact(_.map(accessibleProjects, 'id'));

  const [fetchKey, updateFetchKey] = useFetchKey();
  const deferredFetchKey = useDeferredValue(fetchKey);
  const isRefetching = deferredFetchKey !== fetchKey;

  const [recipient, setRecipient] = useState<RecipientItem | null>(null);
  const [recipientQuery, setRecipientQuery] = useState('');
  const [mountLevel, setMountLevel] = useState<MountLevel>(defaultMountLevel);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const mountLevelOptions = [
    { label: t('data.ReadOnly'), value: 'ro' },
    { label: t('data.ReadWrite'), value: 'rw' },
  ];
  const mountLevelLabel = (level: MountLevel) =>
    level === 'ro' ? t('data.ReadOnly') : t('data.ReadWrite');

  const { entityShares, vfolderMountPolicies } =
    useLazyLoadQuery<InviteFolderSettingModalV2Query>(
      graphql`
        query InviteFolderSettingModalV2Query(
          $vfolderId: UUID!
          $scope: EntityShareScope!
        ) {
          entityShares(scope: $scope, limit: 100) {
            edges {
              node {
                id
                entityId
                recipientEmail
                status
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

  // `entityShares` carries the recipient's e-mail but not their user id, and
  // `vfolderMountPolicies` the reverse. The legacy shared list still joins the
  // two for everyone who accepted, whatever project they are in.
  const { data: sharedUsers } = useTanQuery<Array<SharedUser>>({
    queryKey: ['baiClient.vfolder.list_invitees', vfolderId, deferredFetchKey],
    queryFn: () =>
      baiRequestWithPromise<{ shared: Array<SharedUser> }>({
        method: 'GET',
        url: `/folders/_/shared?${new URLSearchParams({ vfolder_id: vfolderId }).toString()}`,
      }).then((res) => res.shared ?? []),
    staleTime: 0,
  });

  const sharedUserByEmail = _.keyBy(sharedUsers, (user) =>
    user.shared_to.email.toLowerCase(),
  );
  const policyByUserId = _.keyBy(vfolderMountPolicies?.items, 'userId');

  const rows: Array<ShareRow> = _.sortBy(
    filterOutNullAndUndefined(
      _.map(entityShares?.edges, (edge) => {
        const share = edge.node;
        if (
          !share.recipientEmail ||
          (share.status !== 'PENDING' && share.status !== 'ACCEPTED')
        ) {
          return null;
        }
        const sharedUser =
          sharedUserByEmail[share.recipientEmail.toLowerCase()];
        const userId = sharedUser?.shared_to.uuid ?? null;
        return {
          shareId: share.entityId,
          email: share.recipientEmail,
          status: share.status,
          userId,
          mountLevel:
            toMountLevel(userId ? policyByUserId[userId]?.permission : null) ??
            toMountLevel(sharedUser?.perm),
        };
      }),
    ),
    [(row) => (row.status === 'ACCEPTED' ? 0 : 1), (row) => row.email],
  );

  const setMountPolicy =
    useMutationWithPromise<InviteFolderSettingModalV2SetMountPolicyMutation>(
      graphql`
        mutation InviteFolderSettingModalV2SetMountPolicyMutation(
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
    useMutationWithPromise<InviteFolderSettingModalV2UnsetMountPolicyMutation>(
      graphql`
        mutation InviteFolderSettingModalV2UnsetMountPolicyMutation(
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
    useMutationWithPromise<InviteFolderSettingModalV2RevokeShareMutation>(
      graphql`
        mutation InviteFolderSettingModalV2RevokeShareMutation($id: UUID!) {
          revokeEntityShare(id: $id) {
            share {
              id
              status
            }
          }
        }
      `,
    );
  const cancelShare =
    useMutationWithPromise<InviteFolderSettingModalV2CancelShareMutation>(
      graphql`
        mutation InviteFolderSettingModalV2CancelShareMutation($id: UUID!) {
          cancelEntityShare(id: $id) {
            share {
              id
              status
            }
          }
        }
      `,
    );

  const searchSource: SearchSource<RecipientItem> = {
    bootstrap: () => [],
    search: async (query) => {
      const trimmed = query.trim();
      if (!trimmed) return [];
      let items: Array<RecipientItem> = [];
      if (memberProjectIds.length > 0) {
        const data =
          await fetchQuery<InviteFolderSettingModalV2UserSearchQuery>(
            relayEnv,
            UserSearchQuery,
            {
              scope: {
                project: memberProjectIds.map((value) => ({ value })),
              },
              filter: { email: { contains: trimmed } },
              limit: 10,
            },
          ).toPromise();
        items = filterOutNullAndUndefined(
          _.map(data?.scopedUsersV2?.edges, (edge) => {
            const user = edge.node;
            const email = user.basicInfo.email;
            if (email.toLowerCase() === currentUser?.email?.toLowerCase()) {
              return null;
            }
            const userId = toLocalId(user.id);
            return {
              id: userId,
              label: email,
              auxiliaryData: {
                kind: 'user' as const,
                userId,
                email,
                name: user.basicInfo.fullName || user.basicInfo.username,
              },
            };
          }),
        );
      }
      const hasExactMatch = items.some(
        (item) => item.label.toLowerCase() === trimmed.toLowerCase(),
      );
      if (EMAIL_PATTERN.test(trimmed) && !hasExactMatch) {
        items.push({
          id: `${EMAIL_ITEM_PREFIX}${trimmed}`,
          label: trimmed,
          auxiliaryData: { kind: 'email', email: trimmed },
        });
      }
      return items;
    },
  };

  // A typed address that was never picked from the list is still an e-mail
  // invite, so the form keeps working for someone who types and presses Add.
  const typedEmail = EMAIL_PATTERN.test(recipientQuery.trim())
    ? recipientQuery.trim()
    : null;
  const inviteTarget: RecipientData | null =
    recipient?.auxiliaryData ??
    (typedEmail ? { kind: 'email', email: typedEmail } : null);
  const isEmailInvite = inviteTarget?.kind === 'email';

  const handleInvite = async () => {
    if (!inviteTarget) {
      setRecipientError(t('data.InvalidEmail'));
      return;
    }
    setRecipientError(null);
    try {
      // TODO(needs-backend): `createEntityShare` is rejected by the gateway
      // ("OneOf Input Object 'EntityShareRecipientInput' must specify exactly
      // one key", 26.9.0rc1 and 26.9.1), so the invite goes through the
      // legacy endpoint, which writes the share and, with `perm`, the policy
      // row. An e-mail invite sends the folder's shared mount permission as
      // `perm`: omitted, the server defaults it to `rw` for an existing account.
      // Tracked on lablup/backend.ai-webui#10295.
      const result = await baiRequestWithPromise<{
        invited_ids?: Array<string>;
      }>({
        method: 'POST',
        url: `/folders/${vfolderId}/invite`,
        body: {
          user_ids: [inviteTarget.email],
          perm: inviteTarget.kind === 'user' ? mountLevel : defaultMountLevel,
        },
      });
      if (_.isEmpty(result?.invited_ids)) {
        message.error(t('data.invitation.NoOneWasInvited'));
        return;
      }
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
      setRecipientQuery('');
      updateFetchKey();
    } catch (error: any) {
      if (error?.statusCode === 409) {
        message.error(
          t('data.invitation.UserIsAlreadyInvited', {
            email: inviteTarget.email,
          }),
        );
        return;
      }
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

  return (
    <VStack gap={6} align="stretch">
      <VStack gap={3} align="stretch">
        <Heading level={5}>{t('data.folders.InviteUsers')}</Heading>
        <HStack align="start" gap={2} width="100%">
          <Typeahead<RecipientItem>
            label={t('data.folders.UserOrEmail')}
            isLabelHidden
            placeholder={t('data.folders.SearchUserOrEnterEmail')}
            searchSource={searchSource}
            value={recipient}
            onChange={(item) => {
              setRecipient(item);
              setRecipientError(null);
            }}
            onChangeQuery={(query) => {
              setRecipientQuery(query);
              setRecipientError(null);
            }}
            renderItem={(item) => (
              <TypeaheadItem
                item={item}
                description={
                  item.auxiliaryData?.kind === 'email'
                    ? t('data.folders.InviteByEmail')
                    : (item.auxiliaryData?.name ?? undefined)
                }
              />
            )}
            status={
              recipientError
                ? { type: 'error', message: recipientError }
                : undefined
            }
            debounceMs={300}
            width="100%"
          />
          <Selector
            label={t('data.folders.MountPermission')}
            isLabelHidden
            placement="below"
            width={150}
            options={mountLevelOptions}
            value={mountLevel}
            onChange={(next) => setMountLevel(next as MountLevel)}
            isDisabled={isEmailInvite}
          />
          <BAIButton type="primary" action={handleInvite}>
            {t('general.Add')}
          </BAIButton>
        </HStack>
        {isEmailInvite && (
          <Banner
            status="info"
            title={t('data.folders.EmailInviteUsesSharedMountPermission', {
              permission: mountLevelLabel(defaultMountLevel),
            })}
          />
        )}
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
                ) : (
                  '-'
                ),
            },
            {
              title: t('general.Control'),
              key: 'control',
              render: (__, row) =>
                row.status === 'ACCEPTED' ? (
                  <BAIPopconfirm
                    title={t('data.folders.KickOutConfirm', {
                      email: row.email,
                    })}
                    okText={t('button.Confirm')}
                    isDanger
                    onConfirm={() => handleStopSharing(row)}
                  >
                    <IconButton
                      label={t('data.folders.KickOut')}
                      tooltip={t('data.folders.KickOut')}
                      variant="ghost"
                      size="sm"
                      className="bai-name-action-cell-danger"
                      icon={<CircleXIcon />}
                    />
                  </BAIPopconfirm>
                ) : (
                  <BAIPopconfirm
                    title={t('data.folders.CancelInvitationConfirm', {
                      email: row.email,
                    })}
                    okText={t('button.Confirm')}
                    isDanger
                    onConfirm={() => handleCancelInvitation(row)}
                  >
                    <IconButton
                      label={t('data.folders.CancelInvitation')}
                      tooltip={t('data.folders.CancelInvitation')}
                      variant="ghost"
                      size="sm"
                      className="bai-name-action-cell-danger"
                      icon={<MailXIcon />}
                    />
                  </BAIPopconfirm>
                ),
            },
          ]}
        />
      </VStack>
    </VStack>
  );
};

export default InviteFolderSettingModalV2;
