import { useProjectResourceGroups } from '../hooks';
import BAISelect, { BAISelectProps } from './BAISelect';
import BAITextHighlighter from './BAITextHighlighter';
import { useControllableValue } from 'ahooks';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';

interface BAIProjectResourceGroupSelectProps extends BAISelectProps {
  projectName: string;
  autoSelectDefault?: boolean;
  filter?: (resourceGroupName: string) => boolean;
}

const BAIProjectResourceGroupSelect: React.FC<
  BAIProjectResourceGroupSelectProps
> = ({
  projectName,
  autoSelectDefault,
  filter,
  showSearch,
  loading,
  ...selectProps
}) => {
  const [controllableSearchValue, setControllableSearchValue] =
    useControllableValue<string>({
      value:
        typeof showSearch === 'object' ? showSearch?.searchValue : undefined,
      onChange:
        typeof showSearch === 'object' ? showSearch?.onSearch : undefined,
    });

  const [controllableValue, setControllableValueDoNotUseWithoutTransition] =
    useControllableValue(selectProps);
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

  const { resourceGroups } = useProjectResourceGroups(projectName, { filter });

  // If the current selected value is not in the resourceGroups, reset the value to undefined
  useEffect(() => {
    if (
      controllableValue &&
      !_.some(resourceGroups, (item) => item.name === controllableValue)
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

  return (
    <BAISelect
      defaultActiveFirstOption
      showSearch={
        showSearch
          ? {
              searchValue: controllableSearchValue,
              onSearch: setControllableSearchValue,
            }
          : undefined
      }
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      loading={loading || isPendingChangeTransition}
      disabled={isPendingChangeTransition}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup.name, label: resourceGroup.name };
      })}
      optionRender={(option) => {
        return (
          <BAITextHighlighter keyword={controllableSearchValue}>
            {option.data.value?.toString()}
          </BAITextHighlighter>
        );
      }}
      {...selectProps}
      value={isPendingChangeTransition ? optimisticValue : controllableValue}
      onChange={setControllableValueWithTransition}
    />
  );
};

export default BAIProjectResourceGroupSelect;
