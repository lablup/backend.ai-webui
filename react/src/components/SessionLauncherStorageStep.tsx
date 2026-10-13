/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import { isAutoMountFolderName } from '../helper/vfolderMounts';
import { useMountableStorageHosts } from '../hooks/useMountableStorageHosts';
import { useSuspendedAutoMountedFolders } from '../hooks/useSuspendedAutoMountedFolders';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import type { ProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  BAIVFolderMountConfigInput,
  safeDecodeUuid,
  type BAIVFolderMountConfigInputRef,
  type LegacyVFolder,
  useVFolderMountConfigFormRule,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';

// Dotfile folders are mounted by the session itself, so they are never offered.
const isSelectableFolder = (folder: LegacyVFolder) =>
  folder.status === 'ready' && !isAutoMountFolderName(folder.name);

const SessionLauncherStorageStep: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  project: ProjectContext;
}> = ({ form, project }) => {
  'use memo';
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const mountConfigInputRef = useRef<BAIVFolderMountConfigInputRef>(null);

  const mountableHosts = useMountableStorageHosts(project.id);
  const autoMountedFolders = useSuspendedAutoMountedFolders({
    currentProjectId: project.id,
    mountableHosts,
  });
  const mountConfigRule = useVFolderMountConfigFormRule({ autoMountedFolders });
  const { generateFolderPath } = useFolderExplorerOpener();

  return (
    <>
      {/* The outer item keeps the form's text scale; the named one still blocks
          submit but `help={false}` stops it echoing the rows' own errors. */}
      <Form.Item>
        <Form.Item
          name="vfolderMounts"
          rules={[mountConfigRule]}
          noStyle
          help={false}
        >
          <BAIVFolderMountConfigInput
            ref={mountConfigInputRef}
            currentProjectId={project.id}
            currentProjectName={project.name}
            mountableHosts={mountableHosts}
            autoMountedFolders={autoMountedFolders}
            folderExplorerPath={generateFolderPath}
            filter={isSelectableFolder}
            onClickCreateFolder={() => setIsCreateModalOpen(true)}
          />
        </Form.Item>
      </Form.Item>
      <FolderCreateModalV2
        open={isCreateModalOpen}
        project={project}
        onRequestClose={async (response) => {
          setIsCreateModalOpen(false);
          if (!response) return;
          // The select can only offer the new folder once its own
          // `GET /folders` query has seen it.
          await mountConfigInputRef.current?.refetch();
          // A dotfile folder is auto-mounted by the session, never selected.
          if (isAutoMountFolderName(response.metadata.name)) return;
          // The create mutation answers with a Relay global id.
          const vfolderId = safeDecodeUuid(response.id);
          if (!vfolderId) return;
          const mounts = form.getFieldValue('vfolderMounts') ?? [];
          if (_.some(mounts, (mount) => mount.vfolderId === vfolderId)) return;
          form.setFieldValue('vfolderMounts', [
            ...mounts,
            {
              vfolderId,
              name: response.metadata.name,
              mountDestination: '',
              subpath: '',
            },
          ]);
        }}
      />
    </>
  );
};

export default SessionLauncherStorageStep;
