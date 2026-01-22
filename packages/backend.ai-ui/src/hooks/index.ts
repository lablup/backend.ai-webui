import {
  ResourceSlotName,
  useBAIDeviceMetaData,
  useConnectedBAIClient,
} from '../components';
import { useSuspenseTanQuery, useTanQuery } from '../helper/reactQueryAlias';
import { useEventNotStable } from './useEventNotStable';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { useRelayEnvironment } from 'react-relay';
import {
  commitMutation,
  GraphQLTaggedNode,
  MutationParameters,
} from 'relay-runtime';

type UseMemoizedJsonParseOptions<T> = {
  fallbackValue: T;
};

/**
 * A custom React hook that memoizes the result of parsing a JSON string.
 *
 * @template T The expected type of the parsed JSON object.
 * @param jsonString - The JSON string to parse. If `undefined` or `null`, the `fallbackValue` is returned.
 * @param options - Optional configuration object.
 * @param options.fallbackValue - The value to return if parsing fails or if `jsonString` is not a string.
 * @returns The parsed JSON object of type `T`, or the `fallbackValue` if parsing fails.
 *
 * @example
 * const data = useMemoizedJSONParse<MyType>(jsonString, { fallbackValue: defaultValue });
 */
export function useMemoizedJSONParse<T = any>(
  jsonString: string | undefined | null,
  options?: UseMemoizedJsonParseOptions<T>,
): T {
  'use memo';
  const { fallbackValue } = options || {};

  return useMemo(() => {
    if (typeof jsonString !== 'string') return fallbackValue;

    try {
      return JSON.parse(jsonString);
    } catch {
      return fallbackValue;
    }
  }, [jsonString, fallbackValue]);
}

export const useDateISOState = (initialValue?: string) => {
  'use memo';
  const [value, setValue] = useState(initialValue || new Date().toISOString());

  const update = useEventNotStable((newValue?: string) => {
    setValue(newValue || new Date().toISOString());
  });
  return [value, update] as const;
};

export const useUpdatableState = (initialValue: string) => {
  return useDateISOState(initialValue);
};

export const INITIAL_FETCH_KEY = 'first';
export const useFetchKey = () => {
  return [...useDateISOState(INITIAL_FETCH_KEY), INITIAL_FETCH_KEY] as const;
};

export const useAllowedHostNames = () => {
  'use memo';
  const baiClient = useConnectedBAIClient();
  const { data } = useSuspenseTanQuery({
    queryKey: ['useAllowedHOstNames'],
    queryFn: () => baiClient.vfolder.list_all_hosts(),
  });
  return data?.allowed;
};

export type ResourceSlotDetail = {
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
  'use memo';
  const [key, checkUpdate] = useUpdatableState('first');
  const baiRequestWithPromise = useBAISignedRequestWithPromise();
  const { data: resourceSlotsInRG, isLoading } = useTanQuery<{
    [key in ResourceSlotName]?: ResourceSlotDetail | undefined;
  }>({
    queryKey: ['useResourceSlots', resourceGroupName, key],
    queryFn: () => {
      const search = new URLSearchParams();
      resourceGroupName && search.set('sgroup', resourceGroupName);
      const searchParamString = search.toString();
      return baiRequestWithPromise({
        method: 'GET',
        // if `sgroup` is not provided, it will return all resource slots of all resource groups
        url: `/config/resource-slots/details${searchParamString ? '?' + search.toString() : ''}`,
      });
    },
    staleTime: 3000,
  });

  const deviceMetaData = useBAIDeviceMetaData();

  return {
    resourceSlotsInRG,
    deviceMetaData,
    mergedResourceSlots: _.merge({}, deviceMetaData, resourceSlotsInRG),
    refresh: checkUpdate,
    isLoading,
  };
};

export function useMutationWithPromise<T extends MutationParameters>(
  mutation: GraphQLTaggedNode,
) {
  const environment = useRelayEnvironment();
  return (variables: T['variables']) => {
    return new Promise<T['response']>((resolve, reject) => {
      commitMutation<T>(environment, {
        mutation,
        variables,
        onCompleted: (response, errors) => {
          if (errors) {
            reject(errors);
          } else {
            resolve(response);
          }
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  };
}
export const baiSignedRequestWithPromise = ({
  method,
  url,
  body = null,
  client,
}: {
  method: string;
  url: string;
  body?: any;
  client: any;
}) => {
  const request = client?.newSignedRequest(method, url, body, null);
  return client?._wrapWithPromise(request);
};

export const useBAISignedRequestWithPromise = () => {
  const baliClient = useConnectedBAIClient();
  return ({
    method,
    url,
    body = null,
  }: {
    method: string;
    url: string;
    body?: any;
  }) =>
    baiSignedRequestWithPromise({
      method,
      url,
      body,
      client: baliClient,
    });
};

export { default as useErrorMessageResolver } from './useErrorMessageResolver';
export { default as useViewer } from './useViewer';
export type { ErrorResponse } from './useErrorMessageResolver';
export type { ESMClientErrorResponse } from './useErrorMessageResolver';
export { default as useGetAvailableFolderName } from './useGetAvailableFolderName';
export { useInterval, useIntervalValue } from './useIntervalValue';
export {
  default as useBAILogger,
  ContextualLogger,
  LogLevel,
} from './useBAILogger';
export type { LoggerPlugin, LogContext, BAILogger } from './useBAILogger';
export { useEventNotStable } from './useEventNotStable';
