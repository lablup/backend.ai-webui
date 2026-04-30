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
import { Col, Empty, Row, Skeleton, theme, Typography } from 'antd';
import { BAIFlex } from 'backend.ai-ui';
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
  const { token } = theme.useToken();
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
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={t('storageHost.QuotaDoesNotSupported')}
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
    <Row gutter={[24, 16]}>
      <Col
        span={12}
        style={{
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <BAIProgress
          title={
            <BAIFlex direction="column" align="start">
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('data.Project')}
              </Typography.Text>
              <Typography.Text style={{ fontSize: token.fontSize }}>
                {currentProject?.name}
              </Typography.Text>
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
      </Col>
      <Col span={12}>
        <BAIProgress
          percent={userPercent}
          title={
            <BAIFlex direction="column" align="start">
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {t('data.User')}
              </Typography.Text>
              <Typography.Text style={{ fontSize: token.fontSize }}>
                {baiClient?.full_name}
              </Typography.Text>
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
      </Col>
    </Row>
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
      <Suspense fallback={<Skeleton active paragraph={{ rows: 0 }} />}>
        <QuotaScopeContent selectedVolumeInfo={selectedVolumeInfo} />
      </Suspense>
    </BAIFlex>
  );
};

export default QuotaPerStorageVolumePanelCard;
