import { ProjectSelectorQuery } from './__generated__/ProjectSelectorQuery.graphql';
import { useControllableValue } from 'ahooks';
import { Select, SelectProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type ProjectInfo = {
  label: React.ReactNode;
  value: string | number;
  projectId: string;
  projectResourcePolicy: any; // Replace 'any' with the actual type
  projectName: string;
};
interface Props extends SelectProps {
  onSelectProject?: (projectInfo: ProjectInfo) => void;
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
    <div data-testid="projectSelect">
      <Select
        onChange={(value, option) => {
          setValue(value);
          onSelectProject?.(option as ProjectInfo);
        }}
        placeholder={t('storageHost.quotaSettings.SelectProject')}
        {...selectProps}
        value={value}
        optionFilterProp="projectName"
        options={_.map(_.sortBy(projects, 'name'), (project) => {
          return {
            label: project?.name,
            value: project?.id,
            projectId: project?.id,
            id: project?.name,
            projectResourcePolicy: project?.resource_policy,
            projectName: project?.name,
          };
        })}
      />
    </div>
  );
};

export default ProjectSelector;
