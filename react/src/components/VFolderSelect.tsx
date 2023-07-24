import { Select, SelectProps } from "antd";
import React from "react";
import { useLazyLoadQuery } from "react-relay";
import { useQuery as useTanQuery } from "react-query";
import graphql from "babel-plugin-relay/macro";
import { VFolderSelectQuery } from "./__generated__/VFolderSelectQuery.graphql";
import _ from "lodash";
import { useCurrentProjectValue } from "../hooks";
import { useBaiSignedRequestWithPromise } from "../helper";

type VFolder = {
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
  group: string;
  creator: string;
  user_email: null;
  group_name: string;
  ownership_type: string;
  type: string;
  cloneable: boolean;
  max_files: number;
  max_size: null | number;
  cur_size: number;
};

interface VFolderSelectProps extends SelectProps {
  filter?: (vFolder: VFolder) => boolean;
}

const VFolderSelect: React.FC<VFolderSelectProps> = ({
  filter,
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

  const { data } = useTanQuery({
    queryKey: "VFolderSelectQuery",
    queryFn: () => {
      return baiRequestWithPromise({
        method: "GET",
        url: `/folders?group_id=${currentProject.id}`,
      }) as Promise<VFolder[]>;
    },
  });

  const filteredVFolders = filter ? _.filter(data, filter) : data;
  return (
    <Select showSearch {...selectProps}>
      {_.map(filteredVFolders, (vfolder) => {
        return (
          <Select.Option value={vfolder?.name}>{vfolder?.name}</Select.Option>
        );
      })}
    </Select>
  );
};

export default VFolderSelect;
