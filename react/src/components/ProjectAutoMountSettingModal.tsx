/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import VFolderAutoMountList from './VFolderAutoMountList';
import { BAIModal, type BAIModalProps, BAISkeleton } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';

export interface ProjectAutoMountSettingModalProps extends Omit<
  BAIModalProps,
  'title' | 'children' | 'footer'
> {
  /** UUID of the project whose auto-mounts are managed. */
  projectId: string;
  projectName?: string | null;
}

const ProjectAutoMountSettingModal: React.FC<
  ProjectAutoMountSettingModalProps
> = ({ projectId, projectName, ...modalProps }) => {
  'use memo';
  const { t } = useTranslation();
  return (
    <BAIModal
      width={900}
      {...modalProps}
      title={
        projectName
          ? `${t('autoMount.AutoMountFolders')} - ${projectName}`
          : t('autoMount.AutoMountFolders')
      }
      footer={null}
    >
      <Suspense fallback={<BAISkeleton />}>
        <VFolderAutoMountList scopeType="PROJECT" scopeId={projectId} />
      </Suspense>
    </BAIModal>
  );
};

export default ProjectAutoMountSettingModal;
