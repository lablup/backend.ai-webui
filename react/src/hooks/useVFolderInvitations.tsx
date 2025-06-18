import { useSuspendedBackendaiClient } from '.';
import { mutationOptions } from './backendai';
import { useTanMutation } from './reactQueryAlias';
import { useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import { useCallback, useEffect } from 'react';

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

const vFolderInvitationsAtom = atomWithDefault(async () => {
  return {
    invitations: [] as InvitationItem[],
    count: 0,
  };
});

export const useVFolderInvitationsValue = () => {
  const { updateInvitations } = useSetVFolderInvitations();
  useEffect(() => {
    updateInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return useAtomValue(vFolderInvitationsAtom);
};

export const useSetVFolderInvitations = () => {
  const setInvitations = useSetAtom(vFolderInvitationsAtom);
  const baiClient = useSuspendedBackendaiClient();

  const updateInvitations = useCallback(async () => {
    const data = await baiClient.vfolder.invitations();
    setInvitations((prev) => ({
      ...prev,
      invitations: data.invitations as InvitationItem[],
      count: data.invitations.length ?? 0,
    }));
  }, [baiClient, setInvitations]);

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

  return {
    updateInvitations,
    acceptInvitation: (inv_id: string, options?: mutationOptions<string>) => {
      mutationToAcceptInvitation.mutate(
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
    rejectInvitation: (inv_id: string, options?: mutationOptions<string>) => {
      mutationToRejectInvitation.mutate(
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
  };
};
