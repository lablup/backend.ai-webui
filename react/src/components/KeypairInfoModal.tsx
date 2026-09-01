/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairInfoModalFragment$key } from '../__generated__/KeypairInfoModalFragment.graphql';
import { KeypairInfoModalQuery } from '../__generated__/KeypairInfoModalQuery.graphql';
import { Badge } from '@astryxdesign/core/Badge';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  PRIMARY_TAG_VARIANT,
  badgeVariantForTagColor,
  BAIText,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';

interface KeypairInfoModalProps extends BAIModalProps {
  keypairInfoModalFrgmt: KeypairInfoModalFragment$key | null;
  onRequestClose: () => void;
}

const KeypairInfoModal: React.FC<KeypairInfoModalProps> = ({
  keypairInfoModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const keypair = useFragment(
    graphql`
      fragment KeypairInfoModalFragment on KeyPair {
        user_id
        access_key
        secret_key
        is_admin
        created_at
        last_used
        resource_policy
        num_queries
        rate_limit
        concurrency_used @since(version: "24.09.0")
      }
    `,
    keypairInfoModalFrgmt,
  );

  // FIXME: Keypair query does not support main_access_key info.
  const { user } = useLazyLoadQuery<KeypairInfoModalQuery>(
    graphql`
      query KeypairInfoModalQuery($domain_name: String, $email: String) {
        user(domain_name: $domain_name, email: $email) {
          main_access_key @since(version: "24.03.0")
        }
      }
    `,
    {
      email: keypair?.user_id,
    },
    {
      fetchPolicy:
        modalProps.open && keypair?.user_id ? 'network-only' : 'store-only',
    },
  );

  return (
    <BAIModal
      title={
        <HStack gap={1} align="center">
          {/* PILOT-DECISION: antd used `Typography.Text
              style={{fontSize: token.fontSizeHeading5}}` to bump the title
              past BAIModal's default title size. Astryx `Text` takes no
              inline `style`/fontSize override (P5) — dropped, BAIModal's own
              title styling is accepted as-is (defaults-first). */}
          <Text>{t('credential.KeypairDetail')}</Text>
          {user?.main_access_key === keypair?.access_key && (
            <Badge
              variant={PRIMARY_TAG_VARIANT}
              label={t('credential.MainAccessKey')}
            />
          )}
        </HStack>
      }
      onCancel={() => onRequestClose()}
      footer={null}
      {...modalProps}
    >
      {/* PILOT-DECISION: `<br />` between the two Descriptions blocks →
          VStack gap (MetadataList has no built-in inter-list spacing). */}
      <VStack align="stretch" gap={4}>
        <BAIMetadataList
          title={t('credential.Information')}
          label={{ position: 'start', width: '40%' }}
        >
          <MetadataListItem label={t('credential.UserID')}>
            {keypair?.user_id}
          </MetadataListItem>
          <MetadataListItem label={t('credential.AccessKey')}>
            {keypair?.access_key}
          </MetadataListItem>
          <MetadataListItem label={t('credential.SecretKey')}>
            <BAIText copyable={{ text: keypair?.secret_key ?? '' }}>
              {keypair?.secret_key ? '********' : ''}
            </BAIText>
          </MetadataListItem>
          <MetadataListItem label={t('credential.Permission')}>
            {keypair?.is_admin ? (
              <HStack gap={1}>
                <Badge variant={PRIMARY_TAG_VARIANT} label="admin" />
                <Badge
                  variant={badgeVariantForTagColor('green')}
                  label="user"
                />
              </HStack>
            ) : (
              <Badge variant={badgeVariantForTagColor('green')} label="user" />
            )}
          </MetadataListItem>
          <MetadataListItem label={t('credential.CreatedAt')}>
            {dayjs(keypair?.created_at).format('lll')}
          </MetadataListItem>
          <MetadataListItem label={t('credential.LastUsed')}>
            {keypair?.last_used ? dayjs(keypair?.last_used).format('lll') : '-'}
          </MetadataListItem>
        </BAIMetadataList>
        <BAIMetadataList
          title={t('credential.Allocation')}
          label={{ position: 'start', width: '40%' }}
        >
          <MetadataListItem label={t('credential.ResourcePolicy')}>
            {keypair?.resource_policy}
          </MetadataListItem>
          <MetadataListItem label={t('credential.NumberOfQueries')}>
            {keypair?.num_queries}
          </MetadataListItem>
          <MetadataListItem label={t('credential.ConcurrentSessions')}>
            {keypair?.concurrency_used}
          </MetadataListItem>
          <MetadataListItem
            label={`${t('credential.RateLimit')} ${t('credential.For900Seconds')}`}
          >
            {keypair?.rate_limit}
          </MetadataListItem>
        </BAIMetadataList>
      </VStack>
    </BAIModal>
  );
};

export default KeypairInfoModal;
