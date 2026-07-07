/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import RouteErrorContent, { RouteErrorSegment } from '../RouteErrorContent';
import { ArrowUpLeftIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Error states for the `/project/:projectName/*` subtree, rendered in the
 * shared minimal route-error language (see `RouteErrorContent`):
 *
 *  - 'not-found': the URL names a project that does not exist or is not
 *    accessible. The pill shows WHERE the URL broke (the project segment),
 *    derived from route data — not translated copy — so the invalid name is
 *    instantly findable without touching i18n strings.
 *  - 'no-projects': the user belongs to no project at all; a terminal notice
 *    with an administrator hint.
 */

interface ProjectScopeErrorStateProps {
  variant: 'not-found' | 'no-projects';
  /** The invalid project name from the URL (not-found variant). */
  projectName?: string;
  /** The feature segment after the project name (e.g. 'session'). */
  featureKey?: string;
  /** Action area under the copy (e.g. the "Go to {{project}}" button). */
  extra?: React.ReactNode;
}

const ProjectScopeErrorState: React.FC<ProjectScopeErrorStateProps> = ({
  variant,
  projectName,
  featureKey,
  extra,
}) => {
  'use memo';
  const { t } = useTranslation();

  if (variant === 'no-projects') {
    return (
      <RouteErrorContent
        title={t('projectSelect.NoAccessibleProjects')}
        description={t('projectSelect.AskAdminForProjectAccess')}
      />
    );
  }

  const segments: RouteErrorSegment[] = [
    { text: 'project' },
    { text: projectName ?? '', broken: true },
    ...(featureKey ? [{ text: featureKey }] : []),
  ];

  return (
    <RouteErrorContent
      segments={segments}
      title={t('projectSelect.ProjectNotFoundOrNoAccess', {
        project: projectName,
      })}
      description={
        <>
          <ArrowUpLeftIcon
            size="0.95em"
            style={{ verticalAlign: '-0.12em', marginRight: 5 }}
            aria-hidden="true"
          />
          {t('projectSelect.SwitchToAccessibleProject')}
        </>
      }
      extra={extra}
    />
  );
};

export default ProjectScopeErrorState;
