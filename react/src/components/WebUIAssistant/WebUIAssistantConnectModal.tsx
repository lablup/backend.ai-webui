/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantConnectModalDeploymentQuery } from '../../__generated__/WebUIAssistantConnectModalDeploymentQuery.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import {
  useMyAppConfig,
  useRefetchMyAppConfig,
  useUpdateMyUserAppConfig,
} from '../../hooks/useAppConfig';
import CustomEndpointForm from '../Chat/CustomEndpointForm';
import DeploymentSelect from '../Chat/DeploymentSelect';
import DeploymentTokenSelect from '../Chat/DeploymentTokenSelect';
import { fetchOpenAIModels } from '../Chat/openAIModels';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { Banner } from '@lablup/ui-common/Banner';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIModal,
  BAISkeleton,
  toGlobalId,
  useErrorMessageResolver,
  type BAIModalProps,
} from 'backend.ai-ui';
import { Suspense, useEffect, useEffectEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { graphql, useLazyLoadQuery } from 'react-relay';

export interface WebUIAssistantConnectModalProps extends Omit<
  BAIModalProps,
  'onOk' | 'onCancel' | 'children'
> {
  onRequestClose: () => void;
}

/** OpenAI base URL of a deployment, as the chat page builds it (`<endpoint>/v1`). */
const deploymentBaseURL = (endpointURL: string) => {
  try {
    return new URL('v1', endpointURL).toString();
  } catch {
    return undefined;
  }
};

/**
 * Connects the assistant to an OpenAI-compatible endpoint: a deployment and
 * one of its tokens, as on the chat page, or a URL and key typed in. The
 * choice is saved in the user's own `userConfig`.
 */
const WebUIAssistantConnectModal: React.FC<WebUIAssistantConnectModalProps> = ({
  onRequestClose,
  ...modalProps
}) => {
  'use memo';

  const { t } = useTranslation();
  const { message } = App.useApp();
  const { getErrorMessage } = useErrorMessageResolver();
  const saved = useMyAppConfig<WebUIAssistantConnection>(
    WEBUI_ASSISTANT_CONFIG_KEY,
  );
  const updateMyUserAppConfig = useUpdateMyUserAppConfig();
  const refetchMyAppConfig = useRefetchMyAppConfig();

  const [isCustom, setIsCustom] = useState(
    !!saved?.baseURL && !saved.deploymentId,
  );
  const [deploymentId, setDeploymentId] = useState(saved?.deploymentId);
  const [token, setToken] = useState(
    saved?.deploymentId ? saved.apiKey : undefined,
  );
  const [endpointURL, setEndpointURL] = useState<string | null>();
  const [failure, setFailure] = useState<string>();

  const save = async (connection: WebUIAssistantConnection) => {
    await updateMyUserAppConfig(WEBUI_ASSISTANT_CONFIG_KEY, connection);
    await refetchMyAppConfig();
    message.success(t('webuiAssistant.Connected'));
    onRequestClose();
  };

  const connectDeployment = async () => {
    const baseURL = endpointURL ? deploymentBaseURL(endpointURL) : undefined;
    if (!deploymentId || !baseURL) return;
    setFailure(undefined);
    const probe = await fetchOpenAIModels(baseURL, token);
    if (probe.error || probe.data.length === 0) {
      const reason =
        probe.error?.kind === 'http' && probe.error.status === 401
          ? t('webuiAssistant.ConnectionRejected')
          : t('webuiAssistant.EndpointUnreachable', { url: baseURL });
      setFailure(reason);
      throw new Error(reason);
    }
    try {
      await save({ baseURL, apiKey: token, deploymentId });
    } catch (error) {
      message.error(getErrorMessage(error));
      throw error;
    }
  };

  return (
    <BAIModal
      title={t('webuiAssistant.ConnectTitle')}
      width={520}
      okText={t('webuiAssistant.Connect')}
      okButtonProps={{
        disabled: isCustom || !deploymentId || !endpointURL,
      }}
      footer={isCustom ? null : undefined}
      onOk={connectDeployment}
      onCancel={onRequestClose}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiAssistant.ConnectDescription')}</Text>
        <Form layout="vertical">
          <Form.Item label={t('webuiAssistant.Endpoint')} required>
            <DeploymentSelect
              value={isCustom ? undefined : deploymentId}
              onChange={(id) => {
                setIsCustom(false);
                setDeploymentId(id);
                setToken(undefined);
                setEndpointURL(undefined);
                setFailure(undefined);
              }}
              customEndpointURL={isCustom ? (saved?.baseURL ?? ' ') : undefined}
              onSelectCustomEndpoint={() => {
                setIsCustom(true);
                setFailure(undefined);
              }}
            />
          </Form.Item>
          {!isCustom && deploymentId && (
            <Suspense fallback={<BAISkeleton rows={2} />}>
              <DeploymentEndpoint
                deploymentId={deploymentId}
                onResolved={setEndpointURL}
              />
              <Form.Item
                label={t('webuiAssistant.Token')}
                extra={t('webuiAssistant.TokenHint')}
              >
                <DeploymentTokenSelect
                  deploymentId={deploymentId}
                  value={token}
                  onChange={setToken}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Suspense>
          )}
        </Form>
        {failure && <Banner status="error" role="alert" title={failure} />}
      </BAIFlex>
      {isCustom && (
        <CustomEndpointForm
          baseURL={saved?.deploymentId ? undefined : saved?.baseURL}
          apiKey={saved?.deploymentId ? undefined : saved?.apiKey}
          onSubmit={(values) =>
            save({ baseURL: values.baseURL, apiKey: values.apiKey }).catch(
              (error) => message.error(getErrorMessage(error)),
            )
          }
          onCancel={onRequestClose}
          apiKeyHint={t('webuiAssistant.ApiKeySavedHint')}
        />
      )}
    </BAIModal>
  );
};

/** Reads the deployment's endpoint URL; a deployment without one cannot be connected yet. */
const DeploymentEndpoint: React.FC<{
  deploymentId: string;
  onResolved: (endpointURL: string | null) => void;
}> = ({ deploymentId, onResolved }) => {
  'use memo';

  const { t } = useTranslation();
  const { deployment } =
    useLazyLoadQuery<WebUIAssistantConnectModalDeploymentQuery>(
      graphql`
        query WebUIAssistantConnectModalDeploymentQuery($id: ID!) {
          deployment(id: $id) @catch {
            networkAccess {
              endpointUrl
            }
          }
        }
      `,
      { id: toGlobalId('ModelDeployment', deploymentId) },
      { fetchPolicy: 'network-only' },
    );
  const endpointURL = deployment.ok
    ? (deployment.value?.networkAccess.endpointUrl ?? null)
    : null;
  const report = useEffectEvent(() => onResolved(endpointURL));
  useEffect(() => {
    report();
  }, [endpointURL]);
  return endpointURL ? null : (
    <Banner status="warning" title={t('webuiAssistant.NoEndpointURL')} />
  );
};

export default WebUIAssistantConnectModal;
