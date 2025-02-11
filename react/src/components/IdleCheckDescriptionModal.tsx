import BAIModal from './BAIModal';
import Flex from './Flex';
import { ModalProps, Typography, theme } from 'antd';
import { useTranslation } from 'react-i18next';

interface IdleCheckDescriptionModalProps extends ModalProps {}

const IdleCheckDescriptionModal: React.FC<IdleCheckDescriptionModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();

  return (
    <BAIModal
      title={t('session.IdleChecks')}
      footer={null}
      width={700}
      {...modalProps}
    >
      <Typography.Text>{t('session.IdleChecksDesc')}</Typography.Text>

      <Typography.Title level={5}>
        {t('session.MaxSessionLifetime')}
      </Typography.Title>
      <p>{t('session.MaxSessionLifetimeDesc')}</p>

      <Typography.Title level={5}>
        {t('session.NetworkIdleTimeout')}
      </Typography.Title>
      <p>{t('session.NetworkIdleTimeoutDesc')}</p>

      <Typography.Title level={5}>
        {t('session.UtilizationIdleTimeout')}
      </Typography.Title>
      <p>{t('session.UtilizationIdleTimeoutDesc')}</p>
      <Flex
        direction="column"
        align="stretch"
        style={{ marginLeft: token.marginMD }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t('session.GracePeriod')}
        </Typography.Title>
        <p>{t('session.GracePeriodDesc')}</p>
        <Typography.Title level={5} style={{ margin: 0 }}>
          {t('session.UtilizationThreshold')}
        </Typography.Title>
        <p>{t('session.UtilizationThresholdDesc')}</p>
      </Flex>
    </BAIModal>
  );
};

export default IdleCheckDescriptionModal;
