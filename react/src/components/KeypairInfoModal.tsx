/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { KeypairInfoModalFragment$key } from '../__generated__/KeypairInfoModalFragment.graphql';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { HStack, VStack } from '@astryxdesign/core/Stack';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import {
  BAIMetadataList,
  BAIModal,
  type BAIModalProps,
  PRIMARY_TOKEN_COLOR,
  BAIText,
  tokenColorForTagColor,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { graphql, useFragment } from 'react-relay';

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
        concurrency_used
        is_default
      }
    `,
    keypairInfoModalFrgmt,
  );
  const isMainAccessKey = keypair?.is_default === true;

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
          {isMainAccessKey && (
            <Token
              color={PRIMARY_TOKEN_COLOR}
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
                <Token color={PRIMARY_TOKEN_COLOR} label="admin" />
                <Token color={tokenColorForTagColor('green')} label="user" />
              </HStack>
            ) : (
              <Token color={tokenColorForTagColor('green')} label="user" />
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
