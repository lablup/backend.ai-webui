import React from "react";
import graphql from "babel-plugin-relay/macro";
import { useLazyLoadQuery } from "react-relay";
import { ProjectSelectorQuery } from "./__generated__/ProjectSelectorQuery.graphql";

import _ from "lodash";
import { Select, SelectProps } from "antd";
import { useTranslation } from "react-i18next";
import { useCurrentProjectValue } from "../hooks";

interface Props extends SelectProps {
  onChange?: (value: string) => void;
}

const ProjectSelector: React.FC<Props> = ({ onChange, ...selectProps }) => {
  const { t } = useTranslation();
  const curProject = useCurrentProjectValue();

  const { projects } = useLazyLoadQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery (
        $domain_name: String
      ) {
        projects: groups(domain_name: $domain_name, is_active: true) {
          id
          name
          is_active
        }
      }
    `,
    {
      domain_name: curProject?.name
    },
    {
      fetchPolicy: "store-and-network",
    }
  );
  return (
    <Select
      labelInValue
      onChange={(value) => {
        onChange?.(value?.key);
      }}
      allowClear
      showSearch
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      {...selectProps}
    >
      {_.map(projects, (project) => {
        return (
          <Select.Option key={project?.id} value={project?.id}>{project?.name}</Select.Option>
        );
      })}
    </Select>
  );
};

export default ProjectSelector;
