/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { QuotaPerStorageVolumePanelCardQuery } from '../__generated__/QuotaPerStorageVolumePanelCardQuery.graphql';
import { QuotaPerStorageVolumePanelCardUserQuery } from '../__generated__/QuotaPerStorageVolumePanelCardUserQuery.graphql';
import { addQuotaScopeTypePrefix, convertToDecimalUnit } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAIProgress from './BAIProgress';
import StorageSelect from './StorageSelect';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { Grid, GridSpan } from '@astryxdesign/core/Grid';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAISkeleton, BAIFlex } from 'backend.ai-ui';
import * as _ from 'lodash-es';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VolumeInfo = {
  id: string;
  backend: string;
  capabilities: string[];
  // `usage` is optional because `vfolder.list_hosts()` only attaches it for
  // hosts that can report capacity; `usage.percentage` is optional because
  // even a reporting host may omit the percentage (rendered as "Unknown").
  usage?: {
    percentage?: number;
  };
  sftp_scaling_groups: string[];
};

interface QuotaPerStorageVolumePanelCardProps {
  /**
   * Pre-selects a volume so the content renders that host's quota immediately
   * (e.g. when opened from a specific folder row). When provided, the built-in
   * usage-based auto-select is disabled; users can still switch volumes via
   * the inline `StorageSelect`.
   */
  defaultVolumeInfo?: VolumeInfo;
}

interface QuotaScopeContentProps {
  selectedVolumeInfo: VolumeInfo | undefined;
}

