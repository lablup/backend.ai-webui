import { useUpdatableState } from '../hooks';
import ChatContent from './ChatContent';
import { ModelCardChatQuery } from './__generated__/ModelCardChatQuery.graphql';
import { Alert, Card, theme } from 'antd/lib';
import graphql from 'babel-plugin-relay/macro';
import _ from 'lodash';
import React from 'react';
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

  // FIXME: temporally render chat UI only if at least one endpoint is healthy.
  return healthyEndpoint.length > 0 ? (
    <ChatContent
      endpointId={healthyEndpoint[0]?.endpoint_id as string}
      endpointUrl={healthyEndpoint[0]?.url as string}
      endpointName={healthyEndpoint[0]?.name as string}
      basePath={basePath}
    />
  ) : (
    <Card
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '50vh',
      }}
      styles={{
        body: {
          backgroundColor: token.colorFillQuaternary,
          borderRadius: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          height: '50%',
          position: 'relative',
        },
        actions: {
          paddingLeft: token.paddingContentHorizontal,
          paddingRight: token.paddingContentHorizontal,
        },
        header: {
          zIndex: 1,
        },
      }}
      actions={[
        <Alert
          message="Chat UI is not provided yet. Why don't you create a new one?"
          type="warning"
          showIcon
        />,
      ]}
    />
  );
};

export default ModelCardChat;