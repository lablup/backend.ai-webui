import { atom, PrimitiveAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithDefault } from 'jotai/utils';
import _ from 'lodash';
import { createContext, use, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  useQueryParams,
  QueryParamConfigMap,
  DecodedValueMap,
  UrlUpdateType,
} from 'use-query-params';

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
 *   (nextQueryParams: Partial<DecodedValueMap<QPCMap>> | ((prevQueryParams: DecodedValueMap<QPCMap>) => Partial<DecodedValueMap<QPCMap>>),
 *    updateType: UrlUpdateType) => void
 * ]} A tuple containing:
 *   - currentQueryParams: The current state of the URL parameters
 *   - updateQueryParams: Function to update URL parameters with transition support
 *
 * @example
 * const [queryParams, updateQueryParams] = useTransitionSafeQueryParams({
 *   page: NumberParam,
 *   search: StringParam
 * });
 *
 * // Update URL parameters
 * updateQueryParams({ page: 2 }, 'pushIn');
 */

export function useTransitionSafeQueryParams<
  QPCMap extends QueryParamConfigMap,
>(paramConfigMap: QPCMap) {
  const [query, setQuery] = useQueryParams(paramConfigMap);

  const { paramKeys, defaultValues } = useMemo(
    () => ({
      paramKeys: Object.keys(paramConfigMap),
      defaultValues: _.mapValues(paramConfigMap, (config) => config.default),
    }),
    // Memoize based on the stringified version of the config map
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(paramConfigMap)],
  );

  const pageQueryParamDeltaAtom = usePageQueryParamDeltaAtom();
  // Create page-specific atoms that reset when pagePath changes
  const localQueryParamsAtom = useMemo(() => {
    // Internal state atom for this specific page
    let hasLoadedFromURL = false;

    // Derived atom that manages the query parameters
    const queryParamsAtom = atomWithDefault((get) => {
      const pageQueryParamDelta = get(pageQueryParamDeltaAtom);

      // Use URL query params on first access, then use internal state
      if (!hasLoadedFromURL) {
        hasLoadedFromURL = true;
        return query;
      }

      return _.pick(
        {
          ...query,
          ...defaultValues,
          ...pageQueryParamDelta,
        },
        paramKeys,
      ) as DecodedValueMap<QPCMap>;
    });

    return queryParamsAtom;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, pageQueryParamDeltaAtom, paramKeys]); // New atoms when page changes and paramKeys change

  const localQueryParams = useAtomValue(localQueryParamsAtom);
  const setPageQueryParamDelta = useSetAtom(pageQueryParamDeltaAtom);

  const updateQueryParams = useCallback(
    (
      nextQueryParams:
        | Partial<DecodedValueMap<QPCMap>>
        | ((
            prevQueryParams: DecodedValueMap<QPCMap>,
          ) => Partial<DecodedValueMap<QPCMap>>),
      updateType: UrlUpdateType,
    ) => {
      const resolvedNextParams =
        typeof nextQueryParams === 'function'
          ? nextQueryParams(localQueryParams)
          : nextQueryParams;

      // Update internal state atom
      if (updateType === 'replaceIn' || updateType === 'pushIn') {
        // do not touch
        setPageQueryParamDelta((prev) => ({
          ...prev,
          ...resolvedNextParams,
        }));
      } else {
        setPageQueryParamDelta(resolvedNextParams as DecodedValueMap<QPCMap>);
      }

      // Sync all(merged) query parameters with URL
      setQuery(
        {
          ...localQueryParams,
          ...resolvedNextParams,
        },
        updateType,
      );
    },
    [localQueryParams, setQuery, setPageQueryParamDelta],
  );

  return [localQueryParams, updateQueryParams] as const;
}

// Holds only the "delta" (patch) of query params modified after the initial URL load for the current page (pathname).
// It does NOT mirror the full set of current URL query params; instead it stores overrides that will be merged
// with defaults + initially decoded URL values.
const PageQueryParamDeltaAtomContext = createContext<
  PrimitiveAtom<Record<string, any>> | undefined
>(undefined);

function usePageQueryParamDeltaAtom() {
  const ctx = use(PageQueryParamDeltaAtomContext);
  if (!ctx) {
    throw new Error(
      'usePageQueryParamDeltaAtom must be used within <PageQueryParamAtomProvider>',
    );
  }
  return ctx;
}

export function PageQueryParamAtomProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();

  // When the provider re-renders and the pathname changes, a new instance is provided.
  const pageQueryParamDeltaAtom = useMemo(
    () => atom<Record<string, any>>({}),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname],
  );

  return (
    <PageQueryParamDeltaAtomContext.Provider value={pageQueryParamDeltaAtom}>
      {children}
    </PageQueryParamDeltaAtomContext.Provider>
  );
}
