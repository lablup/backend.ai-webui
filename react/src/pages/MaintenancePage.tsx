import MaintenanceSettingList from '../components/MaintenanceSettingList';
import { Skeleton } from 'antd';
import { BAICard } from 'backend.ai-ui';
import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';

type TabKey = 'maintenance';

const MaintenancePage = () => {
  const { t } = useTranslation();
  const [curTabKey, setCurTabKey] = useQueryState(
    'tab',
    parseAsString.withDefault('maintenance'),
  );

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => setCurTabKey(key as TabKey)}
      tabList={[
        {
          key: 'maintenance',
          tab: t('webui.menu.Maintenance'),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'maintenance' && (
          <BAIErrorBoundary>
            <MaintenanceSettingList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default MaintenancePage;
