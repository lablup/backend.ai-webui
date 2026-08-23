/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useSuspendedBackendaiClient } from '../hooks';
import { useSuspenseTanQuery } from '../hooks/reactQueryAlias';
import { theme } from '../theme-shim';
import QuotaPerStorageVolumePanelCard, {
  type VolumeInfo,
} from './QuotaPerStorageVolumePanelCard';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { BAIBoardItemTitle, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { HardDrive } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Dashboard wrapper around `QuotaPerStorageVolumePanelCard`. Resolves the
// first quota-supporting host up-front so the panel opens on a meaningful
// scope instead of the inner card's "does not support" state. Renders an
// `Empty` placeholder when no host advertises `quota` capability — the
// dashboard slot is always shown (unlike the row-level modal trigger that
// hides itself entirely when no quota host exists).
const QuotaPerStorageVolumeDashboardItem: React.FC = () => {
  'use memo';
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const { data: vhostInfo } = useSuspenseTanQuery<{
    volume_info?: Record<string, Omit<VolumeInfo, 'id'>>;
  } | null>({
    queryKey: ['vhostInfo'],
    queryFn: () => baiClient.vfolder.list_hosts(),
  });

  const quotaSupportedEntry = _.find(
    _.entries(vhostInfo?.volume_info ?? {}),
    ([, info]) => _.includes(info?.capabilities, 'quota'),
  );
  const defaultVolumeInfo: VolumeInfo | undefined = quotaSupportedEntry
    ? { id: quotaSupportedEntry[0], ...quotaSupportedEntry[1] }
    : undefined;

  return (
    <BAIFlex
      direction="column"
      align="stretch"
      style={{
        paddingInline: token.paddingXL,
        paddingBottom: token.padding,
      }}
    >
      <BAIBoardItemTitle title={t('data.QuotaPerStorageVolume')} />
      {defaultVolumeInfo ? (
        <QuotaPerStorageVolumePanelCard defaultVolumeInfo={defaultVolumeInfo} />
      ) : (
        // The board reserves two rows for this slot whether or not a quota
        // host exists, so the placeholder centres in what it is given rather
        // than sitting as one bold line under the title.
        <BAIFlex direction="column" justify="center" style={{ flex: 1 }}>
          <EmptyState
            title={t('storageHost.QuotaDoesNotSupported')}
            icon={<HardDrive size={24} />}
            isCompact
          />
        </BAIFlex>
      )}
    </BAIFlex>
  );
};

export default QuotaPerStorageVolumeDashboardItem;
