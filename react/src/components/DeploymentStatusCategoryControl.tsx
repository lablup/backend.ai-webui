/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type {
  DeploymentFilter,
  DeploymentStatus,
} from '../__generated__/DeploymentListPageQuery.graphql';
import {
  BAIFlex,
  BAIQuestionIconWithTooltip,
  BAISegmentedControl,
  BAISegmentedControlItem,
} from 'backend.ai-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const DEPLOYMENT_STATUS_CATEGORIES = [
  'serving',
  'paused',
  'finished',
] as const;

export type DeploymentStatusCategory =
  (typeof DEPLOYMENT_STATUS_CATEGORIES)[number];

const finishedStatuses: ReadonlyArray<DeploymentStatus> = ['STOPPED'];

/** The status and replica scope behind the Serving / Paused / Terminated tabs. */
export const deploymentStatusCategoryFilter = (
  category: DeploymentStatusCategory,
): DeploymentFilter =>
  category === 'finished'
    ? { status: { in: finishedStatuses } }
    : {
        status: { notIn: finishedStatuses },
        desiredReplicas:
          category === 'serving' ? { greaterThanOrEqual: 1 } : { equals: 0 },
      };

/** Reads the tab back from a filter built by `deploymentStatusCategoryFilter`. */
export const deploymentStatusCategoryOf = (
  filter: DeploymentFilter | null | undefined,
): DeploymentStatusCategory => {
  if (filter?.status?.in?.includes('STOPPED')) return 'finished';
  if (filter?.desiredReplicas?.equals === 0) return 'paused';
  return 'serving';
};

const renderTabLabel = (label: string, help: string) => (
  <BAIFlex gap="xxs" align="center">
    {label}
    {/* Not focusable: the trigger sits inside the segment's own button. */}
    <BAIQuestionIconWithTooltip title={help} focusable={false} />
  </BAIFlex>
);

interface DeploymentStatusCategoryControlProps {
  value: DeploymentStatusCategory;
  onChange: (value: DeploymentStatusCategory) => void;
}

const DeploymentStatusCategoryControl: React.FC<
  DeploymentStatusCategoryControlProps
> = ({ value, onChange }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAISegmentedControl
      value={value}
      onChange={(next) => onChange(next as DeploymentStatusCategory)}
    >
      <BAISegmentedControlItem
        value="serving"
        label={renderTabLabel(
          t('deployment.Serving'),
          t('deployment.ServingTooltip'),
        )}
      />
      <BAISegmentedControlItem
        value="paused"
        label={renderTabLabel(
          t('deployment.Paused'),
          t('deployment.PausedTooltip'),
        )}
      />
      <BAISegmentedControlItem
        value="finished"
        label={t('deployment.status.Terminated')}
      />
    </BAISegmentedControl>
  );
};

export default DeploymentStatusCategoryControl;
