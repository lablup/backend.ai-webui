import { Select } from "antd";
import React from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { VFolderSelectQuery } from "./__generated__/VFolderSelectQuery.graphql";
import _ from "lodash";
import { useCurrentProjectValue } from "../hooks";

const VFolderSelect = () => {
  const currentProject = useCurrentProjectValue();
  const { vfolder_list } = useLazyLoadQuery<VFolderSelectQuery>(
    graphql`
      # query VFolderSelectQuery($group_id: UUID) {
      query VFolderSelectQuery {
        vfolder_list(limit: 20, offset: 0) {
          # vfolder_list(limit: 20, offset: 0, group_id: $group_id) {
          items {
            id
            name
            status
            usage_mode
            ownership_type
            user_email
            group
            group_name
          }
          total_count
        }
      }
    `,
    {
      // group_id: currentProject.id,
    },
    {
      fetchPolicy: "store-and-network",
    }
  );
  console.log("vfolder_list", vfolder_list);
  return (
    <Select showSearch>
      {_.map(vfolder_list?.items, (vfolder) => {
        return (
          <Select.Option value={vfolder?.id}>{vfolder?.name}</Select.Option>
        );
      })}
    </Select>
  );
};

export default VFolderSelect;
