/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantKeyRestorerQuery } from '../../__generated__/WebUIAssistantKeyRestorerQuery.graphql';
import { CATALOG_FETCH_LIMIT } from '../../helper/const-vars';
import { setCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import { loadStoredApiKey } from './storedApiKey';
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
 * Puts a saved connection's key back in memory after a reload: a custom
 * endpoint's from this browser's storage, a private deployment's as its
 * latest valid access token. Renders nothing; without a key the button asks
 * to connect again.
 */
const WebUIAssistantKeyRestorer: React.FC<{
  connection: WebUIAssistantConnection;
}> = ({ connection }) => {
  'use memo';

  const { baseURL, deploymentId } = connection;
  useEffect(() => {
    if (deploymentId) return;
    setCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID, loadStoredApiKey(baseURL));
  }, [baseURL, deploymentId]);

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
