/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantKeyRestorerQuery } from '../../__generated__/WebUIAssistantKeyRestorerQuery.graphql';
import { CATALOG_FETCH_LIMIT } from '../../helper/const-vars';
import { setCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import {
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { filterOutNullAndUndefined, toGlobalId } from 'backend.ai-ui';
import dayjs from 'dayjs';
import { maxBy } from 'lodash-es';
import { Suspense, useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

/**
 * Puts a private deployment's latest valid access token back in memory after
 * a reload. A custom endpoint's key is not kept anywhere, so it is entered
 * again. Renders nothing.
 */
const WebUIAssistantKeyRestorer: React.FC<{
  connection: WebUIAssistantConnection;
}> = ({ connection }) => {
  'use memo';

  const { deploymentId } = connection;
  return deploymentId ? (
    <Suspense fallback={null}>
      <DeploymentTokenRestorer deploymentId={deploymentId} />
    </Suspense>
  ) : null;
};

const DeploymentTokenRestorer: React.FC<{ deploymentId: string }> = ({
  deploymentId,
}) => {
  'use memo';

  const { deployment } = useLazyLoadQuery<WebUIAssistantKeyRestorerQuery>(
    graphql`
      query WebUIAssistantKeyRestorerQuery($id: ID!, $limit: Int!) {
        deployment(id: $id) @catch {
          # Expiry is filtered here: DateTimeFilter cannot match a NULL expiresAt.
          accessTokens(
            orderBy: [{ field: CREATED_AT, direction: DESC }]
            limit: $limit
          ) {
            edges {
              node {
                token
                createdAt
                expiresAt
              }
            }
          }
        }
      }
    `,
    {
      id: toGlobalId('ModelDeployment', deploymentId),
      limit: CATALOG_FETCH_LIMIT,
    },
    { fetchPolicy: 'network-only' },
  );

  const now = dayjs();
  const tokens = deployment.ok
    ? filterOutNullAndUndefined(
        deployment.value?.accessTokens?.edges?.map((edge) => edge?.node),
      ).filter(
        (item) =>
          !!item.token &&
          (!item.expiresAt || dayjs(item.expiresAt).isAfter(now)),
      )
    : [];
  const latestToken = maxBy(tokens, 'createdAt')?.token ?? undefined;

  useEffect(() => {
    setCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID, latestToken);
  }, [latestToken]);

  return null;
};

export default WebUIAssistantKeyRestorer;
