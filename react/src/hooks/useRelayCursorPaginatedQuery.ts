import _ from 'lodash';
import { useState, useRef, useMemo, useTransition, useEffect } from 'react';
import { GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay';
import type { OperationType } from 'relay-runtime';

/**
 * Cursor-based pagination hook for Relay-compliant GraphQL connections.
 * Supports queries with `first`, `after`, `last`, `before`, etc.
 */
export type CursorOptions<Result, ItemType> = {
  getItem: (result: Result) => ItemType[] | undefined;
  // getTotal: (result: Result) => number | undefined;
  getPageInfo: (result: Result) => {
    hasNextPage: boolean;
    endCursor?: string;
    hasPreviousPage?: boolean;
    startCursor?: string;
  };
  getId: (item: ItemType) => string | undefined | null;
};

export function useRelayCursorPaginatedQuery<T extends OperationType, ItemType>(
  query: GraphQLTaggedNode,
  initialPaginationVariables: { first?: number; last?: number },
  otherVariables: Omit<
    Partial<T['variables']>,
    'first' | 'last' | 'after' | 'before'
  >,
  options: Parameters<typeof useLazyLoadQuery<T>>[2],
  {
    getItem,
    getId,
    // getTotal,
    getPageInfo,
  }: CursorOptions<T['response'], ItemType>,
) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [isLoadingNext, startLoadingNextTransition] = useTransition();
  const previousResult = useRef<ItemType[]>([]);

  const previousOtherVariablesRef = useRef(otherVariables);

  const isNewOtherVariables = !_.isEqual(
    previousOtherVariablesRef.current,
    otherVariables,
  );

  const variables = {
    ...initialPaginationVariables,
    ...otherVariables,
    after: cursor,
  };

  const result = useLazyLoadQuery<T>(query, variables, options);

  const data = useMemo(() => {
    const items = getItem(result);
    return items
      ? _.uniqBy([...previousResult.current, ...items], getId)
      : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const pageInfo = getPageInfo(result);
  const hasNext = pageInfo.hasNextPage;

  const loadNext = () => {
    if (isLoadingNext || !hasNext) return;
    previousResult.current = data || [];
    startLoadingNextTransition(() => {
      setCursor(pageInfo.endCursor);
    });
  };

  useEffect(() => {
    // Reset cursor when otherVariables change
    if (isNewOtherVariables) {
      previousResult.current = [];
      setCursor(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewOtherVariables]);

  return {
    paginationData: data,
    result,
    loadNext,
    hasNext,
    isLoadingNext,
  };
}
