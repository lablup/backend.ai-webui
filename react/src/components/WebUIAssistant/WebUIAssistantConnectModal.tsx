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
import {
  setCustomEndpointApiKey,
  useCustomEndpointApiKey,
} from '../Chat/customEndpointKeyStore';
import { fetchOpenAIModels, isAuthRejected } from '../Chat/openAIModels';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { Banner } from '@lablup/ui-common/Banner';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIModal,
  BAISkeleton,
  toGlobalId,
  useErrorMessageResolver,
  type BAIModalProps,
} from 'backend.ai-ui';
import {
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from 'react';
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
  const savedApiKey = useCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID);
  const updateMyUserAppConfig = useUpdateMyUserAppConfig();
  const refetchMyAppConfig = useRefetchMyAppConfig();

  const [isCustom, setIsCustom] = useState(
    !!saved?.baseURL && !saved.deploymentId,
  );
  const [deploymentId, setDeploymentId] = useState(saved?.deploymentId);
  const [token, setToken] = useState(
    saved?.deploymentId ? savedApiKey : undefined,
  );
  const [endpointURL, setEndpointURL] = useState<string | null>();
  // As on the chat page, a deployment is tried without a token first; the token field shows only when it is rejected.
  const [probed, setProbed] = useState<{
    url: string;
    result: 'open' | 'needsToken' | 'failed';
  }>();
  const [failure, setFailure] = useState<string>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDeploymentPending, startDeploymentTransition] = useTransition();
  // A probe still running when the user cancels must not save the abandoned connection.
  const isClosedRef = useRef(false);
  const close = () => {
    isClosedRef.current = true;
    onRequestClose();
  };
  const savedCustomURL =
    saved && !saved.deploymentId ? saved.baseURL : undefined;

  // Only the endpoint is saved; the key stays in memory, as on the chat page.
  const save = async ({
    apiKey,
    ...connection
  }: WebUIAssistantConnection & { apiKey?: string }) => {
    await updateMyUserAppConfig(WEBUI_ASSISTANT_CONFIG_KEY, {
      ...connection,
      hasApiKey: !!apiKey,
    });
    setCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID, apiKey);
    await refetchMyAppConfig();
    message.success(t('webuiAssistant.Connected'));
    onRequestClose();
  };

  const deploymentURL =
    !isCustom && endpointURL ? deploymentBaseURL(endpointURL) : undefined;
  useEffect(() => {
    if (!deploymentURL) return;
    let isStale = false;
    fetchOpenAIModels(deploymentURL).then((probe) => {
      if (isStale) return;
      setProbed({
        url: deploymentURL,
        result: isAuthRejected(probe.error)
          ? 'needsToken'
          : probe.error || probe.data.length === 0
            ? 'failed'
            : 'open',
      });
    });
    return () => {
      isStale = true;
    };
  }, [deploymentURL]);
  const tokenProbe = !deploymentURL
    ? undefined
    : probed?.url === deploymentURL
      ? probed.result
      : 'probing';
  const needsToken = tokenProbe === 'needsToken';

  // BAIModal does not await onOk, so the pending state and failures stay in here.
  const connectDeployment = async () => {
    const baseURL = deploymentURL;
    if (!deploymentId || !baseURL || isConnecting) return;
    const apiKey = needsToken ? token : undefined;
    setFailure(undefined);
    setIsConnecting(true);
    try {
      const probe = await fetchOpenAIModels(baseURL, apiKey);
      if (isClosedRef.current) return;
      if (probe.error || probe.data.length === 0) {
        setFailure(
          isAuthRejected(probe.error)
            ? t('webuiAssistant.ConnectionRejected')
            : t('webuiAssistant.EndpointUnreachable', { url: baseURL }),
        );
        return;
      }
      await save({ baseURL, apiKey, deploymentId });
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <BAIModal
      title={t('webuiAssistant.ConnectTitle')}
      width={520}
      okText={t('webuiAssistant.Connect')}
      okButtonProps={{
        disabled:
          isCustom ||
          !deploymentId ||
          !endpointURL ||
          isDeploymentPending ||
          tokenProbe === 'probing' ||
          (needsToken && !token),
      }}
      footer={isCustom ? null : undefined}
      confirmLoading={isConnecting}
      onOk={connectDeployment}
      onCancel={close}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiAssistant.ConnectDescription')}</Text>
        <Form layout="vertical">
          <Form.Item label={t('webuiAssistant.Endpoint')} required>
            <DeploymentSelect
              value={isCustom ? undefined : deploymentId}
              onChange={(id) => {
                // A transition keeps the modal on screen while DeploymentSelect's value query loads.
                startDeploymentTransition(() => {
                  setIsCustom(false);
                  setDeploymentId(id);
                  setToken(undefined);
                  setEndpointURL(undefined);
                  setFailure(undefined);
                });
              }}
              customEndpointURL={isCustom ? (savedCustomURL ?? ' ') : undefined}
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
              {tokenProbe === 'probing' && (
                <BAIFlex gap="xs" align="center">
                  <Spinner size="sm" />
                  <Text color="secondary">
                    {t('webuiAssistant.ModelLoading')}
                  </Text>
                </BAIFlex>
              )}
              {needsToken && (
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
              )}
            </Suspense>
          )}
        </Form>
        {(failure || tokenProbe === 'failed') && (
          <Banner
            status="error"
            role="alert"
            title={
              failure ??
              t('webuiAssistant.EndpointUnreachable', { url: deploymentURL })
            }
          />
        )}
        {isCustom && (
          <CustomEndpointForm
            isPlain
            baseURL={savedCustomURL}
            apiKey={savedCustomURL ? savedApiKey : undefined}
            onSubmit={(values) =>
              save({ baseURL: values.baseURL, apiKey: values.apiKey }).catch(
                (error) => message.error(getErrorMessage(error)),
              )
            }
            onCancel={close}
          />
        )}
      </BAIFlex>
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
