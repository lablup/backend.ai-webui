/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { FolderCreatedPayload } from '../features/session-launcher/slices/storage';
import { Form } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useMountableStorageHosts } from '../hooks/useMountableStorageHosts';
import type { ProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import { useFolderExplorerOpener } from './FolderExplorerOpener';
import {
  BAIVFolderMountConfigInput,
  isAutoMountFolderName,
  mountableVFolderScope,
  type BAIVFolderMountConfigInputRef,
  useSuspendedAutoMountedVFolders,
  useVFolderMountConfigFormRule,
} from 'backend.ai-ui';
import React, { useRef, useState } from 'react';

const SessionLauncherStorageStep: React.FC<{
  project: ProjectContext;
  /** V-09: the page appends the folder through its model. */
  onFolderCreated: (folder: FolderCreatedPayload) => void;
}> = ({ project, onFolderCreated }) => {
  'use memo';
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const mountConfigInputRef = useRef<BAIVFolderMountConfigInputRef>(null);

  const baiClient = useSuspendedBackendaiClient();
  const scope = mountableVFolderScope(baiClient.user_uuid, project.id);
  const mountableHosts = useMountableStorageHosts(project.id);
  // Shares the query the input reads, so the input's refetch reaches this rule.
  const { autoMountedFolders } = useSuspendedAutoMountedVFolders({
    scope,
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
            scope={scope}
            mountableHosts={mountableHosts}
            folderExplorerPath={generateFolderPath}
            onClickCreateFolder={() => setIsCreateModalOpen(true)}
          />
        </Form.Item>
      </Form.Item>
      <FolderCreateModalV2
        open={isCreateModalOpen}
        project={project}
        onRequestClose={(response) => {
          setIsCreateModalOpen(false);
          if (!response) return;
          mountConfigInputRef.current?.refetch();
          // A dotfile folder is auto-mounted by the session, never selected.
          if (isAutoMountFolderName(response.metadata.name)) return;
          onFolderCreated({
            vfolderId: response.entityId,
            name: response.metadata.name,
          });
        }}
      />
    </>
  );
};

export default SessionLauncherStorageStep;
