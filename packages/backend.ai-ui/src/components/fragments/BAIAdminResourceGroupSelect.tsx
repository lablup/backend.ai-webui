import { BAIAdminResourceGroupSelectPaginationQuery } from '../../__generated__/BAIAdminResourceGroupSelectPaginationQuery.graphql';
import { BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key } from '../../__generated__/BAIAdminResourceGroupSelect_scalingGroupsV2Fragment.graphql';
import BAISelect, { BAISelectProps } from '../BAISelect';
import TotalFooter from '../TotalFooter';
import { Skeleton } from 'antd';
import { GetRef } from 'antd/lib';
import _ from 'lodash';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { usePaginationFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

export interface BAIAdminResourceGroupSelectProps
  extends Omit<BAISelectProps, 'options' | 'labelInValue'> {
  queryRef: BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key;
}

const BAIAdminResourceGroupSelect = ({
  queryRef,
  loading,
  ...selectPropsWithoutLoading
}: BAIAdminResourceGroupSelectProps) => {
  const { t } = useTranslation();
  const selectRef = useRef<GetRef<typeof BAISelect>>(null);

  const { data, loadNext, isLoadingNext, refetch, hasNext } =
    usePaginationFragment<
      BAIAdminResourceGroupSelectPaginationQuery,
      BAIAdminResourceGroupSelect_scalingGroupsV2Fragment$key
    >(
      graphql`
        fragment BAIAdminResourceGroupSelect_scalingGroupsV2Fragment on Query
        @argumentDefinitions(
          first: { type: "Int", defaultValue: 10 }
          after: { type: "String" }
          filter: { type: "ScalingGroupFilter" }
        )
        @refetchable(queryName: "BAIAdminResourceGroupSelectPaginationQuery") {
          allScalingGroupsV2(first: $first, after: $after, filter: $filter)
            @connection(key: "BAIAdminResourceGroupSelect_allScalingGroupsV2")
            @since(version: "25.18.0") {
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
      queryRef,
    );

  const selectOptions = _.map(data.allScalingGroupsV2.edges, (item) => ({
    label: item.node.name,
    value: item.node.name, // since scaling group uses name as primary key, use name as value
  }));

  return (
    <BAISelect
      ref={selectRef}
      placeholder={t('comp:BAIAdminResourceGroupSelect.PlaceHolder')}
      showSearch={{
        autoClearSearchValue: true,
        filterOption: false,
      }}
      loading={loading}
      options={selectOptions}
      {...selectPropsWithoutLoading}
      searchAction={async (value) => {
        selectRef.current?.scrollTo(0);
        refetch({
          filter: value
            ? {
                name: {
                  contains: value,
                },
              }
            : null,
        });
        await selectPropsWithoutLoading.searchAction?.(value);
      }}
      endReached={() => {
        hasNext && loadNext(10);
      }}
      notFoundContent={
        _.isUndefined(data) ? (
          <Skeleton.Input active size="small" block />
        ) : undefined
      }
      footer={
        _.isNumber(data.allScalingGroupsV2.count) &&
        data.allScalingGroupsV2.count > 0 ? (
          <TotalFooter
            loading={isLoadingNext}
            total={data.allScalingGroupsV2.count}
          />
        ) : undefined
      }
    />
  );
};

export default BAIAdminResourceGroupSelect;
