import ConfigurationsSettingList from '../components/ConfigurationsSettingList';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

type TabKey = 'configurations';

const tabParam = withDefault(StringParam, 'configurations');

const ConfigurationsPage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam);

  return (
    <Card
      activeTabKey="configurations"
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'configurations',
          tab: t('webui.menu.Configurations'),
        },
      ]}
    >
      {curTabKey === 'configurations' && <ConfigurationsSettingList />}
    </Card>
  );
};

export default ConfigurationsPage;
