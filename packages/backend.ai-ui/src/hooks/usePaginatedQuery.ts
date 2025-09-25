import { useEventNotStable } from './useEventNotStable';
import _ from 'lodash';
import { useState, useTransition, useMemo, useRef, useEffect } from 'react';
import { GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay';
import { OperationType } from 'relay-runtime';

type extraOptions<Result, ItemType> = {
  getItem: (result: Result) => any;
  getTotal: (result: Result) => number | undefined;
  getId: (item: ItemType) => string | undefined | null;
};
export function useLazyPaginatedQuery<
  T extends OperationType & {
    variables: { limit: number; offset: number };
  },
  ItemType,
>(
  query: GraphQLTaggedNode,
  initialPaginationVariables: Pick<T['variables'], 'limit'>,
  otherVariables: Omit<Partial<T['variables']>, 'limit' | 'offset'>,
  options: Parameters<typeof useLazyLoadQuery<T>>[2],
  { getItem, getId, getTotal }: extraOptions<T['response'], ItemType>,
) {
  const previousResult = useRef<T['response'][]>([]);
  const [isLoadingNext, startLoadingNextTransition] = useTransition();

  // limit doesn't change after the first render
  const [limit] = useState(initialPaginationVariables.limit);
  const [offset, setOffset] = useState(0);

  const previousOtherVariablesRef = useRef(otherVariables);

  const isNewOtherVariables = !_.isEqual(
    previousOtherVariablesRef.current,
    otherVariables,
  );

  // Fetch the initial data using useLazyLoadQuery
  const result = useLazyLoadQuery<T>(
    query,
    {
      limit: isNewOtherVariables ? initialPaginationVariables.limit : limit,
      offset: isNewOtherVariables ? 0 : offset,
      ...otherVariables,
    },
    options,
  );

  const data = useMemo(() => {
    const items = getItem(result);
    if (isNewOtherVariables) {
      previousResult.current = [];
    }
    return items
      ? _.uniqBy([...previousResult.current, ...items], getId)
      : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  const hasNext = offset + limit < (getTotal(result) as number);

  const loadNext = useEventNotStable(() => {
    if (isLoadingNext || !hasNext) return;
    previousResult.current = data || [];
    startLoadingNextTransition(() => {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
    });
  });

  useEffect(() => {
    // Reset the offset and limit when otherVariables change after success rendering
    if (isNewOtherVariables) {
      previousOtherVariablesRef.current = otherVariables;
      setOffset(0);
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
