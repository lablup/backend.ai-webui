import { useTanQuery } from '../hooks/reactQueryAlias';
import { Model } from './Chat/ChatUIModal';
import LLMChatCard from './Chat/LLMChatCard';
import { ChatContentEndpointDetailQuery } from './__generated__/ChatContentEndpointDetailQuery.graphql';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay/hooks';

interface ChatContentProps {
  endpointId: string;
  endpointUrl: string;
  basePath: string;
}

const ChatContent: React.FC<ChatContentProps> = ({
  endpointId,
  endpointUrl,
  basePath,
}) => {
  const { t } = useTranslation();

  const { endpoint_token_list } =
    useLazyLoadQuery<ChatContentEndpointDetailQuery>(
      graphql`
        query ChatContentEndpointDetailQuery(
          $endpointId: UUID!
          $tokenListOffset: Int!
          $tokenListLimit: Int!
        ) {
          endpoint_token_list(
            limit: $tokenListLimit
            offset: $tokenListOffset
            endpoint_id: $endpointId
          ) {
            total_count
            items {
              id
              token
              endpoint_id
              created_at
              valid_until
            }
          }
        }
      `,
      {
        tokenListLimit: 100,
        tokenListOffset: 0,
        endpointId: endpointId as string,
      },
      {
        fetchPolicy: 'network-only',
      },
    );

  const newestValidToken =
    _.orderBy(endpoint_token_list?.items, ['valid_until'], ['desc'])[0]
      ?.token ?? '';

  const {
    data: modelsResult,
    // error,
    refetch,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', endpointUrl],
    queryFn: () => {
      return fetch(new URL(basePath + '/models', endpointUrl).toString(), {
        headers: {
          Authorization: `BackendAI ${newestValidToken}`,
        },
      })
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
        });
    },
  });

  return (
    <LLMChatCard
      endpointId={endpointId || ''}
      baseURL={new URL(basePath, endpointUrl).toString()}
      models={_.map(modelsResult?.data, (m) => ({
        id: m.id,
        name: m.id,
      }))}
      apiKey={newestValidToken}
      fetchOnClient
      style={{ flex: 1 }}
      allowCustomModel={false}
      alert={
        _.isEmpty(modelsResult?.data) && (
          <Alert
            type="warning"
            showIcon
            message={t('chatui.CannotFindModel')}
            action={
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  refetch();
                }}
              >
                {t('button.Refresh')}
              </Button>
            }
          />
        )
      }
      modelId={modelsResult?.data?.[0].id ?? 'custom'}
      modelToken={newestValidToken}
    />
  );
};

export default ChatContent;
