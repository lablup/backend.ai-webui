/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { App } from '../app-shim';
import { Form, type FormInstance } from '../form-engine';
import { SessionLauncherFormValue } from '../pages/SessionLauncherPage';
import {
  BAILegacyVFolderSelect,
  BAIVFolderMountConfigInput,
  type LegacyVFolder,
  type VFolderMountConfigValue,
  useVFolderMountConfigFormRule,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React from 'react';
import { useTranslation } from 'react-i18next';

const isSelectableFolder = (folder: LegacyVFolder) =>
  folder.status === 'ready' && !folder.name.startsWith('.');

const SessionLauncherStorageStep: React.FC<{
  form: FormInstance<SessionLauncherFormValue>;
  currentProjectId: string;
}> = ({ form, currentProjectId }) => {
  'use memo';
  const { t } = useTranslation();
  const { message } = App.useApp();

  // `preserve` reads the raw store: neither field has a registered Form.Item,
  // and `setFieldValue` still notifies watchers through `setFields`.
  const owner = Form.useWatch('owner', { form, preserve: true });
  const autoMountedFolderNames =
    Form.useWatch('autoMountedFolderNames', { form, preserve: true }) ?? [];

  const mountConfigRule = useVFolderMountConfigFormRule({
    autoMountedFolderNames,
  });

  const isValidOwner =
    owner?.enabled &&
    _.every(_.omit(owner, 'enabled'), (field) => field !== undefined);
  const ownerEmail = isValidOwner ? owner?.email : undefined;

  // The name map lists every folder this owner/project can mount, so anything
  // else in the selection (a stale `?formValues=`, an owner switch) is dropped.
  const pruneUnmountableSelection = (nameMap: Record<string, string>) => {
    const selected: Array<VFolderMountConfigValue> =
      form.getFieldValue('vfolderMounts') ?? [];
    const kept = _.filter(selected, (mount) => mount.vfolderId in nameMap);
    if (kept.length === selected.length) return;
    form.setFieldValue('vfolderMounts', kept);
    message.warning(t('session.launcher.InvalidMountsSelectionWarning'), 5);
  };

  return (
    <Form.Item name="vfolderMounts" rules={[mountConfigRule]}>
      <BAIVFolderMountConfigInput
        currentProjectId={currentProjectId}
        autoMountedFolderNames={autoMountedFolderNames}
        renderFolderSelect={(api) => (
          <BAILegacyVFolderSelect
            {...api}
            ownerEmail={ownerEmail}
            filter={isSelectableFolder}
            onResolvedNamesChange={(nameMap) => {
              api.onResolvedNamesChange(nameMap);
              pruneUnmountableSelection(nameMap);
            }}
            onAutoMountedFoldersChange={(names) => {
              form.setFieldValue('autoMountedFolderNames', names);
            }}
          />
        )}
      />
    </Form.Item>
  );
};

export default SessionLauncherStorageStep;
