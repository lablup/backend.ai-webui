/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../../app-shim';
import {
  baiSignedRequestWithPromise,
  useBaiSignedRequestWithPromise,
} from '../../helper';
import { useSuspendedBackendaiClient } from '../../hooks';
import {
  useSuspenseTanQuery,
  useTanMutation,
} from '../../hooks/reactQueryAlias';
import { Badge } from '@astryxdesign/core/Badge';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Heading } from '@astryxdesign/core/Heading';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  BAICard,
  BAIFlex,
  BAIMetadataList,
  badgeVariantForStatus,
  useErrorMessageResolver,
} from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

const SummaryItemInvitation: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();

  const baiClient = useSuspendedBackendaiClient();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const {
    data: { invitations },
    refetch,
  } = useSuspenseTanQuery({
    queryKey: ['baiClient.invitation.list'],
    queryFn: () =>
      baiRequestWithPromise({
        method: 'GET',
        url: '/folders/invitations/list',
      }),
  });

  const terminateInvitationsMutation = useTanMutation({
    mutationFn: (inv_id: string) => {
      return baiSignedRequestWithPromise({
        method: 'DELETE',
        url: '/folders/invitations/delete',
        body: {
          inv_id: inv_id,
        },
        client: baiClient,
      });
    },
  });

  const acceptInvitationsMutation = useTanMutation({
    mutationFn: (inv_id: string) => {
      return baiSignedRequestWithPromise({
        method: 'POST',
        url: '/folders/invitations/accept',
        body: {
          inv_id: inv_id,
        },
        client: baiClient,
      });
    },
  });

  const permissionIndicator = (permission: any) => {
    const indicator = [...permission].map((p: any) => {
      const text = ['read', 'write', 'delete', 'only'][
        ['r', 'w', 'd', 'o'].indexOf(p)
      ];

      // The local r/w/d/o -> colour array is gone: ticket 13's global lookup
      // already carries this exact map as the `vfolderPermission` domain.
      return (
        <Badge
          key={p}
          variant={badgeVariantForStatus('vfolderPermission', p)}
          label={text}
        />
      );
    });

    return <BAIFlex gap="xs">{indicator}</BAIFlex>;
  };

  return (
    <BAIFlex
      direction="column"
      justify="center"
      align="center"
      //FIXME: This can modify dynamically by the layout
      style={{ width: '100%' }}
      gap="sm"
    >
      {invitations.length > 0 ? (
        <>
          {invitations.map((invitation: any) => (
            <BAICard key={invitation.id} showDivider style={{ width: '100%' }}>
              {/* antd `Descriptions` -> `MetadataList` (MAPPING §4). The
                  per-item `padding: 0` override is dropped — MetadataList owns
                  its row rhythm. `Descriptions.title` has no MetadataList
                  counterpart in this layout, so the inviter line becomes an
                  explicit Heading above the list. */}
              <Heading level={6}>
                {`From: ${invitation.inviter_user_email || invitation.inviter || '-'}`}
              </Heading>
              <BAIMetadataList columns="single">
                <MetadataListItem label={t('summary.FolderName')}>
                  {invitation.vfolder_name}
                </MetadataListItem>
                <MetadataListItem label={t('summary.Permission')}>
                  {permissionIndicator(invitation.perm)}
                </MetadataListItem>
              </BAIMetadataList>
              <BAIFlex gap="xs" justify="end">
                {/* MAPPING §3.3: a `default` button whose only child was a
                    `type="danger"` Text is a `destructive` Button — the
                    label/colour pair collapses into one variant instead of
                    tinting text inside a neutral button. */}
                <Button
                  variant="destructive"
                  label={t('summary.Decline')}
                  onClick={() =>
                    terminateInvitationsMutation.mutate(invitation.id, {
                      onSuccess() {
                        refetch();
                        message.success(
                          t('summary.DeclineSharedVFolder') +
                            invitation.vfolder_name,
                        );
                      },
                      onError(error) {
                        message.error(getErrorMessage(error));
                      },
                    })
                  }
                />
                {/* The `colorPrimary` label tint was antd's way of marking
                    this as the affirmative action; on Astryx that IS
                    `variant="primary"` (P5 — no colour escape hatch, and none
                    is needed). */}
                <Button
                  variant="primary"
                  label={t('summary.Accept')}
                  onClick={() =>
                    acceptInvitationsMutation.mutate(invitation.id, {
                      onSuccess() {
                        refetch();
                        message.success(
                          t('summary.AcceptSharedVFolder') +
                            invitation.vfolder_name,
                        );
                      },
                      onError(error) {
                        message.error(
                          getErrorMessage(error) || t('dialog.ErrorOccurred'),
                        );
                      },
                    })
                  }
                />
              </BAIFlex>
            </BAICard>
          ))}
        </>
      ) : (
        // antd `Empty` -> `EmptyState`: `description` becomes the required
        // `title`; `PRESENTED_IMAGE_SIMPLE` has no counterpart and is dropped.
        <EmptyState title={t('summary.NoInvitations')} />
      )}
    </BAIFlex>
  );
};

export default SummaryItemInvitation;
