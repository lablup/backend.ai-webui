import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo } from '../hooks/backendai';
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
  const [currentUser] = useCurrentUserInfo();

  const [value, setValue] = useControllableValue(selectProps);
  const { projects, user } = useLazyLoadQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery($domain_name: String, $email: String) {
        projects: groups(domain_name: $domain_name, is_active: true) {
          id
          is_active
          name
          resource_policy
        }
        user(email: $email) {
          groups {
            id
            name
          }
        }
      }
    `,
    {
      domain_name: domain,
      email: currentUser.email,
    },
    {
      fetchPolicy: 'store-and-network',
    },
  );

  // temporary filtering groups by accessible groups according to user query
  const accessibleProjects = projects?.filter((project) =>
    user?.groups?.map((group) => group?.id).includes(project?.id),
  );

  useEffect(() => {
    if (
      autoClearSearchValue &&
      !value &&
      accessibleProjects?.length &&
      accessibleProjects?.length > 0
    ) {
      alert(accessibleProjects[0]?.id);
      setValue(accessibleProjects[0]?.id);
    }
  });
  return (
    <Select
      onChange={(value, option) => {
        setValue(value);
        onSelectProject?.(option as ProjectInfo);
      }}
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      {...selectProps}
      value={value}
      optionFilterProp="projectName"
      options={_.map(_.sortBy(accessibleProjects, 'name'), (project) => {
        return {
          label: project?.name,
          value: project?.id,
          projectId: project?.id,
          projectResourcePolicy: project?.resource_policy,
          projectName: project?.name,
        };
      })}
    />
  );
};

export default ProjectSelector;
