import { useProjectResourceGroups } from '../hooks';
import BAISelect, { BAISelectProps } from './BAISelect';
import BAITextHighlighter from './BAITextHighlighter';
import { useControllableValue } from 'ahooks';
import * as _ from 'lodash-es';
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

  // If the loaded resource group list does not contain the current value, reset to undefined.
  // Guard on resourceGroups.length > 0 so we don't wipe a pre-filled value while the list
  // is still loading — an empty list means "not yet fetched", not "no valid groups".
  useEffect(() => {
    if (
      controllableValue &&
      resourceGroups.length > 0 &&
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
    if (autoSelectDefault && autoSelectedOption && !controllableValue) {
      setControllableValueWithTransition(
        autoSelectedOption.value,
        autoSelectedOption,
      );
    }
    // controllableValue is intentionally excluded from deps — we only want
    // to fire when the available options first appear (autoSelectedOption?.value
    // transitions from undefined→name), not on every selection change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault, autoSelectedOption?.value]);

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
