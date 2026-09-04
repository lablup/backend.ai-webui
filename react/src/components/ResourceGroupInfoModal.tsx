/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { ResourceGroupInfoModalFragment$key } from '../__generated__/ResourceGroupInfoModalFragment.graphql';
import { ScalingGroupOpts } from './ResourceGroupList';
import { Badge } from '@astryxdesign/core/Badge';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAIMetadataList,
  BAIModal,
  BAIModalProps,
  BAIFlex,
} from 'backend.ai-ui';
import * as _ from 'lodash-es';
import { Check, X } from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface ResourceGroupInfoModalProps extends BAIModalProps {
  resourceGroupFrgmt?: ResourceGroupInfoModalFragment$key | null;
  onRequestClose?: () => void;
}

const ResourceGroupInfoModal: React.FC<ResourceGroupInfoModalProps> = ({
  resourceGroupFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();

  const resourceGroup = useFragment(
    graphql`
      fragment ResourceGroupInfoModalFragment on ScalingGroup {
        name @required(action: NONE)
        description
        is_active
        is_public
        driver
        driver_opts
        scheduler
        scheduler_opts
        wsproxy_addr
      }
    `,
    resourceGroupFrgmt,
  );
  const driverOpts = useMemo(
    () => JSON.parse(resourceGroup?.driver_opts || '{}'),
    [resourceGroup?.driver_opts],
  );
  const schedulerOpts: Partial<ScalingGroupOpts> = useMemo(
    () => JSON.parse(resourceGroup?.scheduler_opts || '{}'),
    [resourceGroup?.scheduler_opts],
  );

  return (
    <BAIModal
      title={t('resourceGroup.ResourceGroupDetail')}
      onCancel={onRequestClose}
      footer={null}
      centered
      {...modalProps}
    >
      {/* antd Descriptions column={1} size="small" title labelStyle →
          MetadataList (MAPPING §4). `size`/`labelStyle` drop; `title` is
          natively supported. The three blocks are separated by BAIFlex gap
          instead of a bare `<br/>`. */}
      <BAIFlex direction="column" align="stretch" gap="md">
        <BAIMetadataList
          title={t('resourceGroup.Information')}
          label={{ position: 'start', width: '50%' }}
        >
          <MetadataListItem label={t('resourceGroup.Name')}>
            {resourceGroup?.name}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Description')}>
            {resourceGroup?.description || '-'}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Active')}>
            {resourceGroup?.is_active ? (
              <Check style={{ color: token('--color-success') }} size="1em" />
            ) : (
              <X
                style={{ color: token('--color-text-secondary') }}
                size="1em"
              />
            )}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Public')}>
            {resourceGroup?.is_public ? (
              <Check style={{ color: token('--color-success') }} size="1em" />
            ) : (
              <X
                style={{ color: token('--color-text-secondary') }}
                size="1em"
              />
            )}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Driver')}>
            {resourceGroup?.driver}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.Scheduler')}>
            {_.toUpper(resourceGroup?.scheduler ?? '')}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.AppProxyAddress')}>
            {resourceGroup?.wsproxy_addr || '-'}
          </MetadataListItem>
        </BAIMetadataList>
        <BAIMetadataList
          title={t('resourceGroup.SchedulerOptions')}
          label={{ position: 'start', width: '50%' }}
        >
          <MetadataListItem label={t('resourceGroup.AllowedSessionTypes')}>
            <BAIFlex
              wrap="wrap"
              direction="row"
              gap={'xs'}
              style={{
                width: '100%',
              }}
            >
              {_.map(schedulerOpts?.allowed_session_types, (value) => {
                return (
                  <Badge
                    key={value}
                    variant="neutral"
                    label={_.startCase(value)}
                  />
                );
              })}
            </BAIFlex>
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.PendingTimeout')}>
            {!_.isNil(schedulerOpts?.pending_timeout) ? (
              <BAIFlex gap={'xxs'} align="end">
                <Text>
                  {`${schedulerOpts.pending_timeout}
                ${t('resourceGroup.TimeoutSeconds')}`}
                </Text>
                {!schedulerOpts?.pending_timeout ? (
                  <Text color="secondary" size="xsm">
                    {`(${t('general.Disabled')})`}
                  </Text>
                ) : null}
              </BAIFlex>
            ) : (
              '-'
            )}
          </MetadataListItem>
          <MetadataListItem label={t('resourceGroup.RetriesToSkipDesc')}>
            {schedulerOpts?.config?.num_retries_to_skip
              ? `${schedulerOpts.config.num_retries_to_skip} ${t('resourceGroup.RetriesToSkip')}`
              : '-'}
          </MetadataListItem>
        </BAIMetadataList>
        {/* FIXME: Currently, the driver options feature is unimplemented. After the feature is implemented,
        it should be changed to show each type instead of the map type. */}
        {!_.isEmpty(driverOpts) ? (
          <BAIMetadataList
            title={t('resourceGroup.DriverOptions')}
            label={{ position: 'start', width: '50%' }}
          >
            {_.map(driverOpts, (value, key) => {
              return (
                <MetadataListItem key={key} label={_.startCase(key)}>
                  {_.isArray(value) ? (
                    <BAIFlex direction="column">
                      {_.map(value, (item) => {
                        return (
                          <Badge key={item} variant="neutral" label={item} />
                        );
                      })}
                    </BAIFlex>
                  ) : (
                    value
                  )}
                </MetadataListItem>
              );
            })}
          </BAIMetadataList>
        ) : null}
      </BAIFlex>
    </BAIModal>
  );
};

export default ResourceGroupInfoModal;
