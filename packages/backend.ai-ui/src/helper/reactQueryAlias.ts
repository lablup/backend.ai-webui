import {
  type QueryKey,
  useQuery,
  useMutation,
  useQueryClient,
  QueryObserver,
  useSuspenseQuery,
  UseSuspenseQueryOptions,
} from '@tanstack/react-query';
import { useRef } from 'react';

export const useTanQuery = useQuery;
export const useTanMutation = useMutation;

/**
 * Custom hook that wraps the `useQuery` hook from `react-query` and enables suspense mode refetch using `fetchKey`.
 *
 * @template TQueryFnData The type of the data returned by the query function.
 * @template TError The type of the error thrown by the query function.
 * @template TData The type of the data returned by the query.
 * @template TQueryKey The type of the query key.
 *
 * @param {Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & { fetchKey?: string; }, 'suspense'>} options The options for the query.
 *
 * @returns {QueryResult<TQueryFnData, TError, TData>} The query result.
 */
export const useSuspenseTanQuery = <
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  fetchKey,
  ...options
}: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  fetchKey?: string;
}) => {
  const queryClient = useQueryClient();

  const queryResult = useSuspenseQuery<TQueryFnData, TError, TData, TQueryKey>({
    ...options,
  });

  const promiseInfoRef = useRef<{
    fetchKey?: string;
    promise?: Promise<any>;
    resolved?: boolean;
  }>({
    fetchKey,
  });

  if (fetchKey !== promiseInfoRef.current.fetchKey) {
    const observer = new QueryObserver(queryClient, {
      queryKey: options.queryKey,
    });
    queryClient.invalidateQueries({
      queryKey: options.queryKey,
    });

    promiseInfoRef.current.fetchKey = fetchKey;

    promiseInfoRef.current.resolved = false;

    promiseInfoRef.current.promise = new Promise((resolve) => {
      const unsubscribe = observer.subscribe((result) => {
        unsubscribe();
        resolve(result);
        if (promiseInfoRef.current?.fetchKey === fetchKey) {
          promiseInfoRef.current.resolved = true;
        }
      });
    });
  }

  if (promiseInfoRef.current?.promise && !promiseInfoRef.current.resolved) {
    throw promiseInfoRef.current.promise;
  }

  return queryResult;
};
