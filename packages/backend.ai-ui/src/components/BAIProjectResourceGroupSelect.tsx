import { useControllableValue, useProjectResourceGroups } from '../hooks';
import BAISelect, { BAISelectProps } from './BAISelect';
import * as _ from 'lodash-es';
import React, { useEffect, useState, useTransition } from 'react';

interface BAIProjectResourceGroupSelectProps extends Omit<
  BAISelectProps,
  'options'
> {
  projectName: string;
  autoSelectDefault?: boolean;
  filter?: (resourceGroupName: string) => boolean;
  /**
   * List the SFTP-designated resource groups too. They are reserved for
   * SSH/SFTP system sessions, so every other caller leaves this off (FR-3996).
   */
  includeSFTPResourceGroups?: boolean;
}

const BAIProjectResourceGroupSelect: React.FC<
  BAIProjectResourceGroupSelectProps
> = ({
  projectName,
  autoSelectDefault,
  filter,
  includeSFTPResourceGroups,
  isLoading,
  ...selectProps
}) => {
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

  const { resourceGroups } = useProjectResourceGroups(projectName, {
    filter,
    includeSFTPResourceGroups,
  });

  // If the loaded resource group list does not contain the current value, reset to undefined.
  // Guard on resourceGroups.length > 0 so we don't wipe a pre-filled value while the list
  // is still loading — an empty list means "not yet fetched", not "no valid groups".
  useEffect(() => {
    if (
      controllableValue &&
      resourceGroups.length > 0 &&
      !_.some(resourceGroups, (item) => item.name === controllableValue)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- transition-wrapped parent sync; can't run during render, no user event to move into
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- transition-wrapped auto-select; can't run during render, no user event to move into
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
      isLoading={isLoading || isPendingChangeTransition}
      disabled={isPendingChangeTransition}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup.name, label: resourceGroup.name };
      })}
      {...selectProps}
      value={isPendingChangeTransition ? optimisticValue : controllableValue}
      onChange={setControllableValueWithTransition}
    />
  );
};

export default BAIProjectResourceGroupSelect;
