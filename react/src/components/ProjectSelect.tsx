import { ProjectSelectorQuery } from '../__generated__/ProjectSelectorQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import useControllableState from '../hooks/useControllableState';
import BAISelect, { BAISelectProps } from './BAISelect';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

type ProjectInfo = {
  label: React.ReactNode;
  value: string | number;
  projectId: string;
  projectResourcePolicy: any; // Replace 'any' with the actual type
  projectName: string;
};
export interface ProjectSelectProps extends BAISelectProps {
  onSelectProject?: (projectInfo: ProjectInfo) => void;
  domain: string;
  autoSelectDefault?: boolean;
  disableDefaultFilter?: boolean;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  onSelectProject,
  domain,
  autoClearSearchValue,
  disableDefaultFilter,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const blockList = baiClient?._config?.blockList ?? null;

  const [value, setValue] = useControllableState(selectProps);
  const userRole = useCurrentUserRole();
  const { projectsSince2403, projectsBefore2403, user } =
    useLazyLoadQuery<ProjectSelectorQuery>(
      graphql`
        query ProjectSelectorQuery(
          $domain_name: String
          $email: String
          $type: [String]
        ) {
          projectsSince2403: groups(
            domain_name: $domain_name
            is_active: true
            type: $type
          ) @since(version: "24.03.0") {
            id
            is_active
            name
            resource_policy
            type
          }
          projectsBefore2403: groups(
            domain_name: $domain_name
            is_active: true
          ) @deprecatedSince(version: "24.03.0") {
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
        type:
          (userRole === 'admin' || userRole === 'superadmin') &&
          _.includes(blockList, 'model-store')
            ? ['GENERAL']
            : ['GENERAL', 'MODEL_STORE'],
      },
      {
        fetchPolicy: 'store-and-network',
      },
    );
  const projects = projectsSince2403 || projectsBefore2403;

  // temporary filtering groups by accessible groups according to user query
  const accessibleProjects = disableDefaultFilter
    ? projects
    : projects?.filter((project) =>
        user?.groups?.map((group) => group?.id).includes(project?.id),
      );

  const getLabel = (key: string) =>
    ({
      GENERAL: t('general.General'),
      MODEL_STORE: t('data.ModelStore'),
    })[key] || key;

  const groupOptions = _.chain(accessibleProjects)
    .groupBy('type')
    .map((value, key) => {
      return {
        label: getLabel(key),
        title: key,
        options: _.chain(value)
          .sortBy('name')
          .map((project) => {
            return {
              label: project?.name,
              value: project?.id,
              projectId: project?.id,
              projectResourcePolicy: project?.resource_policy,
              projectName: project?.name,
            };
          })
          .value(),
      };
    })
    .value();

  return (
    <BAISelect
      onChange={(value, option) => {
        setValue(value);
        onSelectProject?.(option as ProjectInfo);
      }}
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      popupMatchSelectWidth={false}
      {...selectProps}
      value={value}
      optionFilterProp="projectName"
      options={
        _.size(groupOptions) > 1 ? groupOptions : groupOptions[0]?.options
      }
      style={{}}
    />
  );
};

export default ProjectSelect;
