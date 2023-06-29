import React, { useState } from "react";
import graphql from "babel-plugin-relay/macro";
import { useFragment, useLazyLoadQuery } from "react-relay";

import { Select, SelectProps, Spin } from "antd";
import { ProjectSelectorQuery } from "./__generated__/ProjectSelectorQuery.graphql";
import _ from "lodash";

interface Props extends SelectProps {
  onChange?: (value: string) => void;
}

const ProjectSelector: React.FC<Props> = ({ onChange, ...selectProps }) => {
  const { projects } = useLazyLoadQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery {
        projects: scaling_groups(is_active: true) {
          name
          is_active
          is_public
        }
      }
    `,
    {
      // name: "default",
    },
    {
      fetchPolicy: "store-and-network",
    }
  );
  return (
    <Select
      labelInValue
      filterOption={false}
      onChange={(value) => {
        onChange?.(value);
      }}
      showSearch
      {...selectProps}
      // notFoundContent={fetching ? <Spin size="small" /> : null}
    >
      {_.map(projects, (project) => {
        return (
          <Select.Option key={project?.name}>{project?.name}</Select.Option>
        );
      })}
    </Select>
  );
};

export default ProjectSelector;
