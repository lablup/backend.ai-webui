import { useSuspendedBackendaiClient, useUpdatableState } from '.';
import { maskString, useBaiSignedRequestWithPromise } from '../helper';
import { useTanMutation, useTanQuery } from './reactQueryAlias';
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
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const { data: resourceSlots } = useTanQuery({
    queryKey: ['useResourceSlots', key],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/config/resource-slots`,
      }) as Promise<any>;
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
  }, []);

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
        mutationToUpdateUserFullName.isLoading ||
        mutationToUpdateUserPassword.isLoading,
    },
    {
      updateFullName: (
        newFullName: string,
        options?: mutationOptions<string>,
      ) => {
        if (baiClient.full_name !== newFullName) {
          mutationToUpdateUserFullName.mutate(
            {
              full_name: newFullName,
              email: baiClient.email,
            },
            {
              onSuccess: () => {
                options?.onError && options.onError(newFullName);
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
        } else {
          options?.onSuccess && options.onSuccess(newFullName);
        }
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
