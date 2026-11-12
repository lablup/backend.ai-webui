/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useCurrentUserInfo } from '../../../hooks/backendai';
import { MyTotalResourceStatistics } from '../../MyResource';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import MemoryInUseNote, {
  memoryMetricOf,
  useReportedMemoryMetrics,
} from './MemoryInUseNote';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

/** The statistics, with memory in use under RAM and each accelerator whose metric the manager reports. */
const StatisticsWithMemoryInUse: React.FC<{
  projectId: string;
  fetchKey: string;
  refreshedAt: number;
}> = ({ projectId, fetchKey, refreshedAt }) => {
  'use memo';
  const [userInfo] = useCurrentUserInfo();
  const reported = useReportedMemoryMetrics();
  const metricOf = (resourceType: string) =>
    resourceType === 'mem' || resourceType.includes('.')
      ? memoryMetricOf(resourceType)
      : undefined;
  return (
    <MyTotalResourceStatistics
      projectId={projectId}
      fetchKey={fetchKey}
      // No reported metric, no notes: the statistics keep their usual spacing.
      notesOf={
        userInfo.uuid && reported.size > 0
          ? (resourceType) => {
              const metricName = metricOf(resourceType);
              return metricName && reported.has(metricName) ? (
                <MemoryInUseNote
                  metricName={metricName}
                  userId={userInfo.uuid}
                  fetchKey={fetchKey}
                  refreshedAt={refreshedAt}
                />
              ) : null;
            }
          : undefined
      }
    />
  );
};

/** The viewer's used-vs-limit per slot across all resource groups, for the page's project, with memory in use. */
const MyTotalResourcePanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
  vars,
}) => {
  'use memo';
  const { t } = useTranslation();
  const projectId = mineProjectId(scope);
  return (
    <MemberCard
      title={t('webui.menu.MyResources')}
      tooltip={<Trans i18nKey="webui.menu.MyResourcesDescription" />}
      fetchKey={fetchKey}
      resetKeys={[projectId]}
    >
      {(key) =>
        !projectId ? (
          <NoProjectText />
        ) : (
          <StatisticsWithMemoryInUse
            projectId={projectId}
            fetchKey={key}
            refreshedAt={vars.refreshedAt}
          />
        )
      }
    </MemberCard>
  );
};

export default MyTotalResourcePanel;
