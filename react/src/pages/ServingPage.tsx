import Flex from '../components/Flex';
import { filterEmptyItem } from '../helper';
import { Card, Skeleton, theme } from 'antd';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { StringParam, useQueryParam, withDefault } from 'use-query-params';

// FIXME: need to apply filtering type of service later
type TabKey = 'services' | 'chatting'; //  "running" | "finished" | "others";

const EndpointListPage = React.lazy(() => import('./EndpointListPage'));
const ChattingPage = React.lazy(
  () => import('../components/lablupTalkativotUI/LLMPlaygroundPage'),
);

interface ServingPageProps {}

const tabParam = withDefault(StringParam, 'services');

const ServingPage: React.FC<ServingPageProps> = ({ ...props }) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [curTabKey, setCurTabKey] = useQueryParam('tab', tabParam, {
    updateType: 'replace',
  });

  const tabList = filterEmptyItem([
    { key: 'services', label: t('modelService.Services') },
    // FIXME: need to apply filtering type of service later
    // {
    //   key: "running",
    //   label: t("session.Running"),
    // },
    // {
    //   key: "finished",
    //   label: t("session.Finished"),
    // },
    // {
    //   key: "others",
    //   label: t("session.Others"),
    // },
    { key: 'chatting', label: 'LLM Playground' },
  ]);
  return (
    <Flex direction="column" align="stretch" gap={'md'}>
      <Card
        activeTabKey={curTabKey}
        onTabChange={(key) => {
          setCurTabKey(key as TabKey);
        }}
        tabList={tabList}
        styles={{
          body: {
            padding: 0,
            paddingTop: 1,
            overflow: 'hidden',
          },
        }}
      >
        {curTabKey === 'services' ? (
          <Suspense
            fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
          >
            <EndpointListPage />
          </Suspense>
        ) : null}
        {curTabKey === 'chatting' ? (
          <Suspense
            fallback={<Skeleton active style={{ padding: token.paddingMD }} />}
          >
            <ChattingPage />
          </Suspense>
        ) : null}
      </Card>
    </Flex>
  );
};

export default ServingPage;
