import { useSuspendedBackendaiClient } from '../hooks';
import useControllableState from '../hooks/useControllableState';
import {
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import BAISelect, { BAISelectProps } from './BAISelect';
import TextHighlighter from './TextHighlighter';
import { SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';

interface ResourceGroupSelectForCurrentProjectProps
  extends Omit<
    BAISelectProps,
    'defaultValue' | 'value' | 'allowClear' | 'onClear'
  > {
  // filter?: (projectName: string) => boolean;
}

const ResourceGroupSelectForCurrentProject: React.FC<
  ResourceGroupSelectForCurrentProjectProps
> = ({
  // filter,
  searchValue,
  onSearch,
  ...selectProps
}) => {
  useSuspendedBackendaiClient(); // To make sure the client is ready
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState<string>({
      value: searchValue,
      onChange: onSearch,
    });
  const [currentResourceGroup, setCurrentResourceGroup] =
    useCurrentResourceGroupState();

  // The onChange event should be triggered in useEffect
  // because the value is controlled by global state,
  // and the change of the value does not trigger the onChange event.
  useEffect(
    () => {
      selectProps.onChange?.(currentResourceGroup, {
        value: currentResourceGroup,
        label: currentResourceGroup,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentResourceGroup],
  );

  const [isPendingLoading, startLoadingTransition] = useTransition();
  const { resourceGroups } = useResourceGroupsForCurrentProject();
  const [optimisticValue, setOptimisticValue] = useState(currentResourceGroup);

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
      loading={isPendingLoading}
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
      {...searchProps}
      {...selectProps}
      disabled={isPendingLoading}
      value={isPendingLoading ? optimisticValue : currentResourceGroup}
      onChange={(value) => {
        setOptimisticValue(value);
        startLoadingTransition(() => {
          setCurrentResourceGroup(value);
        });
      }}
    />
  );
};

export default ResourceGroupSelectForCurrentProject;
