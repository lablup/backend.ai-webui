// import { offset_to_cursor } from "../helper";
import { LazyLoadQueryOptions } from '../helper/types';
import { SorterResult } from 'antd/lib/table/interface';
import _ from 'lodash';
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsJson,
  parseAsString,
  useQueryStates,
} from 'nuqs';
import { useMemo, useState } from 'react';
import {
  fetchQuery,
  GraphQLTaggedNode,
  useRelayEnvironment,
} from 'react-relay';

export type SorterInterface = Pick<SorterResult<any>, 'field' | 'order'>;

export const antdSorterResultToOrder = (
  sorter: SorterInterface | SorterInterface[],
) => {
  const sorterArray = _.castArray(sorter).filter((s) => s.field);

  return _.filter(
    _.map(sorterArray, (s) =>
      _.isNull(s.order)
        ? undefined
        : `${_.snakeCase(s.field as string).toUpperCase()}_${
            s.order === 'ascend' ? 'ASC' : 'DESC'
          }`,
    ),
  );
};

export const orderToAntdSorterResult = (order: string[]) => {
  return _.map(order, (o) => {
    const names = o.split('_');
    const orderKey = names.pop();
    const field = _.camelCase(names.join('_'));
    return {
      field,
      order: (orderKey === 'ASC' ? 'ascend' : 'descend') as
        | 'ascend'
        | 'descend'
        | null,
    };
  });
};

export const getSortOrderByName = (order: string[], name: string) => {
  const sorterResult = orderToAntdSorterResult(order);
  const sorter = _.find(sorterResult, (s) => s.field === name);
  return sorter?.order;
};

export const useRelayPaginationQueryOptions = <
  // Q, N,
  O,
  F,
>({
  query,
  defaultVariables,
  getVariables = ({ pageSize, order, filter }) => {
    return {
      first: pageSize,
      //   after: page > 1 ? offset_to_cursor((page - 1) * pageSize - 1) : undefined,
      order: order,
      filter: filter,
    };
  },
}: {
  query: GraphQLTaggedNode;
  defaultVariables: {
    page: number;
    pageSize: number;
    order: O[];
    filter?: F;
    // sorter?: SorterResult<N>[];
  };
  getVariables?: (params: {
    page: number;
    pageSize: number;
    order: O[];
    filter?: F;
  }) => any;
}) => {
  const [isPending, setIsPending] = useState(false);

  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger,
      pageSize: parseAsInteger,
      order: parseAsArrayOf(parseAsString),
      filter: parseAsJson<F>(),
    },
    {
      history: 'replace',
    },
  );

  const page = params.page || defaultVariables.page;
  const pageSize = params.pageSize || defaultVariables.pageSize;
  //TODO: not use as
  const order = (params.order || defaultVariables.order) as O[];
  const filter = (params.filter || defaultVariables.filter) as F;

  const relayEnvironment = useRelayEnvironment();

  const [refreshedQueryOptions, setRefreshedQueryOptions] =
    useState<LazyLoadQueryOptions>({
      fetchKey: 0,
      fetchPolicy: 'store-and-network',
    });

  const prevLocationRef = window.location.href;
  const refresh = (
    newPage: number = defaultVariables.page,
    newPageSize: number = defaultVariables.pageSize,
    // sorter: SorterResult<N>[],
    newOrder: O[] = defaultVariables.order,
    newFilter: F | undefined = defaultVariables.filter,
    options?: {
      withoutPendingStatus: boolean;
    },
  ) => {
    if (options?.withoutPendingStatus !== true) {
      setIsPending(true);
    }
    fetchQuery<any>(
      relayEnvironment,
      query,
      getVariables({
        page: newPage,
        pageSize: newPageSize,
        order: newOrder,
        filter: newFilter,
      }),
    ).subscribe({
      complete: () => {
        if (window.location.href !== prevLocationRef) return;
        setIsPending(false);
        setParams({
          page: newPage,
          pageSize: newPageSize,
          // eslint-disable-next-line
          order: newOrder as string[], // TODO: not use as []
          // eslint-disable-next-line
          filter: newFilter as F, // TODO: not use as {}
        });
        setRefreshedQueryOptions((prev) => ({
          ...prev,
          fetchPolicy: 'store-only',
          fetchKey: new Date().toISOString(),
        }));
      },
    });
  };

  const variables = getVariables({
    page,
    pageSize,
    order,
    filter,
  });

  return [
    {
      refreshedQueryOptions,
      page,
      pageSize,
      order,
      isPending,
      variables,
      filter,
      //   after: page > 1 ? offset_to_cursor((page - 1) * pageSize - 1) : undefined,
    },
    {
      refresh,
    },
  ] as const;
};

