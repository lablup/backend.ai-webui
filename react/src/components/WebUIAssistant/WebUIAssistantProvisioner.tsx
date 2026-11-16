/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantProvisionerQuery } from '../../__generated__/WebUIAssistantProvisionerQuery.graphql';
import { WebUIAssistantProvisionerTokenMutation } from '../../__generated__/WebUIAssistantProvisionerTokenMutation.graphql';
import type { AgentEndpointBinding } from '../../hooks/useAIAgent';
import { WEBUI_ASSISTANT_TOKEN_LIFETIME_DAYS } from './webUIAssistantPrompt';
import {
  toGlobalId,
  useBAILogger,
  useInterval,
  useMutationWithPromise,
  useUpdatableState,
} from 'backend.ai-ui';
import dayjs from 'dayjs';
import { useEffect, useEffectEvent, useRef } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

const POLL_INTERVAL_MS = 5000;

interface WebUIAssistantProvisionerProps {
  deploymentId: string;
  onReady: (binding: AgentEndpointBinding) => void;
  /** The deployment was deleted or is no longer visible to the user. */
  onMissing: () => void;
}

/**
 * Waits for the assistant's deployment to get an endpoint URL, then issues an
 * access token. Renders nothing; the panel shows the progress.
 */
const WebUIAssistantProvisioner: React.FC<WebUIAssistantProvisionerProps> = ({
  deploymentId,
  onReady,
  onMissing,
}) => {
  'use memo';

  const { logger } = useBAILogger();
  const [fetchKey, updateFetchKey] = useUpdatableState('first');
  const isIssuingRef = useRef(false);

  const { deployment } = useLazyLoadQuery<WebUIAssistantProvisionerQuery>(
    graphql`
      query WebUIAssistantProvisionerQuery($id: ID!) {
        deployment(id: $id) @catch {
          id
          networkAccess {
            endpointUrl
          }
        }
      }
    `,
    { id: toGlobalId('ModelDeployment', deploymentId) },
    { fetchKey, fetchPolicy: 'store-and-network' },
  );
  const isMissing = deployment.ok && !deployment.value;
  const endpointURL = deployment.ok
    ? deployment.value?.networkAccess.endpointUrl
    : null;

  useInterval(() => updateFetchKey(), endpointURL ? null : POLL_INTERVAL_MS);

  const createToken =
    useMutationWithPromise<WebUIAssistantProvisionerTokenMutation>(graphql`
      mutation WebUIAssistantProvisionerTokenMutation(
        $input: CreateAccessTokenInput!
      ) {
        createAccessToken(input: $input) {
          accessToken {
            token
          }
        }
      }
    `);

  const issueToken = useEffectEvent((url: string) => {
    if (isIssuingRef.current) return;
    isIssuingRef.current = true;
    createToken({
      input: {
        modelDeploymentId: deploymentId,
        expiresAt: dayjs()
          .add(WEBUI_ASSISTANT_TOKEN_LIFETIME_DAYS, 'day')
          .toISOString(),
      },
    })
      .then((response) => {
        const token = response.createAccessToken?.accessToken.token;
        if (token) {
          onReady({
            endpoint_id: deploymentId,
            endpoint_url: url,
            endpoint_token: token,
          });
        }
      })
      .catch((error) => {
        logger.error('WebUI Assistant: failed to issue an access token', error);
      })
      .finally(() => {
        isIssuingRef.current = false;
      });
  });

  const reportMissing = useEffectEvent(() => onMissing());

  useEffect(() => {
    if (endpointURL) issueToken(endpointURL);
  }, [endpointURL]);

  useEffect(() => {
    if (isMissing) reportMissing();
  }, [isMissing]);

  return null;
};

export default WebUIAssistantProvisioner;
