/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAccessibleProjects } from '../hooks/useAccessibleProjects';
import useControllableState_deprecated from '../hooks/useControllableState';
import { useCurrentUserProjectRoles } from '../hooks/useCurrentUserProjectRoles';
import type { SelectorOptionType } from '@lablup/ui-common/Selector';
import {
  BAIFlex,
  BAIIconWithTooltip,
  BAIMultiSelector,
  BAISelect,
  type BAIMultiSelectorProps,
  type BAISelectProps,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { ShieldUser } from 'lucide-react';
import React, { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

type ProjectInfo = {
  label: React.ReactNode;
  value: string;
  projectId: string;
  projectResourcePolicy: any; // Replace 'any' with the actual type
  projectName: string;
};

interface ProjectOptionsInput {
  domain: string;
  disableDefaultFilter?: boolean;
  lockedProjectTypes?: string[];
  /** The user's personal project, which the domain's option list never
   * contains. */
  personalProject?: { id: string; name: string };
  /** Whether the personal project is a locked option. Defaults to true. */
  lockPersonalProject?: boolean;
  /** Label the personal project "My Project" instead of its name; only for
   * the signed-in user's own personal project. */
  labelPersonalProjectAsMine?: boolean;
}

/** The project options both selects list, grouped by project type. */
const useProjectOptions = ({
  domain,
  disableDefaultFilter,
  lockedProjectTypes,
  personalProject,
  lockPersonalProject = true,
  labelPersonalProjectAsMine,
}: ProjectOptionsInput) => {
  'use memo';
  const { t } = useTranslation();
  const { projectAdminIds } = useCurrentUserProjectRoles();
  // Shared accessible-project source (FR-3388): the same hook backs
  // `useUrlProjectValidity`, so the selector and URL validation cannot
  // disagree. `network-only` keeps the selector's refresh-on-mount behavior.
  const { groups, accessibleProjects: memberProjects } = useAccessibleProjects({
    domain,
    fetchPolicy: 'network-only',
  });

  const accessibleProjects = disableDefaultFilter ? groups : memberProjects;

  const optionProjects = [
    ...(accessibleProjects ?? []),
    ...(personalProject &&
    !_.some(accessibleProjects, { id: personalProject.id })
      ? [
          {
            ...personalProject,
            type: 'PERSONAL',
            is_active: null,
            resource_policy: null,
          },
        ]
      : []),
  ];

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

  const getLabel = (key: string) =>
    ({
      GENERAL: t('general.General'),
      MODEL_STORE: t('data.ModelStore'),
      PERSONAL: t('projectSelect.Personal'),
    })[key] || key;

  const projectInfoByValue = new Map<string, ProjectInfo>();
  // Rows that carry the Project Admin shield; every other row is its label.
  const rowByValue = new Map<string, React.ReactNode>();
  const sections = _.map(_.groupBy(optionProjects, 'type'), (value, key) => ({
    type: 'section' as const,
    title: getLabel(key),
    options: _.map(_.sortBy(value, 'name'), (project) => {
      const projectId = project?.id ?? '';
      const isAdmin = !!projectId && projectAdminIds.includes(projectId);
      const isPersonal = !!personalProject && projectId === personalProject.id;
      const isLockedPersonal = lockPersonalProject && isPersonal;
      const displayName =
        labelPersonalProjectAsMine && isPersonal
          ? t('projectSelect.MyProject')
          : (project?.name ?? '');
      const row = isAdmin ? (
        <BAIFlex gap="xs" align="center">
          <span>{displayName}</span>
          <BAIIconWithTooltip
            content={t('projectSelect.ProjectAdminBadge')}
            focusable={false}
            icon={<ShieldUser />}
            // The icon's Text uses `--color-text-secondary`; follow the name's color instead.
            style={
              {
                '--color-text-secondary': 'currentColor',
              } as React.CSSProperties
            }
          />
        </BAIFlex>
      ) : undefined;
      if (row) rowByValue.set(projectId, row);
      projectInfoByValue.set(projectId, {
        label: row ?? displayName,
        value: projectId,
        projectId,
        projectResourcePolicy: project?.resource_policy,
        projectName: project?.name ?? '',
      });
      return {
        label: displayName,
        value: projectId,
        disabled: isLockedPersonal
          ? { reason: t('projectSelect.PersonalProjectCannotBeRemoved') }
          : lockedProjectIds.includes(projectId)
            ? { reason: t('projectSelect.LockedProjectCannotBeRemoved') }
            : false,
      };
    }),
  }));

  const options: SelectorOptionType[] =
    sections.length > 1 ? sections : (sections[0]?.options ?? []);

  const renderRow = (option: { value: string; label?: string }) =>
    rowByValue.get(option.value) ?? option.label ?? option.value;

  return {
    options,
    projectInfoByValue,
    renderRow,
    lockedProjectIds,
    isEmpty: !optionProjects.length,
  };
};

export interface ProjectSelectProps
  extends Omit<BAISelectProps, 'options'>, ProjectOptionsInput {
  /** The chosen project, or `undefined` after a clear. */
  onSelectProject?: (projectInfo: ProjectInfo | undefined) => void;
}

const ProjectSelect: React.FC<ProjectSelectProps> = ({
  onSelectProject,
  domain,
  disableDefaultFilter,
  lockedProjectTypes,
  personalProject,
  lockPersonalProject,
  labelPersonalProjectAsMine,
  ...selectProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const [value, setValue] = useControllableState_deprecated(selectProps);
  const { options, projectInfoByValue, renderRow, isEmpty } = useProjectOptions(
    {
      domain,
      disableDefaultFilter,
      lockedProjectTypes,
      personalProject,
      lockPersonalProject,
      labelPersonalProjectAsMine,
    },
  );

  const showNoProjectError =
    isEmpty && !selectProps.disabled && !selectProps.isLoading;

  return (
    <BAISelect
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      renderOption={renderRow}
      // The Project Admin shield shows on the closed trigger too.
      renderValue={renderRow}
      {...selectProps}
      value={value}
      onChange={(next) => {
        setValue(next);
        onSelectProject?.(next ? projectInfoByValue.get(next) : undefined);
      }}
      options={options}
      status={showNoProjectError ? 'error' : selectProps.status}
      aria-label={
        showNoProjectError
          ? t('projectSelect.NoAccessibleProjects')
          : selectProps['aria-label']
      }
    />
  );
};

export interface ProjectMultiSelectProps
  extends Omit<BAIMultiSelectorProps, 'options'>, ProjectOptionsInput {}

export const ProjectMultiSelect: React.FC<ProjectMultiSelectProps> = ({
  domain,
  disableDefaultFilter,
  lockedProjectTypes,
  personalProject,
  lockPersonalProject,
  labelPersonalProjectAsMine,
  ...multiSelectorProps
}) => {
  'use memo';
  const { t } = useTranslation();

  const [value, setValue] =
    useControllableState_deprecated<string[]>(multiSelectorProps);
  const { options, renderRow, lockedProjectIds, isEmpty } = useProjectOptions({
    domain,
    disableDefaultFilter,
    lockedProjectTypes,
    personalProject,
    lockPersonalProject,
    labelPersonalProjectAsMine,
  });

  // Auto-select locked projects when they become available
  const autoSelectLockedProjects = useEffectEvent(() => {
    if (lockedProjectIds.length > 0) {
      const currentVal = _.isArray(value) ? value : [];
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

  const showNoProjectError =
    isEmpty && !multiSelectorProps.disabled && !multiSelectorProps.isLoading;

  return (
    <BAIMultiSelector
      hasSearch
      placeholder={t('storageHost.quotaSettings.SelectProject')}
      renderOption={renderRow}
      {...multiSelectorProps}
      value={value ?? []}
      onChange={(next) => setValue(next)}
      options={options}
      status={showNoProjectError ? 'error' : multiSelectorProps.status}
      aria-label={
        showNoProjectError
          ? t('projectSelect.NoAccessibleProjects')
          : multiSelectorProps['aria-label']
      }
    />
  );
};

export default ProjectSelect;
