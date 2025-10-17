import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useRef, useCallback, useMemo, useEffect } from 'react';
import {
  useQueryParams,
  QueryParamConfigMap,
  DecodedValueMap,
  UrlUpdateType,
} from 'use-query-params';

const queryParamsAtom = atom<Record<string, any>>({});

// Reference counting atom for thread-safe tracking of parameter key usage
const paramRefCountAtom = atom<Map<string, number>>(new Map());

/**
 * A custom hook that synchronizes URL search parameters with application state while handling React transitions.
 * This hook solves the issue where URL parameter changes within React transitions are not properly reflected
 * in the rendering cycle, as search parameter changes are detected through events rather than React's state system.
 *
 * @template QPCMap - Type extending QueryParamConfigMap that defines the structure of URL parameters
 * @param {QPCMap} paramConfigMap - Configuration object that defines the URL parameters to be managed
 *
 * @returns {[
 *   DecodedValueMap<QPCMap>,
 *   (nextQuery: Partial<DecodedValueMap<QPCMap>> | ((prevQuery: DecodedValueMap<QPCMap>) => Partial<DecodedValueMap<QPCMap>>),
 *    updateType: UrlUpdateType) => void,
 *   boolean
 * ]} A tuple containing:
 *   - localQuery: The current state of the URL parameters
 *   - setDeferredQuery: Function to update URL parameters with transition support
 *   - isPending: Boolean indicating if a transition is in progress
 *
 * @example
 * const [query, setQuery, isPending] = useDeferredQueryParams({
 *   page: NumberParam,
 *   search: StringParam
 * });
 *
 * // Update URL parameters
 * setQuery({ page: 2 }, 'pushIn');
 */
export function useDeferredQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
) {
  const [query, setQuery] = useQueryParams(paramConfigMap);
  const setSharedQuery = useSetAtom(queryParamsAtom);
  const setParamRefCount = useSetAtom(paramRefCountAtom);

  const stringifiedParamConfigMap = useMemo(() => {
    return JSON.stringify(paramConfigMap);
  }, [paramConfigMap]);

  // Reference counting based cleanup: only remove params when last component unmounts
  useEffect(() => {
    const keys = Object.keys(paramConfigMap);

    // Mount: increase reference count for each key
    setParamRefCount((prev) => {
      const newMap = new Map(prev);
      keys.forEach((key) => {
        newMap.set(key, (newMap.get(key) || 0) + 1);
      });
      return newMap;
    });

    return () => {
      // Unmount: decrease reference count and cleanup if necessary
      setParamRefCount((prev) => {
        const newMap = new Map(prev);
        keys.forEach((key) => {
          const currentCount = (newMap.get(key) || 0) - 1;

          if (currentCount <= 0) {
            // Last component using this key is unmounting, safe to cleanup
            newMap.delete(key);
            setSharedQuery((queryPrev) => {
              const newState = { ...queryPrev };
              delete newState[key];
              return newState;
            });
          } else {
            // Other components still using this key
            newMap.set(key, currentCount);
          }
        });
        return newMap;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringifiedParamConfigMap, setParamRefCount, setSharedQuery]);

  const isBeforeInitializingRef = useRef(true);
  const selectiveQueryAtom = useMemo(
    () => {
      const defaultValues = _.mapValues(
        paramConfigMap,
        (config) => config.default,
      );
      return atomWithDefault((get) => {
        const globalParams = get(queryParamsAtom);
        const selectedParams = _.pick(
          // Use query parameters from URL on initial render
          isBeforeInitializingRef.current
            ? query
            : {
                ...defaultValues,
                ...globalParams,
              },
          Object.keys(paramConfigMap),
        );
        isBeforeInitializingRef.current = false;
        return selectedParams as DecodedValueMap<QPCMap>;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stringifiedParamConfigMap],
  );

  const localQuery = useAtomValue(selectiveQueryAtom);

  const setDeferredQuery = useCallback(
    (
      nextQuery:
        | Partial<DecodedValueMap<QPCMap>>
        | ((
            prevQuery: DecodedValueMap<QPCMap>,
          ) => Partial<DecodedValueMap<QPCMap>>),
      updateType: UrlUpdateType,
    ) => {
      const newQuery =
        typeof nextQuery === 'function' ? nextQuery(localQuery) : nextQuery;

      // Update Jotai state
      if (updateType === 'replaceIn' || updateType === 'pushIn') {
        setSharedQuery((prev) => ({
          ...prev,
          ...localQuery,
          ...newQuery,
        }));
      } else {
        setSharedQuery((prev) => ({
          ...prev,
          ...(newQuery as DecodedValueMap<QPCMap>),
        }));
      }

      // Sync all(merged) query parameters with URL
      setQuery(
        {
          ...localQuery,
          ...newQuery,
        },
        updateType,
      );
    },
    [localQuery, setQuery, setSharedQuery],
  );

  return [localQuery, setDeferredQuery] as const;
}
