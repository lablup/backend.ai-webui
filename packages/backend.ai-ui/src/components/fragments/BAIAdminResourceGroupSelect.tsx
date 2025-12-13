import { BAIAdminResourceGroupSelectQuery } from '../../__generated__/BAIAdminResourceGroupSelectQuery.graphql';
import { useLazyPaginatedQuery } from '../../hooks/usePaginatedQuery';
import BAISelect, { BAISelectProps } from '../BAISelect';
import BAIText from '../BAIText';
import TotalFooter from '../TotalFooter';
import { useControllableValue } from 'ahooks';
import { Skeleton } from 'antd';
import { GetRef } from 'antd/lib';
import _ from 'lodash';
import { useDeferredValue, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql } from 'relay-runtime';

export interface BAIAdminResourceGroupSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue'> {
  fetchKey?: string;
}

const BAIAdminResourceGroupSelect = ({
  fetchKey,
  loading,
  ...selectPropsWithoutLoading
}: BAIAdminResourceGroupSelectProps) => {
  const { t } = useTranslation();
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
    result: { allScalingGroupsV2 },
    loadNext,
    isLoadingNext,
  } = useLazyPaginatedQuery<
    BAIAdminResourceGroupSelectQuery,
    NonNullable<
      BAIAdminResourceGroupSelectQuery['response']['allScalingGroupsV2']
    >['edges'][number]
  >(
    graphql`
      query BAIAdminResourceGroupSelectQuery(
        $offset: Int!
        $limit: Int!
        $filter: ScalingGroupFilter
      ) {
        allScalingGroupsV2(offset: $offset, limit: $limit, filter: $filter) {
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
      limit: 10,
    },
    {
      filter: deferredSearchStr
        ? { name: { iContains: deferredSearchStr } }
        : null,
    },
    {
      fetchKey,
      fetchPolicy: deferredOpen ? 'network-only' : 'store-only',
    },
    {
      getTotal: (result) => result.allScalingGroupsV2?.count,
      getItem: (result) => result.allScalingGroupsV2?.edges,
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
      placeholder={t('comp:BAIAdminResourceGroupSelect.PlaceHolder')}
      showSearch
      searchValue={searchStr}
      onSearch={(v) => {
        setSearchStr(v);
      }}
      labelRender={({ label }: { label: React.ReactNode }) => {
        return <BAIText>{label}</BAIText>;
      }}
      autoClearSearchValue
      filterOption={false}
      loading={searchStr !== deferredSearchStr || loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      endReached={() => {
        console.log('endReached');
        loadNext();
      }}
      open={controllableOpen}
      onOpenChange={setControllableOpen}
      notFoundContent={
        _.isUndefined(paginationData) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(allScalingGroupsV2?.count) &&
        allScalingGroupsV2?.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={allScalingGroupsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminResourceGroupSelect;
