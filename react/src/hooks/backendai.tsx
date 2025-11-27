import { useSuspendedBackendaiClient } from '.';
import { maskString } from '../helper';
import {
  useSuspenseTanQuery,
  useTanMutation,
  useTanQuery,
} from './reactQueryAlias';
import {
  ResourceSlotDetail,
  useUpdatableState,
  useViewer,
} from 'backend.ai-ui';
import _ from 'lodash';
import { useEffect, useState } from 'react';

export const baseResourceSlotNames = ['cpu', 'mem'] as const;
export type BaseResourceSlotName = (typeof baseResourceSlotNames)[number];
export const knownAcceleratorResourceSlotNames = [
  'cuda.device',
  'cuda.shares',
  'rocm.device',
  'tpu.device',
  'ipu.device',
  'atom.device',
  'atom-plus.device',
  'atom-max.device',
  'gaudi2.device',
  'warboy.device',
  'rngd.device',
  'hyperaccel-lpu.device',
] as const;
export type KnownAcceleratorResourceSlotName =
  (typeof knownAcceleratorResourceSlotNames)[number];

export type ResourceSlotName =
  | BaseResourceSlotName
  | KnownAcceleratorResourceSlotName;
export interface QuotaScope {
  id: string;
  quota_scope_id: string;
  storage_host_name: string;
  details: {
    hard_limit_bytes: number | null;
    usage_bytes: number | null;
    usage_count: number | null;
  };
}

export const useResourceSlots = () => {
  const [key, checkUpdate] = useUpdatableState('first');
  const baiClient = useSuspendedBackendaiClient();
  const { data: resourceSlots } = useSuspenseTanQuery<{
    [key in ResourceSlotName]?: string;
  }>({
    queryKey: ['useResourceSlots', key],
    queryFn: () => {
      return baiClient.get_resource_slots();
    },
    staleTime: 0,
  });
  return [
    resourceSlots,
    {
      refresh: () => checkUpdate(),
    },
  ] as const;
};

export const useDeviceMetaData = (key = 'first') => {
  return useTanQuery<{ [key: string]: ResourceSlotDetail | undefined }>({
    queryKey: ['backendai-metadata-device', key],
    queryFn: () => {
      return fetch('resources/device_metadata.json')
        .then((response) => response.json())
        .then((result) => result?.deviceInfo);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });
};

interface UserInfo {
  full_name: string;
  email: string;
  uuid: string;
}

export type mutationOptions<T> = {
  onSuccess?: (value: T) => void;
  onError?: (error: any) => void;
};

export const useCurrentUserInfo = () => {
  const baiClient = useSuspendedBackendaiClient();

  const [userInfo, _setUserInfo] = useState<UserInfo>({
    full_name: baiClient.full_name,
    email: baiClient.email,
    uuid: baiClient.user_uuid,
  });

  const getUsername = () => {
    let name: string =
      _.trim(userInfo.full_name).length > 0
        ? userInfo.full_name
        : userInfo.email;
    // mask username only when the configuration is enabled
    if (baiClient._config.maskUserInfo) {
      const maskStartIdx = 2;
      const emailPattern =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      const isEmail: boolean = emailPattern.test(name);
      const maskLength = isEmail
        ? name.split('@')[0].length - maskStartIdx
        : name.length - maskStartIdx;
      name = maskString(name, '*', maskStartIdx, maskLength);
    }
    return name;
  };

  useEffect(() => {
    const handler = (e: any) => {
      const input = e.detail;
      _setUserInfo((v) => ({
        ...v,
        full_name: input,
      }));
    };
    document.addEventListener('current-user-info-changed', handler);
    return () => {
      document.removeEventListener('current-user-info-changed', handler);
    };
  }, [baiClient]);

  const mutationToUpdateUserFullName = useTanMutation({
    mutationFn: (values: { email: string; full_name: string }) => {
      return baiClient.update_full_name(values.email, values.full_name);
    },
  });
  const mutationToUpdateUserPassword = useTanMutation({
    mutationFn: (values: {
      old_password: string;
      new_password: string;
      new_password2: string;
    }) => {
      return baiClient.update_password(
        values.old_password,
        values.new_password,
        values.new_password2,
      );
    },
  });

  return [
    {
      ...userInfo,
      username: getUsername(),
      isPendingMutation:
        mutationToUpdateUserFullName.isPending ||
        mutationToUpdateUserPassword.isPending,
    },
    {
      updateFullName: (
        newFullName: string,
        options?: mutationOptions<string>,
      ) => {
        mutationToUpdateUserFullName.mutate(
          {
            full_name: newFullName,
            email: baiClient.email,
          },
          {
            onSuccess: () => {
              options?.onSuccess && options.onSuccess(newFullName);
              document.dispatchEvent(
                new CustomEvent('current-user-info-changed', {
                  detail: newFullName,
                }),
              );
              _setUserInfo((v) => ({
                ...v,
                full_name: newFullName,
              }));
            },
            onError: (error: any) => {
              options?.onError && options.onError(error);
            },
          },
        );
      },
      updatePassword: (
        params: {
          old_password: string;
          new_password: string;
          new_password2: string;
        },
        options?: mutationOptions<undefined>,
      ) => {
        mutationToUpdateUserPassword.mutate(params, {
          onSuccess: () => {
            options?.onSuccess && options.onSuccess(undefined);
          },
          onError: (error: any) => {
            options?.onError && options.onError(error);
          },
        });
      },
    },
  ] as const;
};

type UserRole = 'superadmin' | 'admin' | 'user' | 'monitor';

export const useCurrentUserRole = () => {
  const [userInfo] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();

  const { decodedUserRole } = useViewer();

  const { data: roleData } = useTanQuery<{
    user: {
      role: UserRole;
    };
  }>({
    queryKey: ['getUserRole', userInfo.email],
    queryFn: () => {
      return baiClient.user.get(userInfo.email, ['role']);
    },
    staleTime: Infinity,
    enabled: decodedUserRole === null,
  });

  return (decodedUserRole ?? roleData?.user.role) as UserRole;
};

export const useTOTPSupported = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { data: isManagerSupportingTOTP, isLoading } = useTanQuery<boolean>({
    queryKey: ['isManagerSupportingTOTP'],
    queryFn: () => {
      return baiClient.isManagerSupportingTOTP();
    },
    staleTime: 1000,
  });

  return { isTOTPSupported: isManagerSupportingTOTP, isLoading };
};

export interface InvitationItem {
  id: string;
  vfolder_id: string;
  vfolder_name: string;
  invitee_user_email: string;
  inviter_user_email: string;
  mount_permission: string;
  created_at: string;
  modified_at: string | null;
  status: string;
  perm: string;
}
