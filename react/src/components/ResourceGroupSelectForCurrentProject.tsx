import { useSuspendedBackendaiClient } from '../hooks';
import {
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import TextHighlighter from './TextHighlighter';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useTransition } from 'react';

interface ResourceGroupSelectForCurrentProjectProps
  extends Omit<
    SelectProps,
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
    useControllableValue<string>(
      _.omitBy(
        {
          value: searchValue,
          onChange: onSearch,
        },
        _.isUndefined,
      ),
    );
  const [currentResourceGroup, setCurrentResourceGroup] =
    useCurrentResourceGroupState();

  const [controllableValue, setControllableValue] = useControllableValue({
    value: currentResourceGroup,
    onChange: selectProps.onChange,
  });

  const [isPendingLoading, startLoadingTransition] = useTransition();
  const { resourceGroups } = useResourceGroupsForCurrentProject();

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
      // onDropdownVisibleChange={(open) => {
      //   if (open) {
      //     startLoadingTransition(() => {
      //       checkUpdate();
      //     });
      //   }
      // }}
      loading={isPendingLoading}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup.name, label: resourceGroup.name };
      })}
      optionRender={(option) => {
        return (
          <TextHighlighter keyword={controllableSearchValue}>
            {option.data.value}
          </TextHighlighter>
        );
      }}
      {...selectProps}
      value={controllableValue}
      onChange={(value) => {
        startLoadingTransition(() => {
          setCurrentResourceGroup(value);
          setControllableValue(value);
        });
      }}
    />
  );
};

export default ResourceGroupSelectForCurrentProject;
