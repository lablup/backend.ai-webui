import BAIModal from './BAIModal';
import { KeypairInfoModalFragment$key } from './__generated__/KeypairInfoModalFragment.graphql';
import { Descriptions, ModalProps } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { useFragment } from 'react-relay';

interface KeypairInfoModalProps extends ModalProps {
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
        created_at
        last_used
        resource_policy
        num_queries
        rate_limit
        concurrency_used @since(version: "24.09.0")
        concurrency_limit @since(version: "24.09.0")
      }
    `,
    keypairInfoModalFrgmt,
  );

  return (
    <BAIModal
      title={t('credential.KeypairDetail')}
      onCancel={() => onRequestClose()}
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
          {keypair?.secret_key}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.CreatedAt')}>
          {dayjs(keypair?.created_at).format('lll')}
        </Descriptions.Item>
        <Descriptions.Item label={t('credential.Lastused')}>
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
          label={`${t('credential.RateLimit')} ${t('credential.for900seconds')}`}
        >
          {keypair?.rate_limit}
        </Descriptions.Item>
      </Descriptions>
    </BAIModal>
  );
};

export default KeypairInfoModal;
