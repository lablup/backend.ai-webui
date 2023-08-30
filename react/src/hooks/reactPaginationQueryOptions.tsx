// import { offset_to_cursor } from "../helper";
import { LazyLoadQueryOptions } from "../helper/types";
import { SorterResult } from "antd/lib/table/interface";
import _ from "lodash";
import { useState } from "react";
import {
  fetchQuery,
  GraphQLTaggedNode,
  useRelayEnvironment,
} from "react-relay";
import {
  ArrayParam,
  NumberParam,
  ObjectParam,
  useQueryParams,
} from "use-query-params";

export type SorterInterface = Pick<SorterResult<any>, "field" | "order">;

export const antdSorterResultToOrder = (
  sorter: SorterInterface | SorterInterface[]
) => {
  const sorterArray = _.castArray(sorter).filter((s) => s.field);

  return _.filter(
    _.map(sorterArray, (s) =>
      _.isNull(s.order)
        ? undefined
        : `${_.snakeCase(s.field as string).toUpperCase()}_${
            s.order === "ascend" ? "ASC" : "DESC"
          }`
    )
  );
};

export const orderToAntdSorterResult = (order: string[]) => {
  return _.map(order, (o) => {
    const names = o.split("_");
    const orderKey = names.pop();
    const field = _.camelCase(names.join("_"));
    return {
      field,
      order: (orderKey === "ASC" ? "ascend" : "descend") as
        | "ascend"
        | "descend"
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
  F
>({
  query,
  defaultVariables,
  getVariables = ({ page, pageSize, order, filter }) => {
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

  const [params, setParams] = useQueryParams({
    page: NumberParam,
    pageSize: NumberParam,
    order: ArrayParam,
    filter: ObjectParam,
  });

  const page = params.page || defaultVariables.page;
  const pageSize = params.pageSize || defaultVariables.pageSize;
  //TODO: not use as
  const order = (params.order || defaultVariables.order) as O[];
  const filter = (params.filter || defaultVariables.filter) as F;

  const relayEnvironment = useRelayEnvironment();

  const [refreshedQueryOptions, setRefreshedQueryOptions] =
    useState<LazyLoadQueryOptions>({
      fetchKey: 0,
      fetchPolicy: "store-and-network",
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
    }
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
      })
    ).subscribe({
      complete: () => {
        if (window.location.href !== prevLocationRef) return;
        setIsPending(false);
        setParams({
          page: newPage,
          pageSize: newPageSize,
          // eslint-disable-next-line
          order: newOrder as [], // TODO: not use as []
          // eslint-disable-next-line
          filter: newFilter as {}, // TODO: not use as {}
        });
        setRefreshedQueryOptions((prev) => ({
          ...prev,
          fetchPolicy: "store-only",
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