/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import useControllableState_deprecated from '../hooks/useControllableState';
import {
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import TextHighlighter from './TextHighlighter';
import { BAISelect, BAISelectProps } from 'backend.ai-ui';
import _ from 'lodash';
import React, { useState, useTransition } from 'react';

interface ResourceGroupSelectForCurrentProjectProps extends Omit<
  BAISelectProps,
  'defaultValue' | 'value' | 'allowClear' | 'onClear' | 'onChange'
> {
  onChangeInTransition?: BAISelectProps['onChange'];
}

const SharedResourceGroupSelectForCurrentProject: React.FC<
  ResourceGroupSelectForCurrentProjectProps
> = ({
  // filter,
  showSearch,
  onChangeInTransition,
  loading,
  ...selectProps
}) => {
  useSuspendedBackendaiClient(); // To make sure the client is ready
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableState_deprecated<string>({
      value:
        typeof showSearch === 'object' ? showSearch.searchValue : undefined,
      onChange:
        typeof showSearch === 'object' ? showSearch.onSearch : undefined,
    });
  const [currentResourceGroup, setCurrentResourceGroup] =
    useCurrentResourceGroupState();

  const [isPendingLoading, startLoadingTransition] = useTransition();
  const { nonSftpResourceGroups } = useResourceGroupsForCurrentProject();
  const [optimisticValue, setOptimisticValue] = useState(currentResourceGroup);

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
      showSearch={
        showSearch
          ? {
              onSearch: setControllableSearchValue,
              searchValue: controllableSearchValue,
            }
          : undefined
      }
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
