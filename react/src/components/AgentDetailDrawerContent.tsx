/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { AgentDetailDrawerContentFragment$key } from '../__generated__/AgentDetailDrawerContentFragment.graphql';
import type {
  AgentSessionsQuery as AgentSessionsQueryType,
  SessionV2OrderBy,
  SessionV2Status,
} from '../__generated__/AgentSessionsQuery.graphql';
import { getSessionV2StatusBuckets } from '../helper/sessionStatusBuckets';
import { useSuspendedBackendaiClient } from '../hooks';
import AgentActionButtons from './AgentNodeItems/AgentActionButtons';
import AgentComputePlugins from './AgentNodeItems/AgentComputePlugins';
import AgentResources from './AgentNodeItems/AgentResources';
import AgentSessions, {
  AgentSessionsQuery,
} from './AgentNodeItems/AgentSessions';
import AgentStatusTag from './AgentNodeItems/AgentStatusTag';
import BAIErrorBoundary from './BAIErrorBoundary';
import { MetadataListItem } from '@astryxdesign/core/MetadataList';
import { Tab, TabList } from '@astryxdesign/core/TabList';
import { Text } from '@astryxdesign/core/Text';
import { useTheme } from '@astryxdesign/core/theme';
import {
  BAICard,
  BAIDoubleTag,
  BAIFlex,
  BAIIntervalView,
  BAIMetadataList,
  BAISkeleton,
  BAIText,
  toLocalId,
  useBAIBreakpoint,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import * as _ from 'lodash-es';
import { Check, X } from 'lucide-react';
import { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useFragment, useQueryLoader } from 'react-relay';

interface AgentDetailDrawerContentProps {
  agentNodeFrgmt?: AgentDetailDrawerContentFragment$key | null;
}

type TabKey = 'resources' | 'sessions';

const AgentDetailDrawerContent: React.FC<AgentDetailDrawerContentProps> = ({
  agentNodeFrgmt,
}) => {
  'use memo';
  const { t } = useTranslation();
  const { md } = useBAIBreakpoint();
  const { token } = useTheme();
  const baiClient = useSuspendedBackendaiClient();
  const statusBuckets = getSessionV2StatusBuckets(
    baiClient.supports('session-preemption-statuses'),
  );

  const [activeTabKey, setActiveTabKey] = useState<TabKey>('resources');

  const [sessionsQueryRef, loadSessionsQuery] =
    useQueryLoader<AgentSessionsQueryType>(AgentSessionsQuery);

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
          {/* Not an <h3>: Astryx has no copyable Heading, so the legacy
              Title renders as large text with the shared copy control. */}
          <BAIText
            strong
            type={isTerminated ? 'secondary' : undefined}
            copyable
            style={{
              fontSize: 'var(--text-large-size)',
              lineHeight: 'var(--text-large-leading)',
            }}
          >
            {toLocalId(agent?.id || '')}
          </BAIText>
          <BAIText type="secondary" copyable>
            {agent?.addr || ''}
          </BAIText>
        </BAIFlex>
        <AgentActionButtons agentNodeFrgmt={agent} size="lg" />
      </BAIFlex>

      {/* Dropped from the antd original: per-item `span`. Column count is
          `md`-driven (R3). */}
      <BAICard>
        <BAIMetadataList columns={md ? 2 : 1}>
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
              <Check style={{ color: token('--color-success') }} size="1em" />
            ) : (
              <X style={{ color: token('--color-text-disabled') }} size="1em" />
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
        </BAIMetadataList>
      </BAICard>

      {/* antd Tabs → TabList + Tab (MAPPING §4): navigation only, panel is
          self-rendered below. */}
      <TabList
        hasDivider
        value={activeTabKey}
        onChange={(key) => {
          setActiveTabKey(key as TabKey);
          // Lazy-load: the sessions query is not fetched when the drawer
          // opens, only on first activation of the sessions tab.
          if (key === 'sessions' && !sessionsQueryRef && agent?.row_id) {
            loadSessionsQuery(
              {
                agentFilter: { id: { equals: agent.row_id } },
                sessionFilter: {
                  status: {
                    in: statusBuckets.running as readonly SessionV2Status[],
                  },
                },
                orderBy: [
                  {
                    field: 'CREATED_AT',
                    direction: 'DESC',
                  } as Required<SessionV2OrderBy>,
                ],
                limit: 10,
                offset: 0,
              },
              { fetchPolicy: 'store-and-network' },
            );
          }
        }}
      >
        <Tab value="resources" label={t('agent.Resources')} />
        <Tab value="sessions" label={t('webui.menu.Sessions')} />
      </TabList>
      {activeTabKey === 'resources' && (
        <BAIErrorBoundary>
          <AgentResources agentNodeFrgmt={agent} />
        </BAIErrorBoundary>
      )}
      {activeTabKey === 'sessions' && (
        <BAIErrorBoundary>
          <Suspense fallback={<BAISkeleton />}>
            {sessionsQueryRef && (
              <AgentSessions
                queryRef={sessionsQueryRef}
                onReload={loadSessionsQuery}
              />
            )}
          </Suspense>
        </BAIErrorBoundary>
      )}
    </BAIFlex>
  );
};

export default AgentDetailDrawerContent;
