import BAICard from '../components/BAICard';
import {
  ChatProviderType,
  ConversationType,
} from '../components/Chat/ChatModel';
import { Conversation } from '../components/Chat/Conversation';
import { useSuspendedBackendaiClient } from '../hooks';
import { ChatPageQuery } from './__generated__/ChatPageQuery.graphql';
import { Alert, Button, Drawer, List, Switch } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import { t } from 'i18next';
import { HistoryIcon, PlusIcon, TrashIcon } from 'lucide-react';
import React, { useId, useState } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { StringParam, useQueryParams } from 'use-query-params';

const ChatPageStyle = {
  body: {
    overflow: 'hidden',
  },
};

type ChatPageProps = {};

function useDefaultEndpointId() {
  const baiClient = useSuspendedBackendaiClient();
  const { endpoint_list } = useLazyLoadQuery<ChatPageQuery>(
    graphql`
      query ChatPageQuery($filter: String) {
        endpoint_list(limit: 1, offset: 0, filter: $filter) {
          items {
            endpoint_id
          }
        }
      }
    `,
    {
      filter: baiClient.supports('endpoint-lifecycle-stage-filter')
        ? 'lifecycle_stage == "created"'
        : undefined,
    },
  );

  return endpoint_list?.items[0]?.endpoint_id || undefined;
}

const ChatPage: React.FC<ChatPageProps> = () => {
  const [{ endpointId, modelId, agentId }] = useQueryParams({
    endpointId: StringParam,
    agentId: StringParam,
    modelId: StringParam,
  });

  const defaultEndpointId = useDefaultEndpointId();

  const conversation: ConversationType = {
    id: useId(),
    label: t('webui.menu.Chat'),
    chats: [],
  };

  const provider: ChatProviderType = {
    basePath: 'v1',
    agentId: agentId ?? undefined,
    endpointId: endpointId ?? defaultEndpointId ?? undefined,
    modelId: modelId ?? undefined,
  };

  const [openHistory, setOpenHistory] = useState(false);

  return (
    <BAICard
      title={t('webui.menu.Chat')}
      styles={ChatPageStyle}
      extra={
        <>
          <Button type="text" icon={<PlusIcon />} onClick={() => {}} />
          <Button
            type="text"
            icon={<HistoryIcon />}
            onClick={() => {
              setOpenHistory(true);
            }}
          />
        </>
      }
      style={{
        overflow: 'hidden',
      }}
      // styles={{
      //   body:
      // }}
    >
      <Conversation conversation={conversation} provider={provider} />
      <Drawer
        getContainer={false}
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        mask={false}
        title="History"
        extra={<Switch />}
      >
        <Alert
          type="warning"
          showIcon
          message="History는 브라우저 LocalStorage에 저장되며 로그아웃시 삭제됩니다."
        />
        <List
          dataSource={[
            { title: 'Chat 1', description: 'Description 1' },
            { title: 'Chat 2', description: 'Description 2' },
          ]}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="delete" type="text" icon={<TrashIcon />} />,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={dayjs().format('YYYY-MM-DD HH:mm:ss')}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </BAICard>
  );
};

export default ChatPage;
