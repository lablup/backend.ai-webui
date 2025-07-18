import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery, useTanQuery } from '../hooks/reactQueryAlias';
import useControllableState from '../hooks/useControllableState';
import TextHighlighter from './TextHighlighter';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState, useTransition, useMemo } from 'react';

interface ResourceGroupSelectProps extends SelectProps {
  projectName: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelect: React.FC<ResourceGroupSelectProps> = ({
  projectName,
  autoSelectDefault,
  filter,
  searchValue,
  onSearch,
  loading,
  ...selectProps
}) => {
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [fetchKey] = useUpdatableState('first');
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState<string>({
      value: searchValue,
      onChange: onSearch,
    });

  const [controllableValue, setControllableValueDoNotUseWithoutTransition] =
    useControllableState(selectProps);
  const [isPendingChangeTransition, startChangeTransition] = useTransition();

  const [optimisticValue, setOptimisticValue] = useState();
  const setControllableValueWithTransition = React.useCallback(
    (v: typeof controllableValue, ...args: any[]) => {
      setOptimisticValue(v);
      startChangeTransition(() => {
        setControllableValueDoNotUseWithoutTransition(v, ...args);
      });
    },
    [startChangeTransition, setControllableValueDoNotUseWithoutTransition],
  );

  const { data: scalingGroupsData } = useSuspenseTanQuery<{
    scaling_groups: {
      name: string;
    }[];
  }>({
    queryKey: ['ScalingGroupsQuery', projectName],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group', projectName);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/scaling-groups?${search.toString()}`,
      });
    },
    staleTime: 0,
    fetchKey: fetchKey,
  });

  const {
    data: hostsData,
    isLoading: isHostsLoading,
    isError: isHostsError,
  } = useTanQuery<{
    allowed: string[];
    default: string;
    volume_info: {
      [key: string]: {
        backend: string;
        capabilities: string[];
        usage: {
          percentage: number;
        };
        sftp_scaling_groups?: string[];
      };
    };
  } | null>({
    queryKey: ['HostsQuery', fetchKey],
    queryFn: async () => {
      try {
        return await baiRequestWithPromise({
          method: 'GET',
          url: `/folders/_/hosts`,
        });
      } catch (error) {
        console.warn('Failed to fetch hosts data:', error);
        return null; // Return null on error
      }
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: false, // Disable retry
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  // SFTP resource groups filtering - use empty array when hosts data is loading, error, or unavailable
  const sftpResourceGroups = useMemo(() => {
    if (isHostsLoading || isHostsError || !hostsData) {
      return []; // Skip SFTP filtering when loading or error occurs
    }
    return _.flatMap(
      hostsData.volume_info,
      (item) => item?.sftp_scaling_groups ?? [],
    );
  }, [hostsData, isHostsLoading, isHostsError]);

  const resourceGroups = _.filter(
    scalingGroupsData?.scaling_groups,
    (item: { name: string }) => {
      if (_.includes(sftpResourceGroups, item.name)) {
        return false;
      }
      if (filter) {
        return filter(item.name);
      }
      return true;
    },
  );

  // If the current selected value is not in the resourceGroups, reset the value to undefined
  useEffect(() => {
    if (
      controllableValue &&
      !_.some(
        resourceGroups,
        (item: { name: string }) => item.name === controllableValue,
      )
    ) {
      setControllableValueWithTransition(undefined);
    }
  }, [resourceGroups, controllableValue, setControllableValueWithTransition]);

  // Auto select is only executed once
  const autoSelectedResourceGroup =
    _.find(resourceGroups, (item) => item.name === 'default') ||
    resourceGroups[0];
  const autoSelectedOption = autoSelectedResourceGroup
    ? {
        label: autoSelectedResourceGroup.name,
        value: autoSelectedResourceGroup.name,
      }
    : undefined;

  useEffect(() => {
    if (
      autoSelectDefault &&
      autoSelectedOption &&
      autoSelectedOption.value !== selectProps.value
    ) {
      setControllableValueWithTransition(
        autoSelectedOption.value,
        autoSelectedOption,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);

  const searchProps: Pick<
    SelectProps,
    'onSearch' | 'searchValue' | 'showSearch'
  > = selectProps.showSearch
    ? {
        onSearch: setControllableSearchValue,
        searchValue: controllableSearchValue,
        showSearch: true,
      }
    : {};

  return (
    <Select
      defaultActiveFirstOption
      {...searchProps}
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      loading={loading || isPendingChangeTransition || isHostsLoading}
      disabled={isPendingChangeTransition}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup.name, label: resourceGroup.name };
      })}
      optionRender={(option) => {
        return (
          <TextHighlighter keyword={controllableSearchValue}>
            {option.data.value?.toString()}
          </TextHighlighter>
        );
      }}
      {...selectProps}
      value={isPendingChangeTransition ? optimisticValue : controllableValue}
      onChange={setControllableValueWithTransition}
    />
  );
};

export default ResourceGroupSelect;
