/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostSettingsPanel_storageVolumeFrgmt$key } from '../__generated__/StorageHostSettingsPanel_storageVolumeFrgmt.graphql';
import { QuotaScopeType, addQuotaScopeTypePrefix } from '../helper/index';
import { useCurrentDomain } from '../hooks';
import QuotaScopeTable from './QuotaScopeTable';
import {
  BAISkeleton,
  BAIAdminProjectSelect,
  BAIFlex,
  BAIScopedUserSelect,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISelect,
} from 'backend.ai-ui';
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
  const { id: currentDomainId } = useCurrentDomain();
  const domainScope = { domain: [{ value: currentDomainId }] };
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
        <BAISegmentedControl
          value={currentSettingType}
          onChange={(value) => {
            // Keep each side's previous pick when switching scope type;
            // `rawScopeEntityId` already selects the active side's state.
            setCurrentSettingType(value as QuotaScopeType);
          }}
        >
          <BAISegmentedControlItem
            value="user"
            label={t('storageHost.ForUser')}
          />
          <BAISegmentedControlItem
            value="project"
            label={t('storageHost.ForProject')}
          />
        </BAISegmentedControl>
        {currentSettingType === 'project' ? (
          <BAIAdminProjectSelect
            // The adjacent radio group already prints "For Project", so the
            // field's accessible name reuses it and stays visually hidden.
            label={t('storageHost.ForProject')}
            isLabelHidden
            value={projectId}
            onChange={(value) => setProjectId(value as string | undefined)}
            width={240}
          />
        ) : (
          // valuePropName="id" makes the picked value the user's id (used as
          // the quota scope entity id), not the email.
          <Suspense
            fallback={<BAISelect disabled loading style={{ width: 240 }} />}
          >
            <BAIScopedUserSelect
              scope={domainScope}
              label={t('storageHost.ForUser')}
              isLabelHidden
              valuePropName="id"
              value={userId}
              onChange={(value) => setUserId(value as string | undefined)}
              width={240}
            />
          </Suspense>
        )}
      </BAIFlex>

      <Suspense fallback={<BAISkeleton />}>
        <QuotaScopeTable scopeId={scopeId} hostName={storageVolume?.id ?? ''} />
      </Suspense>
    </BAIFlex>
  );
};

export default StorageHostSettingsPanel;
