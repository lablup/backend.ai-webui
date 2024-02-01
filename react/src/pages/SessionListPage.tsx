import AvailableResourcesCard from '../components/AvailableResourcesCard';
import Flex from '../components/Flex';
import ResourceAvailableGageBar from '../components/ResourceAvailableGageBar';
import ResourceGroupSelect from '../components/ResourceGroupSelect';
import SessionList from '../components/SessionList';
import {
  useCurrentProjectValue,
  useSuspendedBackendaiClient,
  useWebUINavigate,
} from '../hooks';
import {
  PoweroffOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ThunderboltTwoTone,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Progress,
  Segmented,
  Tabs,
  Tooltip,
  Typography,
  theme,
} from 'antd';
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
  const webuiNavigate = useWebUINavigate();

  const [selectedTab, setSelectedTab] = useState<TabKey>('running');
  const [selectedGeneration, setSelectedGeneration] = useState<
    'current' | 'next'
  >('next');

  // console.log(compute_session_list?.items[0].);
  return (
    <Flex direction="column" align="stretch" gap={'sm'}>
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
        type="info"
        showIcon
      />
      {selectedGeneration === 'next' ? (
        <>
          <AvailableResourcesCard />
          <Card
            bodyStyle={{
              padding: 0,
            }}
            tabList={[
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
            activeTabKey={selectedTab}
            onTabChange={(key) => setSelectedTab(key as TabKey)}
            tabBarExtraContent={
              <Flex direction="row" gap={'sm'}>
                {/* <Tooltip title={t("session.exportCSV")}>
                    <Button icon={<DownloadOutlined />} type="text" />
                  </Tooltip> */}
                {/* @ts-ignore */}
                <Button
                  type="primary"
                  icon={<PoweroffOutlined />}
                  onClick={() => {
                    webuiNavigate('/session/start');
                  }}
                >
                  START
                </Button>
              </Flex>
            }
          >
            {children}
            {/* <Card bordered title={t("summary.ResourceStatistics")}>
            <p>SessionList</p>
          </Card> */}

            {/* <Card bodyStyle={{ paddingTop: 0 }}> */}
            <Flex direction="column" align="stretch">
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
                <Flex
                  // style={{
                  //   marginLeft: -1,
                  //   marginRight: -1,
                  // }}
                  direction="column"
                  align="stretch"
                >
                  <SessionList
                    projectId={curProject.id}
                    // bordered
                    style={{
                      marginTop: 1,
                    }}
                    status={
                      TAB_STATUS_MAP[selectedTab] || TAB_STATUS_MAP['default']
                    }
                    filter={(session) => {
                      if (
                        ['interactive', 'batch', 'inference'].includes(
                          selectedTab,
                        )
                      ) {
                        return session?.type?.toLowerCase() === selectedTab;
                      }
                      return true;
                    }}
                    extraFetchKey={selectedTab}
                  />
                </Flex>
              </Suspense>
            </Flex>
          </Card>
        </>
      ) : (
        <>
          {/* @ts-ignore */}
          <backend-ai-session-view class="page" name="job" active />
        </>
      )}
    </Flex>
  );
};

export default SessionListPage;