// Body of the panel: fetches and renders project / user quota scope for the
// selected volume. Wrapped in a Suspense boundary by the parent so switching
// to an uncached host shows a loading indicator while in flight, while cache
// hits commit synchronously without any spinner flash.
const QuotaScopeContent: React.FC<QuotaScopeContentProps> = ({
  selectedVolumeInfo,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { token } = useTheme();
  const currentProject = useCurrentProjectValue();
  const baiClient = useSuspendedBackendaiClient();

  // TODO: Add resolver to enable subquery and modify to call useLazyLoadQuery only once.
  const { user } = useLazyLoadQuery<QuotaPerStorageVolumePanelCardUserQuery>(
    graphql`
      query QuotaPerStorageVolumePanelCardUserQuery(
        $domain_name: String
        $email: String
      ) {
        user(domain_name: $domain_name, email: $email) {
          id
        }
      }
    `,
    {
      domain_name: useCurrentDomainValue(),
      email: baiClient?.email,
    },
  );
  const { project_quota_scope, user_quota_scope } =
    useLazyLoadQuery<QuotaPerStorageVolumePanelCardQuery>(
      graphql`
        query QuotaPerStorageVolumePanelCardQuery(
          $project_quota_scope_id: String!
          $user_quota_scope_id: String!
          $storage_host_name: String!
          $skipQuotaScope: Boolean!
        ) {
          project_quota_scope: quota_scope(
            quota_scope_id: $project_quota_scope_id
            storage_host_name: $storage_host_name
          ) @skip(if: $skipQuotaScope) {
            details {
              usage_bytes
              hard_limit_bytes
            }
          }
          user_quota_scope: quota_scope(
            quota_scope_id: $user_quota_scope_id
            storage_host_name: $storage_host_name
          ) @skip(if: $skipQuotaScope) {
            details {
              usage_bytes
              hard_limit_bytes
            }
          }
        }
      `,
      {
        project_quota_scope_id: addQuotaScopeTypePrefix(
          'project',
          currentProject?.id || '',
        ),
        user_quota_scope_id: addQuotaScopeTypePrefix('user', user?.id || ''),
        storage_host_name: selectedVolumeInfo?.id || '',
        skipQuotaScope:
          currentProject?.id === undefined ||
          user?.id === undefined ||
          !selectedVolumeInfo?.id,
      },
    );

  if (!selectedVolumeInfo?.capabilities?.includes('quota')) {
    return (
      // antd `Empty` → `EmptyState` (MAPPING §4); the simple placeholder
      // illustration is dropped and `description` becomes the required title.
      <EmptyState
        title={t('storageHost.QuotaDoesNotSupported')}
        style={{ margin: 'auto 25px' }}
      />
    );
  }

  const projectUsageBytes = _.toFinite(
    project_quota_scope?.details?.usage_bytes,
  );
  const projectHardLimitBytes = _.toFinite(
    project_quota_scope?.details?.hard_limit_bytes,
  );
  const projectPercent = projectHardLimitBytes
    ? _.toFinite(
        ((projectUsageBytes / projectHardLimitBytes) * 100)?.toFixed(2),
      )
    : 0;

  const userUsageBytes = _.toFinite(user_quota_scope?.details?.usage_bytes);
  const userHardLimitBytes = _.toFinite(
    user_quota_scope?.details?.hard_limit_bytes,
  );
  const userPercent = userHardLimitBytes
    ? _.toFinite(((userUsageBytes / userHardLimitBytes) * 100)?.toFixed(2))
    : 0;

  return (
    // antd `Row gutter={[24,16]}` + two `Col span={12}` → Astryx `Grid` with a
    // 24-track budget and `GridSpan span={12}` (MAPPING §3.9). No breakpoint
    // props were in play, so this is a straight translation; gutter 24/16px
    // becomes columnGap step 6 / rowGap step 4 (step n = 4n px).
    <Grid columns={24} columnGap={6} rowGap={4}>
      <GridSpan
        columns={12}
        style={{
          borderRight: `1px solid ${token('--color-border')}`,
        }}
      >
        <BAIProgress
          title={
            <BAIFlex direction="column" align="start">
              <Text
                color="secondary"
                style={{ fontSize: token('--font-size-sm') }}
              >
                {t('data.Project')}
              </Text>
              <Text style={{ fontSize: token('--font-size-base') }}>
                {currentProject?.name}
              </Text>
            </BAIFlex>
          }
          percent={projectPercent}
          used={
            projectUsageBytes === 0
              ? ''
              : `${convertToDecimalUnit(_.toString(projectUsageBytes), 'g')?.displayValue}`
          }
          total={
            projectHardLimitBytes === 0
              ? ''
              : `${convertToDecimalUnit(_.toString(projectHardLimitBytes), 'g')?.displayValue}`
          }
        />
      </GridSpan>
      <GridSpan columns={12}>
        <BAIProgress
          percent={userPercent}
          title={
            <BAIFlex direction="column" align="start">
              <Text
                color="secondary"
                style={{ fontSize: token('--font-size-sm') }}
              >
                {t('data.User')}
              </Text>
              <Text style={{ fontSize: token('--font-size-base') }}>
                {baiClient?.full_name}
              </Text>
            </BAIFlex>
          }
          used={
            userUsageBytes === 0
              ? ''
              : convertToDecimalUnit(_.toString(userUsageBytes), 'auto')
                  ?.displayValue
          }
          total={
            userHardLimitBytes === 0
              ? ''
              : convertToDecimalUnit(_.toString(userHardLimitBytes), 'auto')
                  ?.displayValue
          }
        />
      </GridSpan>
    </Grid>
  );
};

// Modal-body view for per-volume quota. Intentionally not wrapped in a BAICard
// — the consuming Modal provides its own title and chrome, so a nested card
// would duplicate the header and inflate the modal visually.
const QuotaPerStorageVolumePanelCard: React.FC<
  QuotaPerStorageVolumePanelCardProps
> = ({ defaultVolumeInfo }) => {
  'use memo';
  const [selectedVolumeInfo, setSelectedVolumeInfo] = useState<
    VolumeInfo | undefined
  >(defaultVolumeInfo);
  // Reset the inline selection when the consumer passes a different
  // `defaultVolumeInfo` while the panel stays mounted (e.g., reopened for a
  // different host). Compare ids only — following the
  // "storing info from previous renders" pattern
  // (https://react.dev/reference/react/useState#storing-information-from-previous-renders),
  // so the badge reflects the latest prop without an effect.
  const [prevDefaultVolumeId, setPrevDefaultVolumeId] = useState(
    defaultVolumeInfo?.id,
  );
  if (prevDefaultVolumeId !== defaultVolumeInfo?.id) {
    setPrevDefaultVolumeId(defaultVolumeInfo?.id);
    setSelectedVolumeInfo(defaultVolumeInfo);
  }

  return (
    <BAIFlex direction="column" align="stretch" gap={'md'}>
      <StorageSelect
        value={selectedVolumeInfo?.id}
        onChange={(__, vInfo) => {
          setSelectedVolumeInfo(vInfo);
        }}
        autoSelectType={defaultVolumeInfo ? undefined : 'usage'}
        showUsageStatus
        showSearch
        style={{ alignSelf: 'flex-start', minWidth: 240 }}
      />
      {/* antd `Skeleton paragraph={{rows: 0}}` (title bar only) →
          `BAISkeleton rows={0}`; `active` is always-on behaviour. */}
      <Suspense fallback={<BAISkeleton rows={0} />}>
        <QuotaScopeContent selectedVolumeInfo={selectedVolumeInfo} />
      </Suspense>
    </BAIFlex>
  );
};

export default QuotaPerStorageVolumePanelCard;
