/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxSecondaryTheme } from '../../../astryx-theme';
import { useWebUINavigate } from '../../../hooks';
import { useProjectPath } from '../../../hooks/useRouteScope';
import type { SessionLauncherFormValue } from '../../../pages/SessionLauncherPage';
import ActionItemContent from '../../ActionItemContent';
import FolderCreateModalV2 from '../../FolderCreateModalV2';
import StartFromURLModal from '../../StartFromURLModal';
import type { PanelComponentProps } from '../types';
import { useDashboardProject } from '../useDashboardFilters';
import { useTheme } from '@lablup/ui-common/theme';
import {
  BAIBatchSessionIcon,
  BAIInteractiveSessionIcon,
  BAINewFolderIcon,
  BAIUnmountAfterClose,
  BAIURLStartIcon,
} from 'backend.ai-ui';
import { Grid2x2Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// The Start page's five actions, one board item each.

const FILL = { height: '100%' } as const;

export const StartSessionPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    <ActionItemContent
      title={t('start.StartSession')}
      description={t('start.StartSessionDesc')}
      buttonText={t('start.button.StartSession')}
      icon={<BAIInteractiveSessionIcon />}
      style={FILL}
      onClick={() => webuiNavigate(buildProjectPath('session/start'))}
    />
  );
};

export const StartBatchSessionPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    <ActionItemContent
      title={t('start.StartBatchSession')}
      description={t('start.StartBatchSessionDesc')}
      buttonText={t('start.button.StartSession')}
      icon={<BAIBatchSessionIcon />}
      style={FILL}
      onClick={() => {
        const launcherValue: DeepPartial<SessionLauncherFormValue> = {
          sessionType: 'batch',
        };
        const params = new URLSearchParams({
          step: '0',
          formValues: JSON.stringify(launcherValue),
        });
        webuiNavigate(
          `${buildProjectPath('session/start')}?${params.toString()}`,
        );
      }}
    />
  );
};

export const CreateFolderPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const project = useDashboardProject();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ActionItemContent
        title={t('start.CreateFolder')}
        description={t('start.CreateFolderDesc')}
        buttonText={t('start.button.CreateFolder')}
        icon={<BAINewFolderIcon />}
        style={FILL}
        onClick={() => setIsOpen(true)}
      />
      <BAIUnmountAfterClose>
        <FolderCreateModalV2
          open={isOpen}
          project={project}
          onRequestClose={(response) => {
            setIsOpen(false);
            if (response) webuiNavigate(buildProjectPath('data'));
          }}
        />
      </BAIUnmountAfterClose>
    </>
  );
};

export const StartDeploymentPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    // The title and icon read `themeColor`; the subtree theme only reaches the Button.
    <AstryxSecondaryTheme>
      <ActionItemContent
        title={t('start.StartDeployment')}
        description={t('start.StartDeploymentDesc')}
        buttonText={t('start.button.StartDeployment')}
        icon={<Grid2x2Plus size="1em" />}
        themeColor={token('--color-success')}
        style={FILL}
        onClick={() => webuiNavigate(buildProjectPath('deployments'))}
      />
    </AstryxSecondaryTheme>
  );
};

export const StartFromURLPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <ActionItemContent
        title={t('start.StartFromURL')}
        description={t('start.StartFromURLDesc')}
        buttonText={t('start.button.StartNow')}
        icon={<BAIURLStartIcon />}
        style={FILL}
        onClick={() => setIsOpen(true)}
      />
      <BAIUnmountAfterClose>
        <StartFromURLModal open={isOpen} onCancel={() => setIsOpen(false)} />
      </BAIUnmountAfterClose>
    </>
  );
};
