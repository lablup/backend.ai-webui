import { GraphQLTaggedNode, MutationParameters } from 'relay-runtime';
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
export declare function useMemoizedJSONParse<T = any>(jsonString: string | undefined | null, options?: UseMemoizedJsonParseOptions<T>): T;
export declare const useDateISOState: (initialValue?: string) => readonly [string, (newValue?: string | undefined) => void];
export declare const useUpdatableState: (initialValue: string) => readonly [string, (newValue?: string | undefined) => void];
export declare const INITIAL_FETCH_KEY = "first";
export declare const useFetchKey: () => readonly [string, (newValue?: string | undefined) => void, "first"];
export declare const useAllowedHostNames: () => string[];
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
export declare function useMutationWithPromise<T extends MutationParameters>(mutation: GraphQLTaggedNode): (variables: T["variables"]) => Promise<T["response"]>;
export { baiSignedRequestWithPromise, useBAISignedRequestWithPromise, } from './useBAISignedRequestWithPromise';
export { default as useErrorMessageResolver } from './useErrorMessageResolver';
export { default as useViewer } from './useViewer';
export type { ErrorResponse } from './useErrorMessageResolver';
export type { ESMClientErrorResponse } from './useErrorMessageResolver';
export { default as useGetAvailableFolderName } from './useGetAvailableFolderName';
export { useInterval, useIntervalValue } from './useIntervalValue';
export { default as useBAILogger, ContextualLogger, LogLevel, } from './useBAILogger';
export type { LoggerPlugin, LogContext, BAILogger } from './useBAILogger';
export { useEventNotStable } from './useEventNotStable';
export { default as useControllableValue } from './useControllableValue';
export type { UseControllableValueOptions, ControllableProps, StandardControllableProps, } from './useControllableValue';
export { default as useDebounce } from './useDebounce';
export { default as useDebounceFn } from './useDebounceFn';
export type { DebounceOptions } from './useDebounceFn';
export { default as useEventListener } from './useEventListener';
export type { UseEventListenerOptions, UseEventListenerTarget, } from './useEventListener';
export { default as useHover } from './useHover';
export type { UseHoverOptions } from './useHover';
export { default as useNetwork } from './useNetwork';
export type { NetworkState } from './useNetwork';
export { default as usePrevious } from './usePrevious';
export type { ShouldUpdateFunc } from './usePrevious';
export { createUseStorageState, useLocalStorageState, useSessionStorageState, SYNC_STORAGE_EVENT_NAME, } from './useStorageState';
export type { SetStorageState, UseStorageStateOptions, } from './useStorageState';
export { default as useThrottleFn } from './useThrottleFn';
export type { ThrottleOptions } from './useThrottleFn';
export { default as useToggle } from './useToggle';
export type { UseToggleActions } from './useToggle';
export { default as useUpdateEffect } from './useUpdateEffect';
export { useProjectResourceGroups, StorageHostFetchError, } from './useProjectResourceGroups';
export type { ScalingGroupItem } from './useProjectResourceGroups';
