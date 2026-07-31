/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { SwitchToProjectButtonQuery } from '../__generated__/SwitchToProjectButtonQuery.graphql';
import { useWebUINavigate } from '../hooks';
import { useSetCurrentProject } from '../hooks/useCurrentProject';
import {
  rewriteProjectNameInPath,
  useRouteScope,
} from '../hooks/useRouteScope';
import {
  BAIButton,
  BAIButtonProps,
  toGlobalId,
  toLocalId,
} from 'backend.ai-ui';
import React, { Suspense, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { useLocation } from 'react-router-dom';

interface SwitchToProjectButtonProps extends Omit<BAIButtonProps, 'onClick'> {
  projectId: string;
}

const SwitchToProjectButtonContent: React.FC<SwitchToProjectButtonProps> = ({
  projectId,
  ...buttonProps
}) => {
  'use memo';
  const { t } = useTranslation();
  const setCurrentProject = useSetCurrentProject();
  const [isPending, startTransition] = useTransition();
  const routeScope = useRouteScope();
  const location = useLocation();
  const webuiNavigate = useWebUINavigate();

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

  const handleClick = () => {
    const id = toLocalId(group_node?.id || '');
    const name = group_node?.name;
    if (id && name) {
      startTransition(() => {
        // On project / project-admin scope the URL owns the current project
        // (FR-3055): rewrite only the `:projectName` segment and let
        // `ProjectScopeLayout` converge `currentProjectAtom` to the new URL.
        // Setting the atom directly here would leave the URL on the old
        // project, so sider links, reloads, and the next navigation would all
        // snap back — the switch would not stick.
        if (
          (routeScope === 'project' || routeScope === 'projectAdmin') &&
          location.pathname.startsWith('/project/')
        ) {
          webuiNavigate(
            rewriteProjectNameInPath(location.pathname, name) + location.search,
          );
          return;
        }
        // Outside project-scoped URLs there is no `:projectName` segment to
        // own the project — update the atom directly (same as the header).
        setCurrentProject({
          projectId: id,
          projectName: name,
        });
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
      {t('modelService.SwitchToProject', { projectName: group_node?.name })}
    </BAIButton>
  );
};

const SwitchToProjectButton: React.FC<SwitchToProjectButtonProps> = (props) => {
  return (
    <Suspense fallback={<BAIButton type="link" size="small" loading />}>
      <SwitchToProjectButtonContent {...props} />
    </Suspense>
  );
};

export default SwitchToProjectButton;
