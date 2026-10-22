/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise, useSuspendedBackendaiClient } from '.';
import { RelayEnvironment } from '../RelayEnvironment';
import { useVFolderInvitationsAcceptMutation } from '../__generated__/useVFolderInvitationsAcceptMutation.graphql';
import { useVFolderInvitationsRejectMutation } from '../__generated__/useVFolderInvitationsRejectMutation.graphql';
import { useVFolderInvitationsSharesQuery } from '../__generated__/useVFolderInvitationsSharesQuery.graphql';
import { mutationOptions } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useMutationWithPromise } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import * as _ from 'lodash-es';
import { fetchQuery, graphql } from 'react-relay';

export interface InvitationItem {
  id: string;
  vfolder_id: string;
  vfolder_name: string;
  invitee_user_email?: string;
  inviter_user_email?: string;
  invitee?: string;
  inviter?: string;
  mount_permission: string;
  created_at: string;
  modified_at: string | null;
  status: string;
  /** The mount permission the invite was sent with (`ro` / `rw`). */
  perm: string;
  /** The entity share's permission cap; missing when no share matches. */
  permissions?: ReadonlyArray<string>;
}

interface RecipientShare {
  entityId: string;
  permissions: ReadonlyArray<string>;
}

/** Attaches each invitation's share cap, matched by the shared `id`. */
export const mergeSharePermissions = (
  invitations: ReadonlyArray<InvitationItem>,
  shares: ReadonlyArray<RecipientShare>,
): InvitationItem[] => {
  const permissionsById = _.fromPairs(
    _.map(shares, (share) => [share.entityId, share.permissions]),
  );
  return _.map(invitations, (invitation) => {
    const { permissions: _ignored, ...rest } = invitation;
    const permissions = permissionsById[invitation.id];
    return permissions ? { ...rest, permissions } : rest;
  });
};

// TODO(needs-backend): the list stays on the legacy REST call because
// `myEntityShares` carries neither the folder name nor the sharer's e-mail;
// switch it over once EntityShare exposes them. An invitation `id` is the
// share's `entityId`, which is how its permission cap is joined below and
// what the accept/reject mutations take.
const sharesQuery = graphql`
  query useVFolderInvitationsSharesQuery {
    myEntityShares(sides: [RECIPIENT], limit: 100) {
      edges {
        node {
          entityId
          permissions
        }
      }
    }
  }
`;

const loadInvitations = async (
  backendaiClient: Awaited<typeof backendaiClientPromise>,
): Promise<InvitationItem[]> => {
  const [data, shares] = await Promise.all([
    backendaiClient.vfolder.invitations(),
    fetchQuery<useVFolderInvitationsSharesQuery>(
      RelayEnvironment,
      sharesQuery,
      {},
      { fetchPolicy: 'network-only' },
    ).toPromise(),
  ]);
  return mergeSharePermissions(
    data.invitations as InvitationItem[],
    _.map(shares?.myEntityShares?.edges, (edge) => edge.node),
  );
};

const vFolderInvitationsAtom = atomWithDefault<
  InvitationItem[] | Promise<InvitationItem[]>
>(async () => {
  // backendaiClientPromise is a promise instance;
  const backendaiClient = await backendaiClientPromise;
  return loadInvitations(backendaiClient);
});

export const useVFolderInvitations = () => {
  'use memo';
  const [vFolderInvitations, setInvitations] = useAtom(vFolderInvitationsAtom);
  const baiClient = useSuspendedBackendaiClient();

  const updateInvitations = async () => {
    setInvitations(await loadInvitations(baiClient));
  };

  const acceptShare =
    useMutationWithPromise<useVFolderInvitationsAcceptMutation>(graphql`
      mutation useVFolderInvitationsAcceptMutation($id: UUID!) {
        acceptEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);
  const rejectShare =
    useMutationWithPromise<useVFolderInvitationsRejectMutation>(graphql`
      mutation useVFolderInvitationsRejectMutation($id: UUID!) {
        rejectEntityShare(id: $id) {
          share {
            id
            status
          }
        }
      }
    `);

  const mutationToAcceptInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return acceptShare({ id: values.inv_id });
    },
    onSuccess: () => {
      updateInvitations();
    },
  });

  const mutationToRejectInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return rejectShare({ id: values.inv_id });
    },
    onSuccess: () => {
      updateInvitations();
    },
  });

  return [
    vFolderInvitations,
    {
      updateInvitations,
      acceptInvitation: (inv_id: string, options?: mutationOptions<string>) => {
        return mutationToAcceptInvitation.mutateAsync(
          { inv_id },
          {
            onSuccess: () => {
              options?.onSuccess?.(inv_id);
            },
            onError: (error: any) => {
              options?.onError?.(error);
            },
          },
        );
      },
      isPendingAcceptInvitation: mutationToAcceptInvitation.isPending,
      rejectInvitation: (inv_id: string, options?: mutationOptions<string>) => {
        return mutationToRejectInvitation.mutateAsync(
          { inv_id },
          {
            onSuccess: () => {
              options?.onSuccess?.(inv_id);
            },
            onError: (error: any) => {
              options?.onError?.(error);
            },
          },
        );
      },
      isPendingRejectInvitation: mutationToRejectInvitation.isPending,
    },
  ] as const;
};
