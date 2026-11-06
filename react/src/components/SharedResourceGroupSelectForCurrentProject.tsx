/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { BAIScopedResourceGroupSelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';

interface SharedResourceGroupSelectForCurrentProjectProps {
  /** The card's own query is still loading for the picked group. */
  isLoading?: boolean;
  onChangeInTransition?: (resourceGroup: string) => void;
}

/** The current project's resource group, kept as the app's current one, picked like a dashboard card header's picker. */
const SharedResourceGroupSelectForCurrentProject: React.FC<
  SharedResourceGroupSelectForCurrentProjectProps
> = ({ isLoading, onChangeInTransition }) => {
  'use memo';
  const { t } = useTranslation();
  const currentProject = useCurrentProjectValue();
  const [currentResourceGroup, setCurrentResourceGroup] =
    useCurrentResourceGroupState();
  const { sftpResourceGroups } = useResourceGroupsForCurrentProject();
  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useState(currentResourceGroup);

  return (
    // To the right, so it never covers the select's own tooltips above.
    <Tooltip
      content={t('general.ResourceGroup')}
      placement="end"
      hasHoverIndication={false}
    >
      <BAIScopedResourceGroupSelect
        size="sm"
        variant="ghost"
        label={t('general.ResourceGroup')}
        isLabelHidden
        scope={{
          project: _.compact([currentProject.id]).map((value) => ({ value })),
        }}
        filter={
          _.isEmpty(sftpResourceGroups)
            ? undefined
            : { name: { notIn: _.compact(sftpResourceGroups) } }
        }
        isLoading={isPending || isLoading}
        value={isPending ? optimisticValue : currentResourceGroup}
        onChange={(value) => {
          if (typeof value !== 'string') return;
          setOptimisticValue(value);
          startTransition(() => {
            setCurrentResourceGroup(value);
            onChangeInTransition?.(value);
          });
        }}
      />
    </Tooltip>
  );
};

export default SharedResourceGroupSelectForCurrentProject;
