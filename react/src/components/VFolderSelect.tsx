import { useBaiSignedRequestWithPromise } from '../helper';
import { useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { Select, SelectProps } from 'antd';
import _ from 'lodash';
import React, { startTransition, useEffect } from 'react';

export type VFolder = {
  name: string;
  id: string;
  row_id?: string;
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
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  filter,
  autoSelectDefault,
  ...selectProps
}) => {
  const currentProject = useCurrentProjectValue();
  const baiRequestWithPromise = useBaiSignedRequestWithPromise();
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
  // console.log("vfolder_list", vfolder_list);
  const [key, checkUpdate] = useUpdatableState('first');

  const { data } = useTanQuery({
    queryKey: ['VFolderSelectQuery', key],
    queryFn: () => {
      return baiRequestWithPromise({
        method: 'GET',
        url: `/folders?group_id=${currentProject.id}`,
      }) as Promise<VFolder[]>;
    },
    staleTime: 0,
  });

  const filteredVFolders = filter ? _.filter(data, filter) : data;

  const autoSelectedOption = _.first(filteredVFolders)
    ? {
        label: _.first(filteredVFolders)?.name,
        value: _.first(filteredVFolders)?.name,
      }
    : undefined;
  useEffect(() => {
    if (autoSelectDefault && autoSelectedOption) {
      selectProps.onChange?.(autoSelectedOption.value, autoSelectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelectDefault]);
  return (
    <Select
      showSearch
      {...selectProps}
      onDropdownVisibleChange={(open) => {
        if (open) {
          startTransition(() => {
            checkUpdate();
          });
        }
      }}
    >
      {_.map(filteredVFolders, (vfolder) => {
        return (
          <Select.Option key={vfolder?.id} value={vfolder?.name}>
            {vfolder?.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default VFolderSelect;
