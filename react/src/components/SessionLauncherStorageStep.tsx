/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Form, type FormInstance } from '../form-engine';
import { ownerEmailFromOwner } from '../helper/vfolderMounts';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useAutoMountedFolderNames } from '../hooks/useAutoMountedFolderNames';
import { useMergedAllowedStorageHostPermission } from '../hooks/useMergedAllowedStorageHostPermission';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import {
  BAIVFolderMountConfigInput,
  type LegacyVFolder,
  useVFolderMountConfigFormRule,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';

const MOUNT_IN_SESSION_PERMISSION = 'mount-in-session';

const isSelectableFolder = (folder: LegacyVFolder) => folder.status === 'ready';

const SessionLauncherStorageStep: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  currentProjectId: string;
}> = ({ form, currentProjectId }) => {
  'use memo';
  const baiClient = useSuspendedBackendaiClient();
  const currentDomain = useCurrentDomainValue();

  // `preserve` reads the raw store: `owner` has no registered Form.Item, and
  // `setFieldValue` still notifies watchers through `setFields`.
  const owner = Form.useWatch('owner', { form, preserve: true });
  const ownerEmail = ownerEmailFromOwner(owner);

  const { unitedAllowedPermissionByVolume } =
    useMergedAllowedStorageHostPermission(
      currentDomain,
      currentProjectId,
      baiClient?._config?.accessKey,
    );
  const mountableHosts = _.keys(
    _.pickBy(unitedAllowedPermissionByVolume, (permissions) =>
      _.includes(permissions, MOUNT_IN_SESSION_PERMISSION),
    ),
  );

  const autoMountedFolderNames = useAutoMountedFolderNames(currentProjectId);
  const mountConfigRule = useVFolderMountConfigFormRule({
    autoMountedFolderNames,
  });

  return (
    <Form.Item name="vfolderMounts" rules={[mountConfigRule]}>
      <BAIVFolderMountConfigInput
        currentProjectId={currentProjectId}
        ownerEmail={ownerEmail}
        mountableHosts={mountableHosts}
        autoMountedFolderNames={autoMountedFolderNames}
        filter={isSelectableFolder}
      />
    </Form.Item>
  );
};

export default SessionLauncherStorageStep;
