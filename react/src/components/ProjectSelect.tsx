/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ProjectSelectorQuery } from '../__generated__/ProjectSelectorQuery.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { useCurrentUserInfo, useCurrentUserRole } from '../hooks/backendai';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentUserProjectRoles } from '../hooks/useCurrentUserProjectRoles';
import { InfoCircleOutlined } from '@ant-design/icons';
import { theme, Tooltip } from 'antd';
import { BAIFlex, BAISelect, BAISelectProps } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ShieldUser } from 'lucide-react';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

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
  lockedProjectTypes?: string[];
  'aria-label'?: string;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  onSelectProject,
  domain,
  disableDefaultFilter,
  lockedProjectTypes,
  'aria-label': ariaLabel,
  ...selectProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [currentUser] = useCurrentUserInfo();
  const baiClient = useSuspendedBackendaiClient();
  const blockList = baiClient?._config?.blockList ?? null;

  const [value, setValue] = useControllableState_deprecated(selectProps);
  const userRole = useCurrentUserRole();
  const { projectAdminIds } = useCurrentUserProjectRoles();
  const { groups, user } = useLazyLoadQuery<ProjectSelectorQuery>(
    graphql`
      query ProjectSelectorQuery(
        $domain_name: String
        $email: String
        $type: [String]
      ) {
        groups(domain_name: $domain_name, is_active: true, type: $type) {
          id
          is_active
          name
          resource_policy
          type
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
      fetchPolicy: 'network-only',
    },
  );

  // temporary filtering groups by accessible groups according to user query
  const accessibleProjects = disableDefaultFilter
    ? groups
    : groups?.filter((project) =>
        user?.groups?.map((group) => group?.id).includes(project?.id),
      );

  const lockedProjectIds = !lockedProjectTypes?.length
    ? []
    : (_.compact(
        _.map(
          _.filter(accessibleProjects, (p) =>
            lockedProjectTypes.includes(p?.type ?? ''),
          ),
          'id',
        ),
      ) as string[]);

  // Auto-select locked projects when they become available
  const autoSelectLockedProjects = useEffectEvent(() => {
    if (lockedProjectIds.length > 0) {
      const currentVal = _.isArray(value) ? (value as string[]) : [];
      const missing = lockedProjectIds.filter((id) => !currentVal.includes(id));
      if (missing.length > 0) {
        setValue([...currentVal, ...missing]);
      }
    }
  });

  const lockedProjectIdsKey = lockedProjectIds.join(',');
  useEffect(() => {
    autoSelectLockedProjects();
  }, [lockedProjectIdsKey]);

  const getLabel = (key: string) =>
    ({
      GENERAL: t('general.General'),
      MODEL_STORE: t('data.ModelStore'),
    })[key] || key;

  const groupOptions = _.map(
    _.groupBy(accessibleProjects, 'type'),
    (value, key) => {
      return {
        label: getLabel(key),
        title: key,
        options: _.map(_.sortBy(value, 'name'), (project) => {
          const showBadge =
            !!project?.id && projectAdminIds.includes(project.id);
          return {
            label: showBadge ? (
              <BAIFlex gap={token.marginXS} align="center">
                <span>{project?.name}</span>
                <Tooltip title={t('projectSelect.ProjectAdminBadge')}>
                  <ShieldUser />
                </Tooltip>
              </BAIFlex>
            ) : (
              project?.name
            ),
            value: project?.id,
            projectId: project?.id,
            projectResourcePolicy: project?.resource_policy,
            projectName: project?.name,
            disabled: lockedProjectIds.includes(project?.id ?? ''),
          };
        }),
      };
    },
  );

  const showNoProjectError =
    !accessibleProjects?.length &&
    !selectProps.disabled &&
    !selectProps.loading;

  const noAccessibleProjectsMessage = t('projectSelect.NoAccessibleProjects');

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
      showSearch={{
        optionFilterProp: 'projectName',
      }}
      options={
        _.size(groupOptions) > 1 ? groupOptions : groupOptions[0]?.options
      }
      status={showNoProjectError ? 'error' : selectProps.status}
      // Surface the empty-state reason on the focusable control itself,
      // not only on the non-focusable suffix icon. `tooltip` wraps the
      // whole BAISelect in an antd Tooltip (hover over the entire control,
      // not just the tiny icon), and `aria-label` gives keyboard /
      // screen-reader users a persistent accessible description that does
      // not depend on the tooltip being open.
      tooltip={
        showNoProjectError ? noAccessibleProjectsMessage : selectProps.tooltip
      }
      aria-label={showNoProjectError ? noAccessibleProjectsMessage : ariaLabel}
      suffixIcon={
        showNoProjectError ? <InfoCircleOutlined /> : selectProps.suffixIcon
      }
      // Prevent the dropdown from opening in the empty-error state so it
      // does not visually overlap the explanation tooltip. The tooltip
      // alone communicates why the control is unusable; an empty popup
      // beneath it just looks broken.
      open={showNoProjectError ? false : selectProps.open}
    />
  );
};

export default ProjectSelect;
