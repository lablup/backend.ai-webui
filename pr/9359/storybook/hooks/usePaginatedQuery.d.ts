import { GraphQLTaggedNode, useLazyLoadQuery } from 'react-relay';
import { OperationType } from 'relay-runtime';
type extraOptions<Result, ItemType> = {
    getItem: (result: Result) => any;
    getTotal: (result: Result) => number | undefined;
    getId: (item: ItemType) => string | undefined | null;
};
export declare function useLazyPaginatedQuery<T extends OperationType & {
    variables: {
        limit: number;
        offset: number;
    };
}, ItemType>(query: GraphQLTaggedNode, initialPaginationVariables: Pick<T['variables'], 'limit'>, otherVariables: Omit<Partial<T['variables']>, 'limit' | 'offset'>, options: Parameters<typeof useLazyLoadQuery<T>>[2], { getItem, getId, getTotal }: extraOptions<T['response'], ItemType>): {
    paginationData: ItemType[] | undefined;
    result: T["response"];
    loadNext: () => void;
    hasNext: boolean;
    isLoadingNext: boolean;
};
export {};
