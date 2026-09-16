/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SwitchToProjectButtonQuery } from '../__generated__/SwitchToProjectButtonQuery.graphql';
import { useSwitchProject } from '../hooks/useRouteScope';
import {
  BAIButton,
  BAIButtonProps,
  toGlobalId,
  toLocalId,
} from 'backend.ai-ui';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

interface SwitchToProjectButtonProps extends Omit<BAIButtonProps, 'onClick'> {
  projectId: string;
  /**
   * Project name the caller already resolved (e.g. from
   * `ModelDeploymentMetadata.projectV2`). When omitted, the name is looked up
   * with an extra `group_node` round-trip.
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
// managers older than 26.4.3, where `projectV2` is stripped from the query.
const SwitchToProjectButtonWithQuery: React.FC<
  Omit<SwitchToProjectButtonProps, 'projectName'>
> = ({ projectId, ...buttonProps }) => {
  'use memo';
  const { group_node } = useLazyLoadQuery<SwitchToProjectButtonQuery>(
    graphql`
      query SwitchToProjectButtonQuery($projectId: String!) {
        group_node(id: $projectId) @since(version: "24.03.0") {
          id
          name
        }
      }
    `,
    { projectId: toGlobalId('GroupNode', projectId) },
  );

  return (
    <SwitchToProjectButtonView
      projectId={toLocalId(group_node?.id || '')}
      projectName={group_node?.name}
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
