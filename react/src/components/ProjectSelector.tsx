import React from 'react';
import graphql from 'babel-plugin-relay/macro';
import { useLazyLoadQuery } from 'react-relay';
import { ProjectSelectorQuery } from './__generated__/ProjectSelectorQuery.graphql';

import _ from 'lodash';
import { Select, SelectProps } from 'antd';
import { useTranslation } from 'react-i18next';

interface Props extends SelectProps {
  onSelectProject?: (project: any) => void;
  domain: string;
}

const ProjectSelector: React.FC<Props> = ({
  onSelectProject,
  domain,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const { projects } = useLazyLoadQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery($domain_name: String) {
        projects: groups(domain_name: $domain_name, is_active: true) {
          id
          is_active
          name
          resource_policy
        }
      }
    `,
    {
      domain_name: domain,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );
  return (
    <Select
      onChange={(value, option) => {
        onSelectProject?.(option);
      }}
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      {...selectProps}
    >
      {_.map(projects, (project) => {
        return (
          <Select.Option
            key={project?.id}
            projectId={project?.id}
            projectResourcePolicy={project?.resource_policy}
          >
            {project?.name}
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ProjectSelector;
