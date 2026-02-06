'use memo';

import { SwitchToProjectButtonQuery } from '../__generated__/SwitchToProjectButtonQuery.graphql';
import { useSetCurrentProject } from '../hooks/useCurrentProject';
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
}

const SwitchToProjectButtonContent: React.FC<SwitchToProjectButtonProps> = ({
  projectId,
  ...buttonProps
}) => {
  const { t } = useTranslation();
  const setCurrentProject = useSetCurrentProject();
  const [isPending, startTransition] = useTransition();

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
