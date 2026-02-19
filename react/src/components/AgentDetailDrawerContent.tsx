/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import AgentActionButtons from './AgentNodeItems/AgentActionButtons';
import AgentComputePlugins from './AgentNodeItems/AgentComputePlugins';
import AgentResources from './AgentNodeItems/AgentResources';
import AgentStatusTag from './AgentNodeItems/AgentStatusTag';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Descriptions, Grid, Tabs, theme, Typography } from 'antd';
import {
  BAIDoubleTag,
  BAIFlex,
  BAIIntervalView,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';
import { AgentDetailDrawerContentFragment$key } from 'src/__generated__/AgentDetailDrawerContentFragment.graphql';
import { useSuspendedBackendaiClient } from 'src/hooks';

interface AgentDetailDrawerContentProps {
  agentNodeFrgmt?: AgentDetailDrawerContentFragment$key | null;
}

type TabKey = 'resources';

const AgentDetailDrawerContent: React.FC<AgentDetailDrawerContentProps> = ({
  agentNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = Grid.useBreakpoint();
  const { token } = theme.useToken();
  const baiClient = useSuspendedBackendaiClient();

  const [activeTabKey, setActiveTabKey] = useState<TabKey>('resources');

  const agent = useFragment(
    graphql`
      fragment AgentDetailDrawerContentFragment on AgentNode {
        id
        row_id
        addr
        status
        status_changed
        schedulable
        first_contact
        region
        scaling_group
        ...AgentStatusTagFragment
        ...AgentComputePluginsFragment
        ...AgentResourcesFragment
        ...AgentActionButtonsFragment
      }
    `,
    agentNodeFrgmt,
  );

  const regionData = _.split(agent?.region || '', '/');

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex justify="between">
        <BAIFlex direction="column" align="stretch">
          <Typography.Title
            level={3}
            style={{
              margin: 0,
              color: ['TERMINATED'].includes(agent?.status || '')
                ? token.colorTextSecondary
                : undefined,
            }}
            copyable
          >
            {toLocalId(agent?.id || '')}
          </Typography.Title>
          <Typography.Text type="secondary" copyable>
            {agent?.addr}
          </Typography.Text>
        </BAIFlex>
        <AgentActionButtons agentNodeFrgmt={agent} size="large" />
      </BAIFlex>

      <Descriptions
        bordered
        column={md ? 2 : 1}
        labelStyle={{ wordBreak: 'keep-all' }}
      >
        <Descriptions.Item label={t('agent.ResourceGroup')} span={md ? 2 : 1}>
          {agent?.scaling_group}
        </Descriptions.Item>
        <Descriptions.Item label={t('agent.Region')}>
          <Typography.Text style={{ minWidth: 200 }}>
            {regionData.length > 1
              ? _.join([regionData?.[0], regionData?.[1]], ' / ')
              : regionData?.[0]}
          </Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={t('agent.Schedulable')}>
          {agent?.schedulable ? (
            <CheckOutlined style={{ color: token.colorSuccess }} />
          ) : (
            <CloseOutlined style={{ color: token.colorTextDisabled }} />
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('agent.Status')} span={md ? 2 : 1}>
          <AgentStatusTag agentNodeFrgmt={agent} />
        </Descriptions.Item>
        <Descriptions.Item label={t('agent.ComputePlugins')} span={md ? 2 : 1}>
          <BAIFlex gap="sm" wrap="wrap">
            <AgentComputePlugins agentNodeFrgmt={agent} />
          </BAIFlex>
        </Descriptions.Item>
        <Descriptions.Item label={t('agent.StartsAt')} span={md ? 2 : 1}>
          <BAIFlex gap="sm">
            <Typography.Text>
              {dayjs(agent?.first_contact).format('lll')}
            </Typography.Text>
            {agent?.status === 'ALIVE' && (
              <BAIIntervalView
                callback={() => {
                  return baiClient.utils.elapsedTime(
                    agent?.first_contact || '',
                    Date.now(),
                  );
                }}
                delay={1000}
                render={(intervalValue) => (
                  <BAIDoubleTag
                    values={[
                      { label: t('agent.ElapsedTime') },
                      { label: intervalValue },
                    ]}
                  />
                )}
              />
            )}
          </BAIFlex>
        </Descriptions.Item>
      </Descriptions>

      <Tabs
        activeKey={activeTabKey}
        onChange={(key) => setActiveTabKey(key as TabKey)}
        items={[
          {
            key: 'resources',
            label: t('agent.Resources'),
            children: <AgentResources agentNodeFrgmt={agent} />,
          },
        ]}
      />
    </BAIFlex>
  );
};

export default AgentDetailDrawerContent;
