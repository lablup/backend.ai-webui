import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Card, Button, Typography } from "antd";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";
import { useWebComponentInfo } from "./DefaultProviders";
import { useTranslation, Trans } from "react-i18next";
import Flex from "./Flex";

const { Text } = Typography;

interface MaintenanceProps {}
const Maintenance: React.FC<MaintenanceProps> = () => {
  const [recalculating, setRecalculating] = useState(false);
  const [scanning, setScanning] = useState(false);

  const { t } = useTranslation();
  const {
    props: { shadowRoot, value, dispatchEvent },
  } = useWebComponentInfo();

  return (
    <Flex>
      <Flex>
        <Card 
          title={t('maintenance.MatchDatabase')}
          style={{
            width: '400px',
            minHeight: '250px',
            margin: '10px',
          }}
          actions={[
            <Button
              key="recalculating"
              disabled={recalculating}
              icon={<ReloadOutlined />}
              onClick={() => {
                dispatchEvent && dispatchEvent("", {value: ""})
              }}
            >
              {t('maintenance.RecalculateUsage')}
            </Button>,
          ]}
        >
          <Flex direction="column" align="start" justify="center" style={{ minHeight: '88px' }}>
            <Text strong>{t('maintenance.MatchDatabase')}</Text>
            <Text type="secondary">
              <Trans>
                {t('maintenance.DescMatchDatabase')}
              </Trans>
            </Text>
          </Flex>
        </Card>
      </Flex>
      <Flex>
        <Card
          title={t('maintenance.ImagesEnvironment')}
          style={{
            width: '400px',
            minHeight: '250px',
            margin: '10px',
          }}
          actions={[
            <Button
              key="cleanup"
              disabled={scanning}
              icon={<ReloadOutlined />}
              onClick={() => {
                dispatchEvent && dispatchEvent("", {value: ""})
              }}
            >{t('maintenance.RescanImages')}</Button>,
          ]}
        >
          <Flex direction="column" align="start" justify="center" style={{ minHeight: '88px' }}>
            <Text strong>{t('maintenance.RescanImageList')}</Text>
            <Text type="secondary">
              <Trans>
                {t('maintenance.DescRescanImageList')}
              </Trans>
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
};

export default Maintenance;
