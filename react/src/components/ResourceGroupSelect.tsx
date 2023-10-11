import { useBaiSignedRequestWithPromise } from '../helper';
import { useCurrentProjectValue, useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { ResourceGroupSelectorQuery } from './__generated__/ResourceGroupSelectorQuery.graphql';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { startTransition, useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';

interface ResourceGroupSelectorProps extends SelectProps {
  projectId?: string;
  autoSelectDefault?: boolean;
  filter?: (projectName: string) => boolean;
}

const ResourceGroupSelector: React.FC<ResourceGroupSelectorProps> = ({
  projectId,
  autoSelectDefault,
  filter,
  ...selectProps
}) => {
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const currentProject = useCurrentProjectValue();
  let { scaling_groups_for_user_group: resourceGroups } =
    useLazyLoadQuery<ResourceGroupSelectorQuery>(
      graphql`
        query ResourceGroupSelectorQuery($user_group: String!) {
          scaling_groups_for_user_group(user_group: $user_group) {
            name
          }
        }
      `,
      {
        user_group: currentProject?.id,
      },
    );

  const [key, checkUpdate] = useUpdatableState('first');

  // TODO: Delete these codes after backend.ai support scaling groups filtering.
  // ================================ START ====================================
  const { data } = useTanQuery({
    queryKey: ['FolderHostsQuery', key],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders/_/hosts`,
      }) as Promise<{
        allowed: string[];
        default: string;
        volume_info: object;
      }>;
    },
    staleTime: 0,
  });

  const sftpResourceGroups =
    (data &&
      Object.values(data.volume_info).map(
        (item: any) => item?.sftp_scaling_groups.join(', '),
      )) ||
    [];

  resourceGroups = _.filter(resourceGroups, (resourceGroup) => {
    if (resourceGroup && resourceGroup.name) {
      return !sftpResourceGroups.includes(resourceGroup.name);
    }
    return false;
  }) as { name: string }[];
  // ================================ END ======================================

  const autoSelectedOption =
    resourceGroups && resourceGroups[0]
      ? {
          label: resourceGroups[0].name,
          value: resourceGroups[0].name,
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
      defaultValue={autoSelectDefault ? autoSelectedOption : undefined}
      onDropdownVisibleChange={(open) => {
        if (open) {
          startTransition(() => {
            checkUpdate();
          });
        }
      }}
      {...selectProps}
    >
      {_.map(resourceGroups, (resourceGroup, idx) => {
        return (
          <Select.Option key={resourceGroup?.name} value={resourceGroup?.name}>
            {resourceGroup?.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ResourceGroupSelector;
