import { Skeleton } from 'antd';
import { BAICard, filterOutEmpty } from 'backend.ai-ui';
import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import PendingSessionNodeList from 'src/components/PendingSessionNodeList';
import { useWebUINavigate } from 'src/hooks';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'pending-sessions');

interface SchedulerPageProps {}

const SchedulerPage: React.FC<SchedulerPageProps> = () => {
  const { t } = useTranslation();
  const [curTabKey] = useQueryParam('tab', tabParam);
  const webUINavigate = useWebUINavigate();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/scheduler',
            search: new URLSearchParams({
              tab: key,
            }).toString(),
          },
          {
            params: {
              tab: key,
            },
          },
        );
      }}
      tabList={filterOutEmpty([
        {
          key: 'pending-sessions',
          label: t('scheduler.PendingSessions'),
        },
      ])}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'pending-sessions' && (
          <BAIErrorBoundary>
            <PendingSessionNodeList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default SchedulerPage;
