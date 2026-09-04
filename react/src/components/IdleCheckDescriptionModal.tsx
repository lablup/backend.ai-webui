/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { Heading, Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import { BAIFlex, BAIModal, type BAIModalProps } from 'backend.ai-ui';
import { useTranslation } from 'react-i18next';

interface IdleCheckDescriptionModalProps extends BAIModalProps {}

const IdleCheckDescriptionModal: React.FC<IdleCheckDescriptionModalProps> = ({
  ...modalProps
}) => {
  const { t } = useTranslation();
  const { token } = useTheme();

  return (
    <BAIModal
      title={t('session.ReclamationStatus')}
      footer={null}
      width={700}
      {...modalProps}
    >
      {/* antd `Typography.Title level={5}` → Astryx `Heading level={5}`
          (MAPPING §4). The ramps differ (antd h5 = 16px, Astryx heading-5 =
          12px), so the semantic level is kept and the visual step comes from
          the theme rather than being pinned to antd's px value. */}
      <Text>{t('session.IdleChecksDesc')}</Text>

      <Heading level={5}>{t('session.MaxSessionLifetime')}</Heading>
      <p>{t('session.MaxSessionLifetimeDesc')}</p>

      <Heading level={5}>{t('session.NetworkIdleTimeout')}</Heading>
      <p>{t('session.NetworkIdleTimeoutDesc')}</p>

      <Heading level={5}>{t('session.UtilizationIdleTimeout')}</Heading>
      <p>{t('session.UtilizationIdleTimeoutDesc')}</p>
      <BAIFlex
        direction="column"
        align="stretch"
        style={{ marginLeft: token('--spacing-5') }}
      >
        <Heading level={5} style={{ margin: 0 }}>
          {t('session.GracePeriod')}
        </Heading>
        <p>{t('session.GracePeriodDesc')}</p>
        <Heading level={5} style={{ margin: 0 }}>
          {t('session.UtilizationThreshold')}
        </Heading>
        <p>{t('session.UtilizationThresholdDesc')}</p>
      </BAIFlex>
    </BAIModal>
  );
};

export default IdleCheckDescriptionModal;
