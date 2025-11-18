import { ResourceGroupSelectQuery } from '../__generated__/ResourceGroupSelectQuery.graphql';
import { useBaiSignedRequestWithPromise } from '../helper';
import { INITIAL_FETCH_KEY, useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState_deprecated from '../hooks/useControllableState';
import BAISelect, { BAISelectProps } from './BAISelect';
import TextHighlighter from './TextHighlighter';
import { SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface VolumeInfo {
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups?: string[];
}

interface ResourceGroupSelectProps extends BAISelectProps {
  projectName?: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelect: React.FC<ResourceGroupSelectProps> = ({
  // projectName,
  autoSelectDefault,
  filter,
  searchValue,
  onSearch,
  loading,
  ...selectProps
}) => {
  'use memo';
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [fetchKey] = useUpdatableState(INITIAL_FETCH_KEY);
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState_deprecated<string>({
      value: searchValue,
      onChange: onSearch,
    });

  const [controllableValue, setControllableValueDoNotUseWithoutTransition] =
    useControllableState_deprecated(selectProps);
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

  // TODO: filter scaling groups by project name
  const { scaling_groups } = useLazyLoadQuery<ResourceGroupSelectQuery>(
    graphql`
      query ResourceGroupSelectQuery($is_active: Boolean) {
        scaling_groups(is_active: $is_active) {
          name
        }
      }
    `,
    {
      is_active: true,
    },
    {
      fetchPolicy:
        fetchKey === INITIAL_FETCH_KEY ? 'store-and-network' : 'network-only',
      fetchKey,
    },
  );

  // Keep the volume_info query as REST API since it's not available in GraphQL
  const { data: volumeInfoResponse } = useSuspenseTanQuery<{
    volume_info: { [key: string]: VolumeInfo };
  }>({
    queryKey: ['VolumeInfo', fetchKey],
    queryFn: () =>
      baiRequestWithPromise({
        method: 'GET',
        url: `/folders/_/hosts`,
      }),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    fetchKey,
  });

  const sftpResourceGroups = _.flatMap(
    volumeInfoResponse?.volume_info,
    (item) => item?.sftp_scaling_groups ?? [],
  );

  const resourceGroups = _.filter(scaling_groups, (item) => {
    if (_.includes(sftpResourceGroups, item?.name)) {
      return false;
    }
    if (filter && item?.name) {
      return filter(item.name);
    }
    return true;
  });

  // If the current selected value is not in the resourceGroups, reset the value to undefined
  useEffect(() => {
    if (
      controllableValue &&
      !_.some(resourceGroups, (item) => item?.name === controllableValue)
    ) {
      setControllableValueWithTransition(undefined);
    }
  }, [resourceGroups, controllableValue, setControllableValueWithTransition]);

  // Auto select is only executed once
  const autoSelectedResourceGroup =
    _.find(resourceGroups, (item) => item?.name === 'default') ||
    resourceGroups[0];
  const autoSelectedOption = autoSelectedResourceGroup?.name
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
    <BAISelect
      defaultActiveFirstOption
      {...searchProps}
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      loading={loading || isPendingChangeTransition}
      disabled={isPendingChangeTransition}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup?.name, label: resourceGroup?.name };
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
