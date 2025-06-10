import EndpointChat from './EndpointChat';
import { ModelCardChatQuery } from './__generated__/ModelCardChatQuery.graphql';
import { Alert, Card, theme } from 'antd/lib';
import _ from 'lodash';
import React from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

// import { useTranslation } from 'react-i18next';

interface ModelCardChatProps {
  modelName?: string;
  basePath?: string;
  style?: React.CSSProperties;
}

const ModelCardChat: React.FC<ModelCardChatProps> = ({
  modelName,
  basePath = 'v1',
  style,
}) => {
  // const { t } = useTranslation();
  const { token } = theme.useToken();

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
    },
  );

  const healthyEndpoint = _.filter(endpoint_list?.items, (item) => {
    return (item?.status ?? '') === 'HEALTHY';
  });

  // FIXME: temporally render chat UI only if at least one endpoint is healthy.
  return (
    <Card
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      styles={{
        body: {
          backgroundColor: token.colorFillQuaternary,
          borderRadius: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
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
      actions={
        healthyEndpoint.length <= 0
          ? [
              <Alert
                key="no-chat-ui"
                message="Chat UI is not provided yet. Why don't you create a new one?"
                type="warning"
                showIcon
              />,
            ]
          : []
      }
    >
      {healthyEndpoint.length > 0 ? (
        <EndpointChat
          endpointId={healthyEndpoint[0]?.endpoint_id as string}
          endpointUrl={healthyEndpoint[0]?.url as string}
          endpointName={healthyEndpoint[0]?.name as string}
          basePath={basePath}
        />
      ) : (
        <></>
      )}
    </Card>
  );
};

export default ModelCardChat;
