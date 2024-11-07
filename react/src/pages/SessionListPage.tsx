import AvailableResourcesCard from '../components/AvailableResourcesCard';
import Flex from '../components/Flex';
import SessionList from '../components/SessionList';
import { useSuspendedBackendaiClient, useWebUINavigate } from '../hooks';
import { useCurrentKeyPairResourcePolicyLazyLoadQuery } from '../hooks/hooksUsingRelay';
import { useCurrentProjectValue } from '../hooks/useCurrentProject';
import { PoweroffOutlined, ThunderboltTwoTone } from '@ant-design/icons';
import { Alert, Button, Card, Segmented, Typography, theme } from 'antd';
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

  const [{ keypair, keypairResourcePolicy }] =
    useCurrentKeyPairResourcePolicyLazyLoadQuery();
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
      <Flex
        direction="column"
        align="stretch"
        style={{
          display: selectedGeneration === 'next' ? 'flex' : 'none',
        }}
        gap={'sm'}
      >
        <AvailableResourcesCard />
        <Card
          bodyStyle={{
            padding: 0,
          }}
          tabList={[
            {
              key: 'running',
              label: (
                <>
                  {t('session.Running') +
                    ` (${keypair.concurrency_used}/${keypairResourcePolicy.max_concurrent_sessions === 1000000 ? '∞' : keypairResourcePolicy.max_concurrent_sessions})`}
                  {/* <Tooltip><InfoCircleOutlined/></Tooltip> */}
                </>
              ),
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
          <Flex direction="column" align="stretch">
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
      </Flex>
      <Flex
        direction="column"
        align="stretch"
        style={{
          display: selectedGeneration === 'next' ? 'none' : 'flex',
        }}
      >
        {/* @ts-ignore */}
        <backend-ai-session-view
          class="page"
          name="job"
          active={selectedGeneration !== 'next' ? true : null}
        />
      </Flex>
    </Flex>
  );
};

export default SessionListPage;
