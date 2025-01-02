import { useUpdatableState } from '../hooks';
import { useTanQuery } from '../hooks/reactQueryAlias';
import { ModelCardChatEndpointDetailQuery } from './__generated__/ModelCardChatEndpointDetailQuery.graphql';
import { ModelCardChatQuery } from './__generated__/ModelCardChatQuery.graphql';
import { Model } from './lablupTalkativotUI/ChatUIModal';
import LLMChatCard from './lablupTalkativotUI/LLMChatCard';
import { ReloadOutlined } from '@ant-design/icons';
import { Alert, Button, theme } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import dayjs from 'dayjs';
import _ from 'lodash';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyLoadQuery } from 'react-relay';

// TODO: fetch endpoint list, filter endpoint by name and send it ot LLMChatCard

interface ModelCardChatProps {
  modelName?: string;
  basePath?: string;
}

const ModelCardChat: React.FC<ModelCardChatProps> = ({
  modelName,
  basePath = 'v1',
}) => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const [paginationState] = useState<{
    current: number;
    pageSize: number;
  }>({
    current: 1,
    pageSize: 100,
  });

  const { endpoint_list } = useLazyLoadQuery<ModelCardChatQuery>(
    graphql`
      query ModelCardChatQuery(
        $offset: Int!
        $limit: Int!
        $filter: String
        $projectID: UUID
      ) {
        endpoint_list(
          offset: $offset
          limit: $limit
          project: $projectID
          filter: $filter
        ) {
          items {
            name
            endpoint_id
            url
            model
            status
          }
        }
      }
    `,
    {
      limit: 100,
      offset: 0,
      filter: `name ilike "%${modelName}%"`,
    },
    {
      fetchPolicy: 'network-only',
      fetchKey,
    },
  );

  const healthyEndpoint = _.filter(endpoint_list?.items, (item) => {
    return item?.status == 'HEALTHY';
  });

  const { endpoint_token_list } =
    useLazyLoadQuery<ModelCardChatEndpointDetailQuery>(
      graphql`
        query ModelCardChatEndpointDetailQuery(
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
        endpointId: healthyEndpoint[0]?.endpoint_id || '',
      },
      {
        fetchPolicy: 'network-only',
        fetchKey,
      },
    );

  const newestValidToken = _.orderBy(
    endpoint_token_list?.items,
    ['valid_until'],
    ['desc'],
  )[0]?.token;

  const {
    data: modelsResult,
    // error,
    refetch,
  } = useTanQuery<{
    data: Array<Model>;
  }>({
    queryKey: ['models', healthyEndpoint[0]?.url],
    queryFn: () => {
      return fetch(
        new URL(basePath + '/models', healthyEndpoint[0]?.url || '').toString(),
        {
          headers: {
            Authorization: `BackendAI ${newestValidToken}`,
          },
        },
      )
        .then((res) => res.json())
        .catch((err) => {
          console.log(err);
        });
    },
  });

  return (
    <LLMChatCard
      endpointId={endpoint_list?.items[0]?.endpoint_id || ''}
      baseURL={new URL(basePath, healthyEndpoint[0]?.url || '').toString()}
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

export default ModelCardChat;
