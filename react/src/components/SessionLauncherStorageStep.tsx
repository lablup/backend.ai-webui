/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import {
  isAutoMountFolderName,
  ownerEmailFromOwner,
} from '../helper/vfolderMounts';
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

  // `preserve` reads the raw store: `owner` has no registered Form.Item, and
  // `setFieldValue` still notifies watchers through `setFields`.
  const owner = Form.useWatch('owner', { form, preserve: true });
  const ownerEmail = ownerEmailFromOwner(owner);

  const mountableHosts = useMountableStorageHosts(project.id);
  const autoMountedFolders = useSuspendedAutoMountedFolders({
    ownerEmail,
    currentProjectId: project.id,
    mountableHosts,
  });
  const mountConfigRule = useVFolderMountConfigFormRule({
    autoMountedFolderNames: _.map(autoMountedFolders, 'name'),
  });
  const { generateFolderPath } = useFolderExplorerOpener();

  return (
    <>
      {/* The rule still blocks submit; each row already shows its own error. */}
      <Form.Item name="vfolderMounts" rules={[mountConfigRule]} noStyle>
        <BAIVFolderMountConfigInput
          ref={mountConfigInputRef}
          currentProjectId={project.id}
          ownerEmail={ownerEmail}
          mountableHosts={mountableHosts}
          autoMountedFolders={autoMountedFolders}
          folderExplorerPath={generateFolderPath}
          filter={isSelectableFolder}
          onClickCreateFolder={() => setIsCreateModalOpen(true)}
        />
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
