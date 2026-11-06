/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { SharedResourceGroupSelectForCurrentProjectQuery } from '../__generated__/SharedResourceGroupSelectForCurrentProjectQuery.graphql';
import {
  useCurrentProjectValue,
  useCurrentResourceGroupState,
  useResourceGroupsForCurrentProject,
} from '../hooks/useCurrentProject';
import { cardResourceGroup } from './DashboardPanels/dashboardScope';
import { Tooltip } from '@lablup/ui-common/Tooltip';
import { BAIFlex, BAIScopedResourceGroupSelect } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useEffect, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

const PAGE_SIZE = 100;

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

  const scope = {
    project: _.compact([currentProject.id]).map((value) => ({ value })),
  };
  const filter = _.isEmpty(sftpResourceGroups)
    ? undefined
    : { name: { notIn: _.compact(sftpResourceGroups) } };
  const data =
    useLazyLoadQuery<SharedResourceGroupSelectForCurrentProjectQuery>(
      graphql`
        query SharedResourceGroupSelectForCurrentProjectQuery(
          $scope: ResourceGroupScope!
          $filter: ResourceGroupFilter
          $limit: Int!
          $hasScope: Boolean!
        ) {
          scopedResourceGroups(
            scope: $scope
            filter: $filter
            orderBy: [{ field: NAME, direction: ASC }]
            limit: $limit
          ) @include(if: $hasScope) @catch(to: RESULT) {
            count
            edges {
              node {
                name
              }
            }
          }
        }
      `,
      {
        scope,
        filter: filter ?? null,
        limit: PAGE_SIZE,
        hasScope: !!currentProject.id,
      },
      { fetchPolicy: 'store-or-network' },
    );
  const connection = data.scopedResourceGroups?.ok
    ? data.scopedResourceGroups.value
    : null;
  const names = _.compact(_.map(connection?.edges, (edge) => edge?.node?.name));
  // The dashboard's rule: a group the project may not use falls back to the first one it may.
  const allowedResourceGroup = cardResourceGroup(
    currentResourceGroup ? [currentResourceGroup] : undefined,
    {
      names,
      isComplete: !!connection && (connection.count ?? 0) <= names.length,
    },
  );
  useEffect(() => {
    if (allowedResourceGroup && allowedResourceGroup !== currentResourceGroup) {
      setCurrentResourceGroup(allowedResourceGroup);
    }
  }, [allowedResourceGroup, currentResourceGroup, setCurrentResourceGroup]);

  return (
    // Wrapped like the dashboard's header controls, so the picker keeps to its content width.
    <BAIFlex align="center" gap="xxs">
      {/* To the right, so it never covers the select's own tooltips above. */}
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
          scope={scope}
          filter={filter}
          isLoading={isPending || isLoading}
          value={isPending ? optimisticValue : allowedResourceGroup}
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
    </BAIFlex>
  );
};

export default SharedResourceGroupSelectForCurrentProject;
