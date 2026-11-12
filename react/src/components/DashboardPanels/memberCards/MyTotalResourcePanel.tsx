/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import ErrorBoundaryWithNullFallback from '../../ErrorBoundaryWithNullFallback';
import { MyTotalResourceStatistics } from '../../MyResource';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import MemoryInUse from './MemoryInUse';
import { BAIFlex } from 'backend.ai-ui';
import React, { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';

/** The viewer's used-vs-limit per slot across all resource groups, for the page's project, and memory in use. */
const MyTotalResourcePanel: React.FC<PanelComponentProps> = ({
  scope,
  fetchKey,
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
          <BAIFlex direction="column" align="stretch" gap="md">
            <MyTotalResourceStatistics projectId={projectId} fetchKey={key} />
            {/* Memory in use against the allocation, so a session about to run out shows here. */}
            <ErrorBoundaryWithNullFallback>
              <Suspense fallback={null}>
                <MemoryInUse fetchKey={key} />
              </Suspense>
            </ErrorBoundaryWithNullFallback>
          </BAIFlex>
        )
      }
    </MemberCard>
  );
};

export default MyTotalResourcePanel;
