import MaintenanceSettingList from '../components/MaintenanceSettingList';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'maintenance';

const tabParam = withDefault(StringParam, 'maintenance');

const MaintenancePage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey="maintenance"
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
      ]}
    >
      {curTabKey === 'maintenance' && <MaintenanceSettingList />}
    </Card>
  );
};

export default MaintenancePage;
