import { ProjectSelectorQuery } from './__generated__/ProjectSelectorQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

interface Props extends SelectProps {
  onSelectProject?: (project: any) => void;
  domain: string;
  autoSelectDefault?: boolean;
}

const ProjectSelector: React.FC<Props> = ({
  onSelectProject,
  domain,
  autoClearSearchValue,
  ...selectProps
}) => {
  const { t } = useTranslation();

  const [value, setValue] = useControllableValue(selectProps);
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

  useEffect(() => {
    if (
      autoClearSearchValue &&
      !value &&
      projects?.length &&
      projects?.length > 0
    ) {
      alert(projects[0]?.id);
      setValue(projects[0]?.id);
    }
  });
  return (
    <Select
      onChange={(value, option) => {
        setValue(value);
        onSelectProject?.(option);
      }}
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      {...selectProps}
      value={value}
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
