/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import { MOUNT_IN_SESSION_PERMISSION } from '../helper/storageHostPermission';
import { ownerEmailFromOwner } from '../helper/vfolderMounts';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { useSuspendedAutoMountedFolderNames } from '../hooks/useSuspendedAutoMountedFolderNames';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import type { ProjectContext } from '../types/projectContext';
import FolderCreateModalV2 from './FolderCreateModalV2';
import {
  BAIVFolderMountConfigInput,
  convertToUUID,
  type BAIVFolderMountConfigInputRef,
  type LegacyVFolder,
  useVFolderMountConfigFormRule,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { useRef, useState } from 'react';

// The auto-mount query is capped at 100 names, so exclude dotfiles here too
// rather than relying on that list being complete.
const isSelectableFolder = (folder: LegacyVFolder) =>
  folder.status === 'ready' && !folder.name.startsWith('.');

const SessionLauncherStorageStep: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  project: ProjectContext;
}> = ({ form, project }) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const mountConfigInputRef = useRef<BAIVFolderMountConfigInputRef>(null);

  // `preserve` reads the raw store: `owner` has no registered Form.Item, and
  // `setFieldValue` still notifies watchers through `setFields`.
  const owner = Form.useWatch('owner', { form, preserve: true });
  const ownerEmail = ownerEmailFromOwner(owner);

  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      project.id,
      baiClient?._config?.accessKey,
    );
  const mountableHosts = _.keys(
    _.pickBy(unitedAllowedPermissionByVolume, (permissions) =>
      _.includes(permissions, MOUNT_IN_SESSION_PERMISSION),
    ),
  );

  const autoMountedFolderNames = useSuspendedAutoMountedFolderNames(project.id);
  const mountConfigRule = useVFolderMountConfigFormRule({
    autoMountedFolderNames,
  });

  return (
    <>
      <Form.Item name="vfolderMounts" rules={[mountConfigRule]}>
        <BAIVFolderMountConfigInput
          ref={mountConfigInputRef}
          currentProjectId={project.id}
          ownerEmail={ownerEmail}
          mountableHosts={mountableHosts}
          autoMountedFolderNames={autoMountedFolderNames}
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
          const vfolderId = convertToUUID(response.id);
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
