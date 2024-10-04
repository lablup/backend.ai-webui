import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState from '../hooks/useControllableState';
import TextHighlighter from './TextHighlighter';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useEffect } from 'react';

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

  const [controllableValue, setControllableValue] =
    useControllableState(selectProps);

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

  useEffect(() => {
    if (
      controllableValue &&
      !_.some(resourceGroups, (item) => item.name === controllableValue)
    ) {
      setControllableValue(undefined);
    }
  }, [resourceGroups, controllableValue, setControllableValue]);
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
      setControllableValue(autoSelectedOption.value, autoSelectedOption);
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
      onDropdownVisibleChange={(open) => {
        // if (open) {
        //   startLoadingTransition(() => {
        //     updateFetchKey();
        //   });
        // }
      }}
      loading={loading}
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
      value={controllableValue}
      onChange={setControllableValue}
    />
  );
};

export default ResourceGroupSelect;
