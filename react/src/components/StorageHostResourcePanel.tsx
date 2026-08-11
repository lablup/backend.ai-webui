/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { StorageHostResourcePanelFragment$key } from '../__generated__/StorageHostResourcePanelFragment.graphql';
import { convertToDecimalUnit } from '../helper/index';
import { Badge } from '@astryxdesign/core/Badge';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { ProgressBar } from '@astryxdesign/core/ProgressBar';
import { HStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

// PILOT-DECISION: antd `Progress strokeColor`/`status="exception"` (P5,
// closed variant enum) collapses into one threshold function feeding
// ProgressBar's semantic `variant`. Thresholds match the dropped
// `usageIndicatorColor` helper exactly (<70 success, <90 warning, else
// error/exception).
const usageProgressVariant = (
  percent: number,
): 'success' | 'warning' | 'error' => {
  if (percent < 70) return 'success';
  if (percent < 90) return 'warning';
  return 'error';
};

const StorageHostResourcePanel: React.FC<{
  storageVolumeFrgmt: StorageHostResourcePanelFragment$key | null;
}> = ({ storageVolumeFrgmt: resourceFrgmt }) => {
  const { t } = useTranslation();

  const resource = useFragment(
    graphql`
      fragment StorageHostResourcePanelFragment on StorageVolume {
        id
        backend
        capabilities
        path
        usage
      }
    `,
    resourceFrgmt,
  );

  const parsedUsage = JSON.parse(resource?.usage || '{}');
  const usedBytes = parsedUsage?.used_bytes;
  const capacityBytes = parsedUsage?.capacity_bytes;
  const usageRatio = capacityBytes > 0 ? usedBytes / capacityBytes : 0;
  const storageUsage = {
    used_bytes: usedBytes,
    capacity_bytes: capacityBytes,
    percent: Number((usageRatio * 100).toFixed(1)),
  };

  return (
    // antd Descriptions size="small" bordered column={2} → MetadataList
    // (MAPPING §4). `size`/`bordered` drop; per-item `span={2}` on the Usage
    // item also drops (PILOT-DECISION, project-wide) — it now shares the
    // 2-column flow with Backend Type instead of spanning both columns.
    <MetadataList columns={2}>
      <MetadataListItem label={t('storageHost.Usage')}>
        <HStack width={200}>
          <ProgressBar
            label={t('storageHost.Usage')}
            isLabelHidden
            value={storageUsage?.percent}
            variant={usageProgressVariant(storageUsage?.percent)}
          />
        </HStack>
        <Text color="secondary">{t('storageHost.Used')}: </Text>
        {convertToDecimalUnit(storageUsage?.used_bytes, 'auto')?.displayValue}
        <Text color="secondary">{' / '}</Text>
        <Text color="secondary">{t('storageHost.Total')}: </Text>
        {
          convertToDecimalUnit(storageUsage?.capacity_bytes, 'auto')
            ?.displayValue
        }
      </MetadataListItem>
      <MetadataListItem label={t('agent.BackendType')}>
        {resource?.backend}
      </MetadataListItem>
      <MetadataListItem label={t('agent.Capabilities')}>
        <BAIFlex gap="xs" wrap="wrap">
          {_.map(resource?.capabilities, (cap) => (
            <Badge key={cap} variant="neutral" label={cap} />
          ))}
        </BAIFlex>
      </MetadataListItem>
    </MetadataList>
  );
};

export default StorageHostResourcePanel;
