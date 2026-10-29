/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import { useSuspendedBackendaiClient } from '../hooks';
import { useMountableStorageHosts } from '../hooks/useMountableStorageHosts';
import type { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
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
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';

const SessionLauncherStorageStep: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  project: ProjectContext;
}> = ({ form, project }) => {
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
          const vfolderId = response.entityId;
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
