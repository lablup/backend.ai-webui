import { atom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { useCallback, useMemo } from 'react';
import {
  useQueryParams,
  QueryParamConfigMap,
  DecodedValueMap,
  UrlUpdateType,
} from 'use-query-params';

// Create a global atom to store query params
const queryParamsAtom = atom<Record<string, any>>({});

export function useDeferredQueryParams<QPCMap extends QueryParamConfigMap>(
  paramConfigMap: QPCMap,
) {
  const [query, setQuery] = useQueryParams(paramConfigMap);

  const selectiveQueryAtom = useMemo(
    () =>
      atomWithDefault((get) => {
        const globalParams = get(queryParamsAtom);
        const selectedParams = _.pick(
          globalParams,
          Object.keys(paramConfigMap),
        );
        if (_.isEmpty(selectedParams)) {
          // If the global state is empty, return the query
          return query;
        }
        // Use the value from the global state if it exists
        return selectedParams as DecodedValueMap<QPCMap>;
      }),
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
        setLocalQuery((prev) => ({ ...prev, ...newQuery }));
      } else {
        setLocalQuery(newQuery as DecodedValueMap<QPCMap>);
      }
      // Update URL params
      setQuery(newQuery, updateType);
    },
    [localQuery, setQuery, setLocalQuery],
  );

  return [localQuery, setDeferredQuery] as const;
}
