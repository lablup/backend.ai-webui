import { BAIObjectStorageSelectQuery } from '../../__generated__/BAIObjectStorageSelectQuery.graphql';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { Skeleton } from 'antd';
import { GetRef } from 'antd/lib';
import _ from 'lodash';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { graphql } from 'relay-runtime';

export interface BAIObjectStorageSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue'> {
  fetchKey?: string;
}

const BAIObjectStorageSelect = ({
  fetchKey,
  loading,
  ...selectPropsWithoutLoading
}: BAIObjectStorageSelectProps) => {
  const [controllableOpen, setControllableOpen] = useControllableValue<boolean>(
    selectPropsWithoutLoading,
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
    result: { objectStorages },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    BAIObjectStorageSelectQuery,
    NonNullable<
      BAIObjectStorageSelectQuery['response']['objectStorages']
    >['edges'][number]
  >(
    graphql`
      query BAIObjectStorageSelectQuery($offset: Int!, $limit: Int!) {
        objectStorages(offset: $offset, limit: $limit) {
          count
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    {
      limit: 1,
    },
    {},
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.objectStorages?.count,
      getItem: (result) => result.objectStorages?.edges,
      getId: (item) => item?.node.id,
    },
  );

  const selectOptions = _.map(paginationData, (item) => ({
    label: item.node.name,
    value: item.node.id,
  }));

  const isValueMatched = searchStr === deferredSearchStr;
  useEffect(() => {
    if (isValueMatched) {
      selectRef.current?.scrollTo(0);
    }
  }, [isValueMatched]);

  return (
    <BAISelect
      ref={selectRef}
      placeholder="Select Storage"
      showSearch={{
        searchValue: searchStr,
        onSearch: (v) => {
          setSearchStr(v);
        },
        filterOption: false,
        autoClearSearchValue: true,
      }}
      labelRender={({ label }: { label: React.ReactNode }) => {
        return <BAIText>{label}</BAIText>;
      }}
      loading={searchStr !== deferredSearchStr || loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      endReached={() => loadNext()}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(objectStorages?.count) && objectStorages?.count > 0 ? (
          <TotalFooter loading={isLoadingNext} total={objectStorages.count} />
        ) : undefined
      }
    />
  );
};

export default BAIObjectStorageSelect;
