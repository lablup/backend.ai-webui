import BAICard from '../components/BAICard';
import EndpointLLMChatCard from '../components/Chat/EndpointLLMChatCard';
import Flex from '../components/Flex';
import { ChatPageQuery } from './__generated__/ChatPageQuery.graphql';
import { PlusOutlined } from '@ant-design/icons';
import { useDynamicList } from 'ahooks';
import { Button, Card, Skeleton, Switch, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParam } from 'use-query-params';

interface ChatPageProps {}

const ChatPage: React.FC<ChatPageProps> = ({ ...props }) => {
  const { t } = useTranslation();
  // Set the initial list to have two items
  const { list, remove, getKey, push } = useDynamicList(['0']);

  const [isSynchronous, setSynchronous] = useState(false);

  const [endpointId] = useQueryParam('endpointId', StringParam);
  const [modelId] = useQueryParam('modelId', StringParam);
  const [agentId] = useQueryParam('agentId', StringParam);
  const isEmptyEndpointId = !endpointId;

  const { endpoint, endpoint_list } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($endpointId: UUID!, $isEmptyEndpointId: Boolean!) {
        endpoint(endpoint_id: $endpointId)
          @skipOnClient(if: $isEmptyEndpointId)
          @catch {
          ...EndpointLLMChatCard_endpoint
        }
        endpoint_list(limit: 1, offset: 0) {
          items {
            ...EndpointLLMChatCard_endpoint
          }
        }
      }
    `,
    {
      endpointId: endpointId || '',
      isEmptyEndpointId: isEmptyEndpointId,
    },
  );
  return (
    <BAICard
      title={t('webui.menu.Chat')}
      styles={{
        body: {
          overflow: 'hidden',
        },
      }}
      extra={
        <Flex direction="row" gap={'xs'} wrap="wrap" style={{ flexShrink: 1 }}>
          <Flex gap={'xs'}>
            <Typography.Text type="secondary">
              {t('chatui.SyncInput')}
            </Typography.Text>
            <Switch
              value={isSynchronous}
              onClick={(v) => {
                setSynchronous(v);
              }}
            />
            <Button
              onClick={() => {
                push(new Date().toString());
              }}
              icon={<PlusOutlined />}
            />
          </Flex>
        </Flex>
      }
    >
      <Flex direction="column" align="stretch" gap={'xs'}>
        <Flex
          gap={'xs'}
          direction="row"
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 240px)',
          }}
          align="stretch"
        >
          {_.map(list, (__, index) => (
            <Suspense
              fallback={
                <Card
                  bordered
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Skeleton active />
                </Card>
              }
              key={getKey(index)}
            >
              <EndpointLLMChatCard
                defaultModelId={
                  index === 0 && endpoint.ok && modelId ? modelId : undefined
                }
                defaultEndpoint={
                  index === 0 && endpoint.ok
                    ? endpoint.value || undefined
                    : endpoint_list?.items?.[0] || undefined
                }
                defaultAgentId={agentId || undefined}
                key={getKey(index)}
                style={{ flex: 1 }}
                onRequestClose={() => {
                  remove(index);
                }}
                closable={list.length > 1}
                isSynchronous={isSynchronous}
              />
            </Suspense>
          ))}
        </Flex>
      </Flex>
    </BAICard>
  );
};

export default ChatPage;
