/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentDetailDrawerContentFragment$key } from '../__generated__/AgentDetailDrawerContentFragment.graphql';
import { useSuspendedBackendaiClient } from '../hooks';
import { theme, useBAIBreakpoint } from '../theme-shim';
import AgentActionButtons from './AgentNodeItems/AgentActionButtons';
import AgentComputePlugins from './AgentNodeItems/AgentComputePlugins';
import AgentResources from './AgentNodeItems/AgentResources';
import AgentStatusTag from './AgentNodeItems/AgentStatusTag';
import BAIErrorBoundary from './BAIErrorBoundary';
import BAICopyableText from './astryx-bui/BAICopyableText';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import {
  BAIDoubleTag,
  BAIFlex,
  BAIIntervalView,
  toLocalId,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment } from 'react-relay';

interface AgentDetailDrawerContentProps {
  agentNodeFrgmt?: AgentDetailDrawerContentFragment$key | null;
}

type TabKey = 'resources';

const AgentDetailDrawerContent: React.FC<AgentDetailDrawerContentProps> = ({
  agentNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
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

  const isTerminated = agent?.status === 'TERMINATED';

  return (
    <BAIFlex direction="column" gap="lg" align="stretch">
      <BAIFlex justify="between">
        <BAIFlex direction="column" align="stretch">
          {/* antd Typography.Title level={3} copyable → BAICopyableText
              (Text-based, MAPPING §3.4) sized to approximate the level-3
              heading step (17px). PILOT-DECISION: loses the semantic <h3>
              element (BAICopyableText renders a <span>) — Astryx has no
              copyable Heading; the simplicity policy accepts the visual-only
              approximation over rebuilding a heading-flavoured copy control. */}
          <BAICopyableText
            copyLabel={t('sourceCodeViewer.Copy')}
            type="large"
            weight="semibold"
            color={isTerminated ? 'secondary' : 'primary'}
          >
            {toLocalId(agent?.id || '')}
          </BAICopyableText>
          <BAICopyableText
            copyLabel={t('sourceCodeViewer.Copy')}
            color="secondary"
          >
            {agent?.addr || ''}
          </BAICopyableText>
        </BAIFlex>
        <AgentActionButtons agentNodeFrgmt={agent} size="lg" />
      </BAIFlex>

      {/* antd Descriptions bordered → MetadataList (MAPPING §4). `bordered` /
          per-item `span` have no destination and are dropped (PILOT-DECISION,
          established ticket 15/18 project-wide); the `md`-driven column count
          survives via useBAIBreakpoint (R3). */}
      <MetadataList
        columns={md ? 2 : 1}
        label={{ position: 'start', width: md ? 160 : 120 }}
      >
        <MetadataListItem label={t('agent.ResourceGroup')}>
          {agent?.scaling_group}
        </MetadataListItem>
        <MetadataListItem label={t('agent.Region')}>
          <Text>
            {regionData.length > 1
              ? _.join([regionData?.[0], regionData?.[1]], ' / ')
              : regionData?.[0]}
          </Text>
        </MetadataListItem>
        <MetadataListItem label={t('agent.Schedulable')}>
          {agent?.schedulable ? (
            <Check style={{ color: token.colorSuccess }} size="1em" />
          ) : (
            <X style={{ color: token.colorTextDisabled }} size="1em" />
          )}
        </MetadataListItem>
        <MetadataListItem label={t('agent.Status')}>
          <AgentStatusTag agentNodeFrgmt={agent} />
        </MetadataListItem>
        <MetadataListItem label={t('agent.ComputePlugins')}>
          <BAIFlex gap="sm" wrap="wrap">
            <AgentComputePlugins agentNodeFrgmt={agent} />
          </BAIFlex>
        </MetadataListItem>
        <MetadataListItem label={t('agent.StartsAt')}>
          <BAIFlex gap="sm">
            <Text>{dayjs(agent?.first_contact).format('lll')}</Text>
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
        </MetadataListItem>
      </MetadataList>

      {/* antd Tabs → TabList + Tab (MAPPING §4): navigation only, panel is
          self-rendered below. */}
      <TabList
        value={activeTabKey}
        onChange={(key) => setActiveTabKey(key as TabKey)}
      >
        <Tab value="resources" label={t('agent.Resources')} />
      </TabList>
      {activeTabKey === 'resources' && (
        <BAIErrorBoundary>
          <AgentResources agentNodeFrgmt={agent} />
        </BAIErrorBoundary>
      )}
    </BAIFlex>
  );
};

export default AgentDetailDrawerContent;
