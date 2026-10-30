/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { backendaiClientPromise, useSuspendedBackendaiClient } from '.';
import { useVFolderInvitationsAcceptMutation } from '../__generated__/useVFolderInvitationsAcceptMutation.graphql';
import { useVFolderInvitationsRejectMutation } from '../__generated__/useVFolderInvitationsRejectMutation.graphql';
import { mutationOptions } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useMutationWithPromise } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import { graphql } from 'react-relay';

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
  perm: string;
}

// TODO(needs-backend): the list stays on the legacy REST call because
// `myEntityShares` carries neither the folder name nor the sharer's e-mail;
// switch it over once EntityShare exposes them. An invitation `id` is the
// share's `entityId`, which the accept/reject mutations below already take.
const vFolderInvitationsAtom = atomWithDefault<
  InvitationItem[] | Promise<InvitationItem[]>
>(async () => {
  // backendaiClientPromise is a promise instance;
  const backendaiClient = await backendaiClientPromise;

  const data = await backendaiClient.vfolder.invitations();
  return data.invitations as InvitationItem[];
});

export const useVFolderInvitations = () => {
  'use memo';
  const [vFolderInvitations, setInvitations] = useAtom(vFolderInvitationsAtom);
  const baiClient = useSuspendedBackendaiClient();

  const updateInvitations = async () => {
    const data = await baiClient.vfolder.invitations();
    setInvitations(data.invitations as InvitationItem[]);
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
