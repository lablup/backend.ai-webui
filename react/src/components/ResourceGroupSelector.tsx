import { Select } from "antd";
import React from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import _ from "lodash";
import {
  ResourceGroupSelectorQuery,
  ResourceGroupSelectorQuery$data,
} from "./__generated__/ResourceGroupSelectorQuery.graphql";
import { useCurrentProjectValue } from "../hooks";

type Project = NonNullable<
  NonNullable<ResourceGroupSelectorQuery$data>["scaling_groups_for_user_group"]
>[0];

interface ResourceGroupSelectorProps {
  projectId?: string;
  filter: (project: Project) => boolean;
}

const ResourceGroupSelector: React.FC<ResourceGroupSelectorProps> = ({
  projectId,
  filter,
}) => {
  const currentProject = useCurrentProjectValue();
  const { scaling_groups_for_user_group: projects } =
    useLazyLoadQuery<ResourceGroupSelectorQuery>(
      graphql`
        query ResourceGroupSelectorQuery($projectId: String!) {
          scaling_groups_for_user_group(
            user_group: $projectId
            is_active: true
          ) {
            name
            is_public
          }
        }
      `,
      {
        projectId: projectId || currentProject.id,
      }
    );

  const filteredProjects = _.filter(projects, filter || (() => true));
  console.log(filteredProjects);
  return (
    <Select>
      {_.map(filteredProjects, (project, idx) => {
        return (
          <Select.Option key={project?.name} value={project?.name}>
            {project?.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ResourceGroupSelector;
