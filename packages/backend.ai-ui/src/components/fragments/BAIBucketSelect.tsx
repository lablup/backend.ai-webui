import { BAIBucketSelectQuery } from '../../__generated__/BAIBucketSelectQuery.graphql';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { GetRef, Skeleton } from 'antd';
import _ from 'lodash';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { graphql } from 'react-relay';

export interface BAIBucketSelectProps extends BAISelectProps {
  objectStorageId: string;
  fetchKey?: string;
}

const BAIBucketSelect = ({
  objectStorageId,
  fetchKey,
  loading,
  ...selectProps
}: BAIBucketSelectProps) => {
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectProps,
    {
      valuePropName: 'open',
      trigger: 'onOpenChange',
    },
  );
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);

  const deferredOpen = useDeferredValue(controllableOpen);
  const [searchStr, setSearchStr] = useState<string>();
  const deferredSearchStr = useDeferredValue(searchStr);

  const {
    paginationData,
    result: { objectStorage },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    BAIBucketSelectQuery,
    NonNullable<
      BAIBucketSelectQuery['response']['objectStorage']
    >['namespaces']['edges'][number]
  >(
    graphql`
      query BAIBucketSelectQuery(
        $offset: Int!
        $limit: Int!
        $objectStorageId: ID!
        $first: Int
        $last: Int
        $before: String
        $after: String
      ) {
        objectStorage(id: $objectStorageId) {
          namespaces(
            offset: $offset
            limit: $limit
            first: $first
            last: $last
            before: $before
            after: $after
          ) {
            count
            edges {
              node {
                id
                bucket
              }
            }
          }
        }
      }
    `,
    {
      limit: 1,
    },
    {
      objectStorageId,
      first: null,
      last: null,
      before: null,
      after: null,
    },
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.objectStorage?.namespaces.count,
      getItem: (result) => result.objectStorage?.namespaces.edges,
      getId: (item) => item?.node.id,
    },
  );

  const selectedOptions = _.map(paginationData, (item) => ({
    label: item.node.bucket,
    value: item.node.id,
  }));

  const isValueMatched = searchStr === deferredSearchStr;
  useEffect(() => {
    if (isValueMatched) {
      selectRef.current?.scrollTo(0);
    }
  });

  return (
    <BAISelect
      ref={selectRef}
      autoSelectOption
      options={selectedOptions}
      showSearch
      searchValue={searchStr}
      onSearch={(v) => {
        setSearchStr(v);
      }}
      autoClearSearchValue
      filterOption={false}
      loading={searchStr !== deferredSearchStr || loading}
      {...selectProps}
      endReached={() => loadNext()}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(objectStorage?.namespaces.count) &&
        objectStorage?.namespaces.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={objectStorage?.namespaces.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIBucketSelect;
