import { useSuspendedBackendaiClient } from '../hooks';
import useControllableState_deprecated from '../hooks/useControllableState';
import {
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import BAISelect, { BAISelectProps } from './BAISelect';
import TextHighlighter from './TextHighlighter';
import { SelectProps } from 'antd';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';

interface ResourceGroupSelectForCurrentProjectProps
  extends Omit<
    BAISelectProps,
    'defaultValue' | 'value' | 'allowClear' | 'onClear' | 'onChange'
  > {
  onChangeInTransition?: BAISelectProps['onChange'];
}

const SharedResourceGroupSelectForCurrentProject: React.FC<
  ResourceGroupSelectForCurrentProjectProps
> = ({
  // filter,
  searchValue,
  onSearch,
  onChangeInTransition,
  loading,
  ...selectProps
}) => {
  useSuspendedBackendaiClient(); // To make sure the client is ready
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState_deprecated<string>({
      value: searchValue,
      onChange: onSearch,
    });
  const [currentResourceGroup, setCurrentResourceGroup] =
    useCurrentResourceGroupState();

  const [isPendingLoading, startLoadingTransition] = useTransition();
  const { nonSftpResourceGroups } = useResourceGroupsForCurrentProject();
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
      loading={isPendingLoading || loading}
      options={_.map(nonSftpResourceGroups, (resourceGroup) => {
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
      onChange={(value, option) => {
        setOptimisticValue(value);
        startLoadingTransition(() => {
          setCurrentResourceGroup(value);
          onChangeInTransition?.(value, option);
        });
      }}
    />
  );
};

export default SharedResourceGroupSelectForCurrentProject;
