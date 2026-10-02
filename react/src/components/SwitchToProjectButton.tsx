/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SwitchToProjectButtonQuery } from '../__generated__/SwitchToProjectButtonQuery.graphql';
import { useSwitchProject } from '../hooks/useRouteScope';
import { BAIButton, BAIButtonProps } from 'backend.ai-ui';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface SwitchToProjectButtonProps extends Omit<BAIButtonProps, 'onClick'> {
  projectId: string;
  /**
   * Project name the caller already resolved (e.g. from
   * `ModelDeploymentMetadata.projectV2`). When omitted, the name is looked up
   * with an extra `projectV2` round-trip.
   */
  projectName?: string | null;
}

const SwitchToProjectButtonView: React.FC<
  Omit<SwitchToProjectButtonProps, 'projectId' | 'projectName'> & {
    projectId?: string | null;
    projectName?: string | null;
  }
> = ({ projectId, projectName, ...buttonProps }) => {
  'use memo';
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const switchProject = useSwitchProject();

  const handleClick = () => {
    if (projectId && projectName) {
      startTransition(() => {
        switchProject({ projectId, projectName });
      });
    }
  };

  return (
    <BAIButton
      type="link"
      size="small"
      loading={isPending}
      onClick={handleClick}
      {...buttonProps}
    >
      {t('modelService.SwitchToProject', { projectName })}
    </BAIButton>
  );
};

// Fallback for callers that cannot supply the name themselves — including
// managers older than 26.4.3, where `ModelDeploymentMetadata.projectV2` is
// stripped from the caller's query.
const SwitchToProjectButtonWithQuery: React.FC<
  Omit<SwitchToProjectButtonProps, 'projectName'>
> = ({ projectId, ...buttonProps }) => {
  'use memo';
  const { projectV2 } = useLazyLoadQuery<SwitchToProjectButtonQuery>(
    graphql`
      query SwitchToProjectButtonQuery($projectId: UUID!) {
        projectV2(projectId: $projectId) {
          basicInfo {
            name
          }
        }
      }
    `,
    { projectId },
  );

  return (
    <SwitchToProjectButtonView
      projectId={projectId}
      projectName={projectV2?.basicInfo?.name}
      {...buttonProps}
    />
  );
};

const SwitchToProjectButton: React.FC<SwitchToProjectButtonProps> = ({
  projectName,
  ...props
}) => {
  'use memo';
  if (projectName) {
    return <SwitchToProjectButtonView projectName={projectName} {...props} />;
  }
  return (
    <Suspense fallback={<BAIButton type="link" size="small" loading />}>
      <SwitchToProjectButtonWithQuery {...props} />
    </Suspense>
  );
};

export default SwitchToProjectButton;
