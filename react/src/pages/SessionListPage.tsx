import Flex from '../components/Flex';
import SessionList from '../components/SessionList';
import { useCurrentProjectValue, useSuspendedBackendaiClient } from '../hooks';
import { ThunderboltTwoTone } from '@ant-design/icons';
import { Alert, Segmented, Tabs, Typography, theme } from 'antd';
import React, { PropsWithChildren, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RUNNINGS = [
  'RUNNING',
  'RESTARTING',
  'TERMINATING',
  'PENDING',
  'SCHEDULED',
  'PREPARING',
  'PULLING',
];
const TAB_STATUS_MAP = {
  running: RUNNINGS,
  interactive: RUNNINGS,
  batch: RUNNINGS,
  inference: RUNNINGS,
  finished: ['TERMINATED', 'CANCELLED'],
  others: ['TERMINATING', 'ERROR'],
  default: RUNNINGS,
};

type TabKey =
  | 'running'
  | 'interactive'
  | 'batch'
  | 'inference'
  | 'finished'
  | 'others'
  | 'default';
const SessionListPage: React.FC<PropsWithChildren> = ({ children }) => {
  const { t } = useTranslation();
  const baiClient = useSuspendedBackendaiClient();
  const { token } = theme.useToken();
  const curProject = useCurrentProjectValue();

  const [selectedTab, setSelectedTab] = useState<TabKey>('running');
  const [selectedGeneration, setSelectedGeneration] = useState<
    'current' | 'next'
  >('next');

  // console.log(compute_session_list?.items[0].);
  return (
    <>
      <Alert
        message={
          <Flex gap={'md'}>
            <Typography.Text>
              This is{' '}
              {selectedGeneration === 'current'
                ? 'current version'
                : 'NEXT generation'}{' '}
              of session list. you can switch anytime.
            </Typography.Text>
            <Segmented
              options={[
                {
                  label: 'Current',
                  value: 'current',
                },
                {
                  label: (
                    <Typography.Text
                      style={{
                        color:
                          selectedGeneration === 'next'
                            ? token.colorPrimary
                            : undefined,
                      }}
                    >
                      Next
                    </Typography.Text>
                  ),
                  value: 'next',
                  icon: (
                    // <ThunderboltFilled style={{ color: token.colorPrimary }} />
                    <ThunderboltTwoTone twoToneColor={token.colorWarning} />
                  ),
                },
              ]}
              value={selectedGeneration}
              // @ts-ignore
              onChange={(x) => setSelectedGeneration(x)}
            />
          </Flex>
        }
        type="warning"
        banner
        style={{ marginTop: -14, marginLeft: -14, marginRight: -14 }}
      />
      {selectedGeneration === 'next' ? (
        <Flex
          direction="column"
          align="stretch"
          style={{ padding: token.padding, gap: token.margin }}
        >
          {children}
          {/* <Card bordered title={t("summary.ResourceStatistics")}>
            <p>SessionList</p>
          </Card> */}

          {/* <Card bodyStyle={{ paddingTop: 0 }}> */}
          <Flex direction="column" align="stretch">
            <Flex style={{ flex: 1 }}>
              <Tabs
                // type="card"
                activeKey={selectedTab}
                onChange={(key) => setSelectedTab(key as TabKey)}
                tabBarStyle={{ marginBottom: 0 }}
                style={{
                  width: '100%',
                  paddingLeft: token.paddingMD,
                  paddingRight: token.paddingMD,
                  borderTopLeftRadius: token.borderRadius,
                  borderTopRightRadius: token.borderRadius,
                }}
                items={[
                  {
                    key: 'running',
                    label: t('session.Running'),
                  },
                  {
                    key: 'interactive',
                    label: t('session.Interactive'),
                  },
                  {
                    key: 'batch',
                    label: t('session.Batch'),
                  },
                  ...(baiClient.supports('inference-workload')
                    ? [
                        {
                          key: 'inference',
                          label: t('session.Inference'),
                        },
                      ]
                    : []),
                  {
                    key: 'finished',
                    label: t('session.Finished'),
                  },
                  {
                    key: 'others',
                    label: t('session.Others'),
                  },
                ]}
                tabBarExtraContent={{
                  right: (
                    <Flex direction="row" gap={'sm'}>
                      {/* <Tooltip title={t("session.exportCSV")}>
                        <Button icon={<DownloadOutlined />} type="text" />
                      </Tooltip> */}
                      {/* @ts-ignore */}
                      <backend-ai-session-launcher
                        location="session"
                        id="session-launcher"
                        active
                      />
                    </Flex>
                  ),
                }}
              />
              {/* <Button type="text" icon={<MoreOutlined />} /> */}
            </Flex>
            {/* <Button type="primary" icon={<PoweroffOutlined />}>
            시작
          </Button> */}

            {/* @ts-ignore */}
            {/* <backend-ai-session-launcher
          location="session"
          id="session-launcher"
          active
        /> */}
            <Suspense fallback={<div>loading..</div>}>
              <SessionList
                projectId={curProject.id}
                status={
                  TAB_STATUS_MAP[selectedTab] || TAB_STATUS_MAP['default']
                }
                filter={(session) => {
                  if (
                    ['interactive', 'batch', 'inference'].includes(selectedTab)
                  ) {
                    return session?.type?.toLowerCase() === selectedTab;
                  }
                  return true;
                }}
                extraFetchKey={selectedTab}
              />
            </Suspense>
          </Flex>
        </Flex>
      ) : (
        <>
          {/* @ts-ignore */}
          <backend-ai-session-view class="page" name="job" active />
        </>
      )}
    </>
  );
};

export default SessionListPage;
