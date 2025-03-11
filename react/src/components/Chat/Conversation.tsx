import { ChatContext, ConversationType } from '../../pages/ChatProvider';
import BAICard from '../BAICard';
import Flex from '../Flex';
import ChatCard from './ChatCard';
import { ConversationQuery } from './__generated__/ConversationQuery.graphql';
import { PlusOutlined } from '@ant-design/icons';
import { useDynamicList } from 'ahooks';
import { Button, Card, Skeleton, Switch, Typography } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import { t } from 'i18next';
import { map } from 'lodash';
import { Suspense, useContext, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';

export type ConversationProps = {
  // conversation: ConversationType;
  activeTabKey: string;
};

function useEndpoint(
  endpointId: string | null | undefined,
  isEmptyEndpointId: boolean,
) {
  const { endpoint, endpoint_list } = useLazyLoadQuery<ConversationQuery>(
    graphql`
      query ConversationQuery(
        $endpointId: UUID!
        $isEmptyEndpointId: Boolean!
      ) {
        endpoint(endpoint_id: $endpointId)
          @skipOnClient(if: $isEmptyEndpointId)
          @catch {
          endpoint_id
          ...ChatCard_endpoint
        }
        endpoint_list(limit: 1, offset: 0) {
          items {
            endpoint_id
            ...ChatCard_endpoint
          }
        }
      }
    `,
    {
      endpointId: endpointId || '',
      isEmptyEndpointId: isEmptyEndpointId,
    },
  );

  return {
    endpoint:
      (endpoint.ok ? endpoint.value : endpoint_list?.items?.[0]) ?? undefined,
  };
}

export const Conversation: React.FC<ConversationProps> = ({
  activeTabKey,
  ...props
}) => {
  const chatContext = useContext(ChatContext);

  if (!chatContext) {
    throw new Error('ChatInput must be used within a ChatProvider');
  }

  const { option, isSynchronous, setSynchronous } = chatContext;

  const { endpoint } = useEndpoint(option?.endpointId, !option?.endpointId);

  // @FIXME double check
  const defaultModelId =
    activeTabKey === '0' && endpoint ? option?.modelId : undefined;
  const defaultEndpoint =
    activeTabKey === '0' && endpoint ? endpoint : undefined;

  console.log('defaultEndpoint', activeTabKey, endpoint, defaultEndpoint);

  // @FIXME mode to chat context to manage chats in conversioans
  const { list, remove, getKey, push } = useDynamicList(['0']);

  return (
    <BAICard
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
          {
            // @FIXME mode to chat context to manage chats in conversioans
            map(list, (__, index) => (
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
                key={index}
              >
                <ChatCard
                  defaultModelId={defaultModelId ?? undefined}
                  defaultEndpoint={defaultEndpoint}
                  defaultAgentId={undefined}
                  style={{ flex: 1, overflow: 'hidden' }} // Add overflow handling here
                  onRequestClose={() => {}}
                  closable={list.length > 1}
                  key={index}
                />
              </Suspense>
            ))
          }
        </Flex>
      </Flex>
    </BAICard>
  );
};
