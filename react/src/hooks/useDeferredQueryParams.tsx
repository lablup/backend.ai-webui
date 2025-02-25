import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useRef } from 'react';
import { useCallback, useMemo } from 'react';
import {
  useQueryParams,
  QueryParamConfigMap,
  DecodedValueMap,
  UrlUpdateType,
} from 'use-query-params';

const queryParamsAtom = atom<Record<string, any>>({});

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

  const isBeforeInitializingRef = useRef(true);
  const selectiveQueryAtom = useMemo(
    () => {
      return atomWithDefault((get) => {
        const globalParams = get(queryParamsAtom);
        const selectedParams = _.pick(
          // Use query parameters from URL on initial render
          isBeforeInitializingRef.current ? query : globalParams,
          Object.keys(paramConfigMap),
        );
        isBeforeInitializingRef.current = false;
        return selectedParams as DecodedValueMap<QPCMap>;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(paramConfigMap)],
  );

  let localQuery = useAtomValue(selectiveQueryAtom);
  const setLocalQuery = useSetAtom(queryParamsAtom);

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
        setLocalQuery({ ...localQuery, ...newQuery });
      } else {
        setLocalQuery(newQuery as DecodedValueMap<QPCMap>);
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
    [localQuery, setQuery, setLocalQuery],
  );

  return [localQuery, setDeferredQuery] as const;
}
