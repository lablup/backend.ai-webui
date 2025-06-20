import { QuotaPerStorageVolumePanelCardQuery } from '../__generated__/QuotaPerStorageVolumePanelCardQuery.graphql';
import { QuotaPerStorageVolumePanelCardUserQuery } from '../__generated__/QuotaPerStorageVolumePanelCardUserQuery.graphql';
import { addQuotaScopeTypePrefix, convertToDecimalUnit } from '../helper';
import { useCurrentDomainValue, useSuspendedBackendaiClient } from '../hooks';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import BAICard, { BAICardProps } from './BAICard';
import BAIProgress from './BAIProgress';
import Flex from './Flex';
import FlexActivityIndicator from './FlexActivityIndicator';
import StorageSelect from './StorageSelect';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Col, Empty, Row, theme, Tooltip, Typography } from 'antd';
import _ from 'lodash';
import React, { useDeferredValue, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export type VolumeInfo = {
  id: string;
  backend: string;
  capabilities: string[];
  usage: {
    percentage: number;
  };
  sftp_scaling_groups: string[];
};

interface QuotaPerStorageVolumePanelCardProps extends BAICardProps {}

const QuotaPerStorageVolumePanelCard: React.FC<
  QuotaPerStorageVolumePanelCardProps
> = ({ ...baiCardProps }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [selectedVolumeInfo, setSelectedVolumeInfo] = useState<VolumeInfo>();
  const deferredSelectedVolumeInfo = useDeferredValue(selectedVolumeInfo);
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
          currentProject?.id,
        ),
        user_quota_scope_id: addQuotaScopeTypePrefix('user', user?.id || ''),
        storage_host_name: deferredSelectedVolumeInfo?.id || '',
        skipQuotaScope:
          currentProject?.id === undefined ||
          user?.id === undefined ||
          !deferredSelectedVolumeInfo?.id,
      },
    );

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
    <BAICard
      {...baiCardProps}
      title={
        <Flex gap={'xs'} align="center">
          {t('data.QuotaPerStorageVolume')}
          <Tooltip title={t('data.HostDetails')}>
            <QuestionCircleOutlined
              style={{ color: token.colorTextDescription }}
            />
          </Tooltip>
        </Flex>
      }
      extra={
        <Flex
          style={{
            marginRight: -8,
          }}
        >
          <StorageSelect
            value={selectedVolumeInfo?.id}
            onChange={(__, vInfo) => {
              setSelectedVolumeInfo(vInfo);
            }}
            autoSelectType="usage"
            showUsageStatus
            showSearch
            variant="borderless"
          />
        </Flex>
      }
      styles={{
        body: {
          paddingTop: token.paddingLG,
        },
      }}
    >
      {selectedVolumeInfo !== deferredSelectedVolumeInfo ? (
        <FlexActivityIndicator style={{ minHeight: 120 }} />
      ) : selectedVolumeInfo?.capabilities?.includes('quota') ? (
        <Row gutter={[24, 16]}>
          <Col
            span={12}
            style={{
              borderRight: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <BAIProgress
              title={
                <Flex direction="column" align="start">
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {t('data.Project')}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: token.fontSize }}>
                    {currentProject?.name}
                  </Typography.Text>
                </Flex>
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
                <Flex direction="column" align="start">
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {t('data.User')}
                  </Typography.Text>
                  <Typography.Text style={{ fontSize: token.fontSize }}>
                    {baiClient?.full_name}
                  </Typography.Text>
                </Flex>
              }
              used={
                userUsageBytes === 0
                  ? ''
                  : convertToDecimalUnit(_.toString(userUsageBytes), 'g')
                      ?.displayValue
              }
              total={
                userHardLimitBytes === 0
                  ? ''
                  : convertToDecimalUnit(_.toString(userHardLimitBytes), 'g')
                      ?.displayValue
              }
            />
          </Col>
        </Row>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('storageHost.QuotaDoesNotSupported')}
          style={{ margin: 'auto 25px' }}
        />
      )}
    </BAICard>
  );
};

export default QuotaPerStorageVolumePanelCard;
