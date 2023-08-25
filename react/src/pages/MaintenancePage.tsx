import { useWebComponentInfo } from '../components/DefaultProviders';
import Flex from '../components/Flex';
import { RedoOutlined } from '@ant-design/icons';
import { Button, Card, Row, Col, Typography, theme } from 'antd';
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

const MaintenancePage: React.FC = () => {
  const { t } = useTranslation();

  const { value, dispatchEvent } = useWebComponentInfo();
  let parsedValue: {
    recalculating: boolean;
    scanning: boolean;
  };
  try {
    parsedValue = JSON.parse(value || '');
  } catch (error) {
    parsedValue = {
      recalculating: false,
      scanning: false,
    };
  }
  const { recalculating, scanning } = parsedValue;

  const { token } = theme.useToken();

  return (
    <Flex
      direction="row"
      align="stretch"
      style={{ margin: token.marginSM, gap: token.margin }}
    >
      <Row gutter={[14, token.margin]}>
        <Col>
          <Card title={t('maintenance.Fix')}>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                paddingBottom: '12px',
              }}
            >
              {t('maintenance.MatchDatabase')}
            </Typography.Title>
            <Trans>{t('maintenance.DescMatchDatabase')}</Trans>
            <Button
              block
              disabled={recalculating}
              icon={<RedoOutlined />}
              onClick={() => dispatchEvent('recalculate', null)}
              style={{ marginTop: '12px' }}
            >
              {recalculating
                ? t('maintenance.Recalculating')
                : t('maintenance.RecalculateUsage')}
            </Button>
          </Card>
        </Col>
        <Col>
          <Card title={t('maintenance.ImagesEnvironment')}>
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                paddingBottom: '12px',
              }}
            >
              {t('maintenance.RescanImageList')}
            </Typography.Title>
            <Trans>{t('maintenance.DescRescanImageList')}</Trans>
            <Button
              block
              disabled={scanning}
              icon={<RedoOutlined />}
              onClick={() => dispatchEvent('rescan', null)}
              style={{ marginTop: '12px' }}
            >
              {scanning
                ? t('maintenance.RescanImageScanning')
                : t('maintenance.RescanImages')}
            </Button>
          </Card>
        </Col>
      </Row>
    </Flex>
  );
};

export default MaintenancePage;
