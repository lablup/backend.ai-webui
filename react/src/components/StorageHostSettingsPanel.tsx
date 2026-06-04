/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostSettingsPanel_storageVolumeFrgmt$key } from '../__generated__/StorageHostSettingsPanel_storageVolumeFrgmt.graphql';
import { QuotaScopeType, addQuotaScopeTypePrefix } from '../helper/index';
import BAIRadioGroup from './BAIRadioGroup';
import QuotaScopeTable from './QuotaScopeTable';
import { Skeleton } from 'antd';
import { BAIAdminProjectSelect, BAIFlex, BAIUserSelect } from 'backend.ai-ui';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface StorageHostSettingsPanelProps {
  storageVolumeFrgmt: StorageHostSettingsPanel_storageVolumeFrgmt$key | null;
}

const StorageHostSettingsPanel: React.FC<StorageHostSettingsPanelProps> = ({
  storageVolumeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const storageVolume = useFragment(
    graphql`
      fragment StorageHostSettingsPanel_storageVolumeFrgmt on StorageVolume {
        id
        capabilities
      }
    `,
    storageVolumeFrgmt,
  );

  const [currentSettingType, setCurrentSettingType] =
    useState<QuotaScopeType>('user');
  // Keep separate states per scope type so switching between User / Project
  // preserves whatever the user previously picked on the other side.
  const [userId, setUserId] = useState<string | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>();

  const rawScopeEntityId =
    currentSettingType === 'project' ? projectId : userId;
  // QuotaScopeTable issues its own `useLazyLoadQuery` keyed on this scopeId.
  // When nothing is picked, leave it undefined so the table's `@skip` +
  // `store-only` policy keeps the request out entirely.
  const scopeId =
    rawScopeEntityId && storageVolume?.id
      ? addQuotaScopeTypePrefix(currentSettingType, rawScopeEntityId)
      : undefined;

  return (
    <BAIFlex direction="column" align="stretch" gap="sm">
      <BAIFlex direction="row" align="center" wrap="wrap" gap="md">
        <BAIRadioGroup
          options={[
            { label: t('storageHost.ForUser'), value: 'user' },
            { label: t('storageHost.ForProject'), value: 'project' },
          ]}
          value={currentSettingType}
          onChange={(e) => {
            // Keep each side's previous pick when switching scope type;
            // `rawScopeEntityId` already selects the active side's state.
            setCurrentSettingType(e.target.value as QuotaScopeType);
          }}
        />
        {currentSettingType === 'project' ? (
          <BAIAdminProjectSelect
            value={projectId}
            onChange={(value) => setProjectId(value as string | undefined)}
            style={{ minWidth: 240 }}
          />
        ) : (
          // valuePropName="id" makes the picked value the user's id (used as
          // the quota scope entity id), not the email.
          <BAIUserSelect
            valuePropName="id"
            value={userId}
            onChange={(value) => setUserId(value as string | undefined)}
            style={{ minWidth: 240 }}
          />
        )}
      </BAIFlex>

      <Suspense fallback={<Skeleton active />}>
        <QuotaScopeTable scopeId={scopeId} hostName={storageVolume?.id ?? ''} />
      </Suspense>
    </BAIFlex>
  );
};

export default StorageHostSettingsPanel;
