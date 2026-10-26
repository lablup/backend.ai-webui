/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AstryxSecondaryTheme } from '../../../astryx-theme';
import { useWebUINavigate } from '../../../hooks';
import { useProjectPath } from '../../../hooks/useRouteScope';
import type { SessionLauncherFormValue } from '../../../pages/SessionLauncherPage';
import FolderCreateModalV2 from '../../FolderCreateModalV2';
import StartFromURLModal from '../../StartFromURLModal';
import PanelFrame from '../PanelFrame';
import type { PanelComponentProps } from '../types';
import { useDashboardProject } from '../useDashboardFilters';
import { Button } from '@lablup/ui-common/Button';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIBatchSessionIcon,
  BAIFlex,
  BAIInteractiveSessionIcon,
  BAINewFolderIcon,
  BAIUnmountAfterClose,
  BAIURLStartIcon,
} from 'backend.ai-ui';
import { Grid2x2Plus } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StartActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonLabel: string;
  onClick: () => void;
  /** Wraps the button, e.g. in a subtree theme. */
  renderButton?: (button: React.ReactNode) => React.ReactNode;
}

/** One of the Start page's actions as a small dashboard card: header, a short description, a button. */
const StartActionCard: React.FC<StartActionCardProps> = ({
  title,
  description,
  icon,
  buttonLabel,
  onClick,
  renderButton = (button) => button,
}) => {
  'use memo';
  return (
    <PanelFrame title={title} icon={icon}>
      <BAIFlex direction="column" align="start" gap="sm">
        <Text type="supporting" maxLines={2}>
          {description}
        </Text>
        {renderButton(
          <Button variant="primary" label={buttonLabel} onClick={onClick} />,
        )}
      </BAIFlex>
    </PanelFrame>
  );
};

export const StartSessionPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    <StartActionCard
      title={t('start.StartSession')}
      description={t('start.StartSessionDesc')}
      buttonLabel={t('start.button.StartSession')}
      icon={<BAIInteractiveSessionIcon />}
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
    <StartActionCard
      title={t('start.StartBatchSession')}
      description={t('start.StartBatchSessionDesc')}
      buttonLabel={t('start.button.StartSession')}
      icon={<BAIBatchSessionIcon />}
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
      <StartActionCard
        title={t('start.CreateFolder')}
        description={t('start.CreateFolderDesc')}
        buttonLabel={t('start.button.CreateFolder')}
        icon={<BAINewFolderIcon />}
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
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  return (
    <StartActionCard
      title={t('start.StartDeployment')}
      description={t('start.StartDeploymentDesc')}
      buttonLabel={t('start.button.StartDeployment')}
      icon={<Grid2x2Plus size="1em" />}
      onClick={() => webuiNavigate(buildProjectPath('deployments'))}
      // The deployment action keeps the secondary accent it had on the Start page.
      renderButton={(button) => (
        <AstryxSecondaryTheme>{button}</AstryxSecondaryTheme>
      )}
    />
  );
};

export const StartFromURLPanel: React.FC<PanelComponentProps> = () => {
  'use memo';
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <StartActionCard
        title={t('start.StartFromURL')}
        description={t('start.StartFromURLDesc')}
        buttonLabel={t('start.button.StartNow')}
        icon={<BAIURLStartIcon />}
        onClick={() => setIsOpen(true)}
      />
      <BAIUnmountAfterClose>
        <StartFromURLModal open={isOpen} onCancel={() => setIsOpen(false)} />
      </BAIUnmountAfterClose>
    </>
  );
};
