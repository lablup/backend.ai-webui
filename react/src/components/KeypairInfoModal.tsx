import { KeypairInfoModalFragment$key } from '../__generated__/KeypairInfoModalFragment.graphql';
import { KeypairInfoModalQuery } from '../__generated__/KeypairInfoModalQuery.graphql';
import BAIModal from './BAIModal';
import Flex from './Flex';
import { Descriptions, ModalProps, Tag, Typography, theme } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useFragment, useLazyLoadQuery } from 'react-relay';

interface KeypairInfoModalProps extends ModalProps {
  keypairInfoModalFrgmt: KeypairInfoModalFragment$key | null;
  onRequestClose: () => void;
}

const KeypairInfoModal: React.FC<KeypairInfoModalProps> = ({
  keypairInfoModalFrgmt = null,
  onRequestClose,
  ...modalProps
}) => {
  const { token } = theme.useToken();

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
        <Flex gap={'xs'}>
          <Typography.Text style={{ fontSize: token.fontSizeHeading5 }}>
            {t('credential.KeypairDetail')}
          </Typography.Text>
          {user?.main_access_key === keypair?.access_key && (
            <Tag color="red">{t('credential.MainAccessKey')}</Tag>
          )}
        </Flex>
      }
      onCancel={() => onRequestClose()}
      footer={null}
      {...modalProps}
    >
      <Descriptions
        title={t('credential.Information')}
        size="small"
        column={1}
        labelStyle={{ width: '40%' }}
      >
        <Descriptions.Item label={t('credential.UserID')}>
          {keypair?.user_id}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.AccessKey')}>
          {keypair?.access_key}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.SecretKey')}>
          <Typography.Text copyable={{ text: keypair?.secret_key ?? '' }}>
            {keypair?.secret_key ? '********' : ''}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Permission')}>
          {keypair?.is_admin ? (
            <>
              <Tag color="red">admin</Tag>
              <Tag color="green">user</Tag>
            </>
          ) : (
            <Tag color="green">user</Tag>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.CreatedAt')}>
          {dayjs(keypair?.created_at).format('lll')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.LastUsed')}>
          {keypair?.last_used ? dayjs(keypair?.last_used).format('lll') : '-'}
        </Descriptions.Item>
      </Descriptions>
      <br />
      <Descriptions
        title={t('credential.Allocation')}
        size="small"
        column={1}
        labelStyle={{ width: '40%' }}
      >
        <Descriptions.Item label={t('credential.ResourcePolicy')}>
          {keypair?.resource_policy}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.NumberOfQueries')}>
          {keypair?.num_queries}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.ConcurrentSessions')}>
          {keypair?.concurrency_used}
        </Descriptions.Item>
        <Descriptions.Item
          label={`${t('credential.RateLimit')} ${t('credential.For900Seconds')}`}
        >
          {keypair?.rate_limit}
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default KeypairInfoModal;
