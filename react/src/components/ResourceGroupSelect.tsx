import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import TextHighlighter from './TextHighlighter';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { useState, useEffect, useTransition } from 'react';

interface ResourceGroupSelectProps extends SelectProps {
  projectId?: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelect: React.FC<ResourceGroupSelectProps> = ({
  projectId,
  autoSelectDefault,
  filter,
  loading,
  ...selectProps
}) => {
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentProject = useCurrentProjectValue();
  const [key, checkUpdate] = useUpdatableState('first');
  const [groupSearch, setGroupSearch] = useState('');

  const [isPendingLoading, startLoadingTransition] = useTransition();
  const { data: resourceGroupSelectQueryResult } = useTanQuery<
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
    queryKey: ['ResourceGroupSelectQuery', key, currentProject.name],
    queryFn: () => {
      return Promise.all([
        baiRequestWithPromise({
          method: 'GET',
          url: `/scaling-groups?group=${currentProject.name}`,
        }),
        baiRequestWithPromise({
          method: 'GET',
          url: `/folders/_/hosts`,
        }),
      ]);
    },
    staleTime: 0,
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
      selectProps.onChange?.(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);

  return (
    <Select
      defaultActiveFirstOption
      showSearch
      onSearch={(value) => setGroupSearch(value)}
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      onDropdownVisibleChange={(open) => {
        if (open) {
          startLoadingTransition(() => {
            checkUpdate();
          });
        }
      }}
      loading={isPendingLoading || loading}
      options={_.map(resourceGroups, (resourceGroup) => {
        return { value: resourceGroup.name, label: resourceGroup.name };
      })}
      optionRender={(option) => {
        return (
          <TextHighlighter keyword={groupSearch}>
            {option.data.value}
          </TextHighlighter>
        );
      }}
      {...selectProps}
    />
  );
};

export default ResourceGroupSelect;
