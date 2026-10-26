import { QueryKey, useQuery, useMutation, UseSuspenseQueryOptions } from '@tanstack/react-query';
export declare const useTanQuery: typeof useQuery;
export declare const useTanMutation: typeof useMutation;
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
export declare const useSuspenseTanQuery: <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData, TQueryKey extends QueryKey = QueryKey>({ fetchKey, ...options }: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
    fetchKey?: string;
}) => import('@tanstack/react-query').UseSuspenseQueryResult<TData, TError>;
