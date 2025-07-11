import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState from '../hooks/useControllableState';
import BAISelect, { BAISelectProps } from './BAISelect';
import TextHighlighter from './TextHighlighter';
import { SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect, useState, useTransition } from 'react';

interface ResourceGroupSelectProps extends BAISelectProps {
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

  const { data: resourceGroupSelectQueryResult } = useSuspenseTanQuery<
    [
      {
        scaling_groups: {
          name: string;
        }[];
      },
      {
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
      },
    ]
  >({
    queryKey: ['ResourceGroupSelectQuery', projectName],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group', projectName);
      return Promise.all([
        baiRequestWithPromise({
          method: 'GET',
          url: `/scaling-groups?${search.toString()}`,
        }),
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders/_/hosts`,
        }),
      ]);
    },
    staleTime: 0,
    fetchKey: fetchKey,
  });

  const sftpResourceGroups = _.flatMap(
    resourceGroupSelectQueryResult?.[1].volume_info,
    (item) => item?.sftp_scaling_groups ?? [],
  );

  const resourceGroups = _.filter(
    resourceGroupSelectQueryResult?.[0].scaling_groups,
    (item) => {
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
