import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import useControllableState from '../hooks/useControllableState';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { startTransition, useEffect } from 'react';

export type VFolder = {
  name: string;
  id: string;
  quota_scope_id: string;
  host: string;
  status: string;
  usage_mode: string;
  created_at: string;
  is_owner: boolean;
  permission: string;
  user: null;
  group: string | null;
  creator: string;
  user_email: null;
  group_name: string | null;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
};

interface VFolderSelectProps extends SelectProps {
  autoSelectDefault?: boolean;
  valuePropName?: 'id' | 'name';
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  filter,
  autoSelectDefault,
  valuePropName = 'name',
  ...selectProps
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
  const [value, setValue] = useControllableState(selectProps);
  // const { vfolder_list } = useLazyLoadQuery<VFolderSelectQuery>(
  //   graphql`
  //     # query VFolderSelectQuery($group_id: UUID) {
  //     query VFolderSelectQuery {
  //       vfolder_list(limit: 20, offset: 0) {
  //         # vfolder_list(limit: 20, offset: 0, group_id: $group_id) {
  //         items {
  //           id
  //           name
  //           status
  //           usage_mode
  //           ownership_type
  //           user_email
  //           group
  //           group_name
  //         }
  //         total_count
  //       }
  //     }
  //   `,
  //   {
  //     // group_id: currentProject.id,
  //   },
  //   {
  //     fetchPolicy: "store-and-network",
  //   }
  // );
  const [key, checkUpdate] = useUpdatableState('first');

  const { data } = useSuspenseTanQuery({
    queryKey: ['VFolderSelectQuery', key],
    queryFn: () => {
      const search = new URLSearchParams();
      search.set('group_id', currentProject.id);
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?${search.toString()}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 0,
  });

  const filteredVFolders = filter ? _.filter(data, filter) : data;

  const autoSelectedOption = _.first(filteredVFolders)
    ? {
        label: _.first(filteredVFolders)?.name,
        value: _.first(filteredVFolders)?.[valuePropName],
      }
    : undefined;
  useEffect(() => {
    if (autoSelectDefault && autoSelectedOption) {
      setValue(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);
  return (
    <Select
      showSearch
      optionFilterProp={'label'}
      {...selectProps}
      value={value}
      onChange={setValue}
      onDropdownVisibleChange={(open) => {
        if (open) {
          startTransition(() => {
            checkUpdate();
          });
        }
      }}
      options={_.map(filteredVFolders, (vfolder) => {
        return {
          label: vfolder?.name,
          value: vfolder?.[valuePropName],
        };
      })}
    />
  );
};

export default VFolderSelect;
