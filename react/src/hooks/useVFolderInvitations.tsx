import { backendaiClientPromise, useSuspendedBackendaiClient } from '.';
import { mutationOptions } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';

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

  const mutationToAcceptInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return baiClient.vfolder.accept_invitation(values.inv_id);
    },
    onSuccess: () => {
      updateInvitations();
    },
  });

  const mutationToRejectInvitation = useTanMutation({
    mutationFn: (values: { inv_id: string }) => {
      return baiClient.vfolder.delete_invitation(values.inv_id);
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
