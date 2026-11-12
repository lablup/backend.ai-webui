/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { MyTotalResourceStatistics } from '../../MyResource';
import type { PanelComponentProps } from '../types';
import MemberCard, { NoProjectText, mineProjectId } from './MemberCard';
import MemoryInUseNote from './MemoryInUseNote';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';

/** The viewer's used-vs-limit per slot across all resource groups, for the page's project, with memory in use. */
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
          <MyTotalResourceStatistics
            projectId={projectId}
            fetchKey={key}
            // Memory in use under RAM and each accelerator, so a session about to run out shows here.
            notesOf={(resourceType) =>
              resourceType === 'mem' || resourceType.includes('.') ? (
                <MemoryInUseNote slotKey={resourceType} fetchKey={key} />
              ) : null
            }
          />
        )
      }
    </MemberCard>
  );
};

export default MyTotalResourcePanel;
