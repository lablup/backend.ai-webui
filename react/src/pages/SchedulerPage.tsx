import { QuestionCircleOutlined } from '@ant-design/icons';
import { Skeleton, theme, Tooltip } from 'antd';
import { BAICard, BAIFlex } from 'backend.ai-ui';
import { Suspense } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import BAIErrorBoundary from 'src/components/BAIErrorBoundary';
import FairShareList from 'src/components/FairShareItems/FairShareList';
import { useWebUINavigate } from 'src/hooks';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

const tabParam = withDefault(StringParam, 'fair-share');

interface SchedulerPageProps {}

const SchedulerPage: React.FC<SchedulerPageProps> = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey] = useQueryParam('tab', tabParam);
  const webUINavigate = useWebUINavigate();

  return (
    <BAICard
      activeTabKey={curTabKey}
      onTabChange={(key) => {
        webUINavigate(
          {
            pathname: '/fair-share',
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
      tabList={[
        {
          key: 'fair-share',
          tab: (
            <BAIFlex gap="xxs">
              {t('fairShare.FairShareSetting')}
              <Tooltip
                title={<Trans i18nKey={t('fairShare.SchedulerDescription')} />}
              >
                <QuestionCircleOutlined style={{ fontSize: token.fontSize }} />
              </Tooltip>
            </BAIFlex>
          ),
        },
      ]}
    >
      <Suspense fallback={<Skeleton active />}>
        {curTabKey === 'fair-share' && (
          <BAIErrorBoundary>
            <FairShareList />
          </BAIErrorBoundary>
        )}
      </Suspense>
    </BAICard>
  );
};

export default SchedulerPage;
