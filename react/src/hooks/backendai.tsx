import { useSuspendedBackendaiClient, useUpdatableState } from '.';
import { maskString, useBaiSignedRequestWithPromise } from '../helper';
import {
  useSuspenseTanQuery,
  useTanMutation,
  useTanQuery,
} from './reactQueryAlias';
import _ from 'lodash';
import { useEffect, useState } from 'react';

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
    cpu?: string;
    mem?: string;
    'cuda.shares'?: string;
    'cuda.device'?: string;
    'rocm.device'?: string;
    'tpu.device'?: string;
    'ipu.device'?: string;
    'atom.device'?: string;
    'atom-plus.device'?: string;
    'gaudi2.device'?: string;
    'warboy.device'?: string;
    'hyperaccel-lpu.device'?: string;
    [key: string]: string | undefined;
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

type ResourceSlotDetail = {
  slot_name: string;
  description: string;
  human_readable_name: string;
  display_unit: string;
  number_format: {
    binary: boolean;
    round_length: number;
  };
  display_icon: string;
};

/**
 * Custom hook to fetch resource slot details by resource group name.
 * @param resourceGroupName - The name of the resource group. if not provided, it will use resource/device_metadata.json
 * @returns An array containing the resource slots and a refresh function.
 */
export const useResourceSlotsDetails = (resourceGroupName?: string) => {
  const [key, checkUpdate] = useUpdatableState('first');
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const baiClient = useSuspendedBackendaiClient();
  const { data: resourceSlots } = useTanQuery<{
    [key: string]: ResourceSlotDetail | undefined;
  }>({
    queryKey: ['useResourceSlots', resourceGroupName, key],
    queryFn: () => {
      // return baiClient.get_resource_slots();
      if (
        !resourceGroupName ||
        !baiClient.isManagerVersionCompatibleWith('23.09.0')
      ) {
        return undefined;
      } else {
        // `/resource-slots/details` is available since 23.09
        // https://github.com/lablup/backend.ai/issues/1589
        const search = new URLSearchParams();
        search.set('sgroup', resourceGroupName);
        return baiRequestWithPromise({
          method: 'GET',
          url: `/config/resource-slots/details?${search.toString()}`,
        });
      }
    },
    staleTime: 3000,
  });

  // TODO: improve waterfall loading
  const { data: deviceMetadata } = useTanQuery<{
    [key: string]: ResourceSlotDetail | undefined;
  }>({
    queryKey: ['backendai-metadata-device', key],
    queryFn: () => {
      return fetch('resources/device_metadata.json')
        .then((response) => response.json())
        .then((result) => result?.deviceInfo);
    },
    staleTime: 1000 * 60 * 60 * 24,
  });

  return [
    _.merge(deviceMetadata, resourceSlots),
    {
      refresh: () => checkUpdate(),
    },
  ] as const;
};

interface UserInfo {
  full_name: string;
  email: string;
}

type mutationOptions<T> = {
  onSuccess?: (value: T) => void;
  onError?: (error: any) => void;
};

export const useCurrentUserInfo = () => {
  const baiClient = useSuspendedBackendaiClient();

  const [userInfo, _setUserInfo] = useState<UserInfo>({
    full_name: baiClient.full_name,
    email: baiClient.email,
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
      if (baiClient.supports('change-user-name')) {
        const input = e.detail;
        _setUserInfo((v) => ({
          ...v,
          full_name: input,
        }));
      }
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

export const useCurrentUserRole = () => {
  const [userInfo] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const { data: roleData } = useTanQuery<{
    user: {
      role: 'superadmin' | 'admin' | 'user' | 'monitor';
    };
  }>({
    queryKey: ['getUserRole', userInfo.email],
    queryFn: () => {
      return baiClient.user.get(userInfo.email, ['role']);
    },
    staleTime: Infinity,
  });
  const userRole = roleData?.user.role;

  return userRole;
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
  const isTOTPSupported = baiClient.supports('2FA') && isManagerSupportingTOTP;

  return { isTOTPSupported, isLoading };
};

export const useAllowedHostNames = () => {
  const baiClient = useSuspendedBackendaiClient();
  const { data: allowedHosts } = useSuspenseTanQuery<{
    allowed: Array<string>;
  }>({
    queryKey: ['useAllowedHostNames'],
    queryFn: () => {
      return baiClient.vfolder.list_all_hosts();
    },
  });
  return allowedHosts?.allowed;
};
