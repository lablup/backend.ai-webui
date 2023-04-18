import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { ReloadOutlined, DeleteOutlined } from "@ant-design/icons";
import { Card, Button, Typography } from "antd";
import { ReactWebComponentProps } from "../helper/react-to-webcomponent";
import { useWebComponentInfo } from "./DefaultProviders";
import { useTranslation } from "react-i18next";
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
    <Flex direction="column">
      <Flex>
        <Card 
          title={t('maintenance.MatchDatabase')}
          actions={[
            <Button
              key="recalculating"
              disabled={recalculating}
              icon={<ReloadOutlined />}
              onClick={() => {
                dispatchEvent && dispatchEvent("", {value: ""})
              }}
            >{t('maintenance.RecalculateUsage')}</Button>,
          ]}
        >
          <Flex direction="column" align="start">
            <Text strong>{t('maintenance.MatchDatabase')}</Text>
            <Text type="secondary">{t('maintenance.DescMatchDatabase')}</Text>
          </Flex>
        </Card>
      </Flex>
      <Flex>
        <Card 
          title={t('maintenance.ImagesEnvironment')}
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
          <Flex direction="column" align="start">
            <Text strong>{t('maintenance.RescanImageList')}</Text>
            <Text type="secondary">{t('maintenance.DescRescanImageList')}</Text>
          </Flex>
        </Card>
      </Flex>
    </Flex>
  );
};

export default Maintenance;
