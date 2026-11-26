/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { WebUIAssistantConnectModalDeploymentQuery } from '../../__generated__/WebUIAssistantConnectModalDeploymentQuery.graphql';
import { App } from '../../app-shim';
import { Form } from '../../form-engine';
import { useWebUINavigate } from '../../hooks';
import { useMyAppConfig } from '../../hooks/useAppConfig';
import { useProjectPath } from '../../hooks/useRouteScope';
import DeploymentSelect from '../Chat/DeploymentSelect';
import DeploymentTokenSelect from '../Chat/DeploymentTokenSelect';
import {
  setCustomEndpointApiKey,
  useCustomEndpointApiKey,
} from '../Chat/customEndpointKeyStore';
import { fetchOpenAIModels } from '../Chat/openAIModels';
import WebUIAssistantEndpointForm, {
  type WebUIAssistantEndpointFormHandle,
} from './WebUIAssistantEndpointForm';
import { setCustomConnectionThisLoad } from './customConnectionThisLoad';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  isAuthRejected,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { Banner } from '@lablup/ui-common/Banner';
import { ButtonGroup } from '@lablup/ui-common/ButtonGroup';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIModal,
  BAISegmentedControl,
  BAISegmentedControlItem,
  BAISelect,
  toGlobalId,
  useErrorMessageResolver,
  type BAIModalProps,
} from 'backend.ai-ui';
import { InfoIcon } from 'lucide-react';
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
  const webuiNavigate = useWebUINavigate();
  const buildProjectPath = useProjectPath();
  const [saved, setSaved] = useMyAppConfig<WebUIAssistantConnection>(
    'userConfig',
    WEBUI_ASSISTANT_CONFIG_KEY,
  );
  const savedApiKey = useCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID);

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
    await setSaved({ ...connection, hasApiKey: !!apiKey });
    setCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID, apiKey);
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
  // Resolving the endpoint and trying it without a token both show on the select, not as a placeholder below it.
  const isDeploymentLoading =
    !isCustom &&
    !!deploymentId &&
    (isDeploymentPending ||
      endpointURL === undefined ||
      tokenProbe === 'probing');

  const endpointFormRef = useRef<WebUIAssistantEndpointFormHandle>(null);
  const connectCustom = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      await endpointFormRef.current?.submit();
    } catch (error) {
      message.error(getErrorMessage(error));
    } finally {
      setIsConnecting(false);
    }
  };

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
          !isCustom &&
          (!deploymentId ||
            !endpointURL ||
            isDeploymentLoading ||
            (needsToken && !token)),
      }}
      confirmLoading={isConnecting}
      onOk={isCustom ? connectCustom : connectDeployment}
      onCancel={close}
      {...modalProps}
    >
      <BAIFlex direction="column" align="stretch" gap="md">
        <Text>{t('webuiAssistant.ConnectDescription')}</Text>
        <BAISegmentedControl
          value={isCustom ? 'custom' : 'deployment'}
          onChange={(value) => {
            setIsCustom(value === 'custom');
            setFailure(undefined);
          }}
          layout="fill"
          aria-label={t('webuiAssistant.Endpoint')}
        >
          <BAISegmentedControlItem
            value="deployment"
            label={t('webuiAssistant.Deployment')}
          />
          <BAISegmentedControlItem
            value="custom"
            label={t('webuiAssistant.CustomEndpoint')}
          />
        </BAISegmentedControl>
        {!isCustom && (
          <Form layout="vertical">
            <Form.Item label={t('webuiAssistant.Deployment')} required>
              <BAIFlex gap="xs" align="center">
                <BAIFlex direction="column" align="stretch" style={{ flex: 1 }}>
                  <DeploymentSelect
                    value={deploymentId}
                    isLoading={isDeploymentLoading}
                    onChange={(id) => {
                      // A transition keeps the modal on screen while DeploymentSelect's value query loads.
                      startDeploymentTransition(() => {
                        setDeploymentId(id);
                        setToken(undefined);
                        setEndpointURL(undefined);
                        setFailure(undefined);
                      });
                    }}
                  />
                </BAIFlex>
                {deploymentId && (
                  <ButtonGroup label={t('webuiAssistant.ViewModelInfo')}>
                    <IconButton
                      icon={<InfoIcon />}
                      label={t('webuiAssistant.ViewModelInfo')}
                      tooltip={t('webuiAssistant.ViewModelInfo')}
                      onClick={() =>
                        webuiNavigate(
                          buildProjectPath(`deployments/${deploymentId}`),
                        )
                      }
                    />
                  </ButtonGroup>
                )}
              </BAIFlex>
            </Form.Item>
            {deploymentId && (
              <Suspense fallback={null}>
                <DeploymentEndpoint
                  deploymentId={deploymentId}
                  onResolved={setEndpointURL}
                />
              </Suspense>
            )}
            {deploymentId && needsToken && (
              <Form.Item
                label={t('webuiAssistant.Token')}
                extra={t('webuiAssistant.TokenHint')}
              >
                <Suspense
                  fallback={
                    <BAISelect
                      aria-label={t('webuiAssistant.Token')}
                      placeholder={t('chatui.SelectToken')}
                      isLoading
                      disabled
                      width="100%"
                      options={[]}
                    />
                  }
                >
                  <DeploymentTokenSelect
                    deploymentId={deploymentId}
                    value={token}
                    onChange={setToken}
                    style={{ width: '100%' }}
                  />
                </Suspense>
              </Form.Item>
            )}
          </Form>
        )}
        {!isCustom && (failure || tokenProbe === 'failed') && (
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
          <WebUIAssistantEndpointForm
            ref={endpointFormRef}
            baseURL={savedCustomURL}
            apiKey={savedCustomURL ? savedApiKey : undefined}
            onSubmit={async (values) => {
              setCustomConnectionThisLoad(values.baseURL);
              try {
                await save({ baseURL: values.baseURL, apiKey: values.apiKey });
              } catch (error) {
                setCustomConnectionThisLoad(undefined);
                throw error;
              }
            }}
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
