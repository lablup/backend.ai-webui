/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairResourcePolicyInfoModalFragment$key } from '../__generated__/KeypairResourcePolicyInfoModalFragment.graphql';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import {
  filterOutEmpty,
  BAIFlex,
  BAIMetadataList,
  BAIModalProps,
  BAIModal,
  BAIAllowedVfolderHostsWithPermission,
  BAIResourceNumberWithIcon,
  BAIText,
  BAI_BREAKPOINTS,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useFragment, graphql } from 'react-relay';

interface InfoModalProps extends BAIModalProps {
  open: boolean;
  onRequestClose: () => void;
  resourcePolicyFrgmt: KeypairResourcePolicyInfoModalFragment$key | null;
}

interface ResourcePolicyInfoItem {
  key: string;
  label: string;
  children: ReactNode;
}

const KeypairResourcePolicyInfoModal: React.FC<InfoModalProps> = ({
  open,
  onRequestClose,
  resourcePolicyFrgmt,
  ...modalProps
}) => {
  const { t } = useTranslation();

  const resourcePolicy = useFragment(
    graphql`
      fragment KeypairResourcePolicyInfoModalFragment on KeyPairResourcePolicy {
        name
        created_at
        default_for_unspecified
        total_resource_slots
        max_session_lifetime
        max_concurrent_sessions
        max_containers_per_session
        idle_timeout
        allowed_vfolder_hosts
        max_pending_session_count @since(version: "24.03.4")
        max_concurrent_sftp_sessions @since(version: "24.03.4")
        max_pending_session_resource_slots @since(version: "24.03.4")
        ...BAIAllowedVfolderHostsWithPermissionFromKeyPairResourcePolicyFragment
      }
    `,
    resourcePolicyFrgmt,
  );

  // PILOT-DECISION: the nested antd `Descriptions size="small" column={2}`
  // wrapping a single unlabeled `Descriptions.Item` was only a styling hack
  // (the accompanying `antd-style` `createStyles` stripped its row border and
  // shrank its table to fit-content) used to lay out the resource-slot chips
  // — it carried no real key/value structure of its own. `MetadataList` has
  // no destination for that hack, and per the simplicity-over-parity policy
  // it is dropped entirely: the `BAIFlex` of resource chips now renders
  // directly as the outer item's children.
  const descriptionItems: ResourcePolicyInfoItem[] = filterOutEmpty([
    {
      key: 'name',
      label: t('resourcePolicy.Name'),
      children: resourcePolicy?.name ? (
        <BAIText copyable>{resourcePolicy.name}</BAIText>
      ) : (
        '-'
      ),
    },
    {
      key: 'default-for-unspecified',
      label: t('resourcePolicy.DefaultForUnspecified'),
      children: resourcePolicy?.default_for_unspecified || '∞',
    },
    {
      key: 'created-at',
      label: t('resourcePolicy.CreatedAt'),
      children: dayjs(resourcePolicy?.created_at).format('lll') || '∞',
    },
    {
      key: 'resource-policy',
      label: t('resourcePolicy.ResourcePolicy'),
      children: resourcePolicy?.total_resource_slots ? (
        !_.isEmpty(JSON.parse(resourcePolicy?.total_resource_slots)) ? (
          <BAIFlex direction="column" align="start" style={{ width: '100%' }}>
            {_.map(
              JSON.parse(resourcePolicy?.total_resource_slots),
              (v, type) => (
                <BAIResourceNumberWithIcon
                  key={type}
                  type={type}
                  value={_.toString(v)}
                />
              ),
            )}
          </BAIFlex>
        ) : (
          '-'
        )
      ) : (
        '-'
      ),
    },
    {
      key: 'storage-nodes',
      label: t('resourcePolicy.StorageNodes'),
      children:
        resourcePolicy &&
        !_.isEmpty(
          JSON.parse(resourcePolicy?.allowed_vfolder_hosts || '{}'),
        ) ? (
          <BAIAllowedVfolderHostsWithPermission
            allowedHostPermissionFrgmtFromKeyPair={resourcePolicy}
          />
        ) : (
          '-'
        ),
    },
    {
      key: 'concurrency',
      label: t('resourcePolicy.Concurrency'),
      children: resourcePolicy?.max_concurrent_sessions || '∞',
    },
    {
      key: 'cluster-size',
      label: t('resourcePolicy.ClusterSize'),
      children: resourcePolicy?.max_containers_per_session,
    },
    {
      key: 'idle-timeout',
      label: t('resourcePolicy.IdleTimeout'),
      children: resourcePolicy?.idle_timeout || '∞',
    },
    {
      key: 'max-session-lifetime',
      label: t('session.MaxSessionLifetime'),
      children: resourcePolicy?.max_session_lifetime || '∞',
    },
    {
      key: 'max-pending-session-count',
      label: t('resourcePolicy.MaxPendingSessionCount'),
      children:
        _.isNull(resourcePolicy?.max_pending_session_count) ||
        _.isUndefined(resourcePolicy?.max_pending_session_count)
          ? '∞'
          : resourcePolicy?.max_pending_session_count,
    },
    {
      key: 'max-concurrent-sftp-sessions',
      label: t('resourcePolicy.MaxConcurrentSFTPSessions'),
      children: resourcePolicy?.max_concurrent_sftp_sessions || '∞',
    },
    {
      key: 'max-pending-session-resource-slots',
      label: t('resourcePolicy.MaxPendingSessionResourceSlots'),
      children: resourcePolicy?.max_pending_session_resource_slots ? (
        !_.isEmpty(
          JSON.parse(resourcePolicy?.max_pending_session_resource_slots),
        ) ? (
          <BAIFlex direction="column" align="start">
            {_.map(
              JSON.parse(resourcePolicy?.max_pending_session_resource_slots),
              (v, type) => (
                <BAIResourceNumberWithIcon
                  key={type}
                  type={type}
                  value={_.toString(v)}
                />
              ),
            )}
          </BAIFlex>
        ) : (
          '-'
        )
      ) : (
        '-'
      ),
    },
  ]);

  return (
    <BAIModal
      open={open}
      onCancel={() => onRequestClose()}
      footer={null}
      title={`${t('resourcePolicy.ResourcePolicy')}: '${resourcePolicy?.name}'`}
      centered
      // Responsive policy (ticket 14): `token.screenSM` was a 576px width
      // CONSTANT, not responsive behaviour — read the breakpoint table, not
      // the theme.
      width={BAI_BREAKPOINTS.sm}
      {...modalProps}
    >
      <BAIMetadataList>
        {descriptionItems.map((item) => (
          <MetadataListItem key={item.key} label={item.label}>
            {item.children}
          </MetadataListItem>
        ))}
      </BAIMetadataList>
    </BAIModal>
  );
};

export default KeypairResourcePolicyInfoModal;