export const useBAIPaginationQueryOptions = ({
  query,
  defaultVariables,
  getVariables = ({ page, pageSize, order, filter }) => {
    return {
      limit: pageSize,
      offset: page > 1 ? (page - 1) * pageSize : 0,
      filter: filter,
      order: order,
    };
  },
}: {
  query: GraphQLTaggedNode;
  defaultVariables: {
    page: number;
    pageSize: number;
    order?: string;
    filter?: string;
  };
  getVariables?: (params: {
    page: number;
    pageSize: number;
    order?: string;
    filter?: string;
  }) => any;
}) => {
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger,
      pageSize: parseAsInteger,
      filter: parseAsString,
      order: parseAsString,
    },
    {
      history: 'replace',
    },
  );
  const page = params.page || defaultVariables.page;
  const pageSize = params.pageSize || defaultVariables.pageSize;
  const order = params.order || defaultVariables.order;
  const filter = params.filter || defaultVariables.filter;

  const relayEnvironment = useRelayEnvironment();

  const [refreshedQueryOptions, setRefreshedQueryOptions] =
    useState<LazyLoadQueryOptions>({
      fetchKey: 0,
      fetchPolicy: 'store-and-network',
    });

  const prevLocationRef = window.location.href;
  const refresh = (
    newPage: number = defaultVariables.page,
    newPageSize: number = defaultVariables.pageSize,
    newOrder: string | undefined = defaultVariables.order,
    newFilter: string | undefined = defaultVariables.filter,
  ) => {
    fetchQuery<any>(
      relayEnvironment,
      query,
      getVariables({
        page: newPage,
        pageSize: newPageSize,
        order: newOrder,
        filter: newFilter,
      }),
    ).subscribe({
      complete: () => {
        if (window.location.href !== prevLocationRef) return;
        setParams({
          page: newPage,
          pageSize: newPageSize,
          order: newOrder ?? null,
          filter: newFilter ?? null,
        });
        setRefreshedQueryOptions((prev) => ({
          ...prev,
          fetchPolicy: 'store-only',
          fetchKey: new Date().toISOString(),
        }));
      },
    });
  };

  const variables = getVariables({
    page,
    pageSize,
    order,
    filter,
  });

  return [
    {
      refreshedQueryOptions,
      page,
      pageSize,
      order,
      variables,
      filter,
    },
    {
      refresh,
    },
  ] as const;
};

interface BAIPaginationOption {
  limit: number;
  offset: number;
  first?: number;
  // filter?: string;
  // order?: string;
}

interface AntdBasicPaginationOption {
  pageSize: number;
  current: number;
}

interface InitialPaginationOption
  extends AntdBasicPaginationOption,
    Omit<BAIPaginationOption, 'limit' | 'offset'> {}

interface BAIPaginationOptionState {
  baiPaginationOption: BAIPaginationOption;
  tablePaginationOption: AntdBasicPaginationOption;
  setTablePaginationOption: (
    pagination: Partial<AntdBasicPaginationOption>,
  ) => void;
}

export const useBAIPaginationOptionState = (
  initialOptions: InitialPaginationOption,
): BAIPaginationOptionState => {
  const [options, setOptions] =
    useState<AntdBasicPaginationOption>(initialOptions);

  const { pageSize, current } = options;
  return useMemo<BAIPaginationOptionState>(() => {
    return {
      baiPaginationOption: {
        limit: pageSize,
        first: pageSize,
        offset: current > 1 ? (current - 1) * pageSize : 0,
      },
      tablePaginationOption: {
        pageSize: pageSize,
        current: current,
      },
      setTablePaginationOption: (pagination) => {
        if (
          !_.isEqual(pagination, {
            pageSize,
            current,
          })
        ) {
          setOptions((current) => ({
            ...current,
            ...pagination,
          }));
        }
      },
    };
  }, [pageSize, current]);
};

/**
 * @deprecated Use useBAIPaginationOptionStateOnSearchParam instead
 */
export const useBAIPaginationOptionStateOnSearchParamLegacy = (
  initialOptions: InitialPaginationOption,
): BAIPaginationOptionState => {
  const [{ pageSize, current }, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(initialOptions.current),
      pageSize: parseAsInteger.withDefault(initialOptions.pageSize),
    },
    {
      history: 'replace',
    },
  );

  const memoizedOptions = useMemo<{
    baiPaginationOption: BAIPaginationOption;
    tablePaginationOption: AntdBasicPaginationOption;
  }>(() => {
    return {
      baiPaginationOption: {
        limit: pageSize,
        first: pageSize,
        offset: current > 1 ? (current - 1) * pageSize : 0,
      },
      tablePaginationOption: {
        pageSize: pageSize,
        current: current,
      },
    };
  }, [pageSize, current]);

  return {
    ...memoizedOptions,
    setTablePaginationOption: (
      pagination: Partial<AntdBasicPaginationOption>,
    ) => {
      if (
        !_.isEqual(pagination, {
          pageSize,
          current,
        })
      ) {
        setQueryParams(pagination);
      }
    },
  };
};

export const useBAIPaginationOptionStateOnSearchParam = (
  initialOptions: InitialPaginationOption,
): BAIPaginationOptionState => {
  'use memo';
  const [{ pageSize, current }, setQueryParams] = useQueryStates(
    {
      current: parseAsInteger.withDefault(initialOptions.current),
      pageSize: parseAsInteger.withDefault(initialOptions.pageSize),
    },
    {
      history: 'replace',
    },
  );

  return {
    baiPaginationOption: {
      limit: pageSize,
      first: pageSize,
      offset: current > 1 ? (current - 1) * pageSize : 0,
    },
    tablePaginationOption: {
      pageSize: pageSize,
      current: current,
    },
    setTablePaginationOption: (
      pagination: Partial<AntdBasicPaginationOption> | null,
    ) => {
      if (
        !_.isEqual(pagination, {
          pageSize,
          current,
        })
      ) {
        setQueryParams(pagination);
      }
    },
  };
};
