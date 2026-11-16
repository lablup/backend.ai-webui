/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAIAgent } from '../../hooks/useAIAgent';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCurrentLanguage } from '../DefaultProviders';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import './WebUIAssistant.css';
import WebUIAssistantChat from './WebUIAssistantChat';
import WebUIAssistantProvisioner from './WebUIAssistantProvisioner';
import WebUIAssistantSetupModal from './WebUIAssistantSetupModal';
import { WEBUI_ASSISTANT_AGENT_ID } from './webUIAssistantPrompt';
import { webUIAssistantSetupOpenAtom } from './webUIAssistantState';
import { Banner } from '@lablup/ui-common/Banner';
import { Button } from '@lablup/ui-common/Button';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import { BAICard, BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import { useAtom } from 'jotai';
import { MessageCircle, RotateCcw, X } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

/** The floating WebUI Assistant; renders nothing until the user turns it on. */
const WebUIAssistant: React.FC = () => {
  'use memo';

  const [enabled] = useBAISettingUserState('experimental_webui_assistant');
  return enabled ? <WebUIAssistantFloating /> : null;
};

const WebUIAssistantFloating: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const [lang] = useCurrentLanguage();
  const { agents, getEndpointBinding, upsertEndpointBinding } = useAIAgent();
  const [isSetupOpen, setIsSetupOpen] = useAtom(webUIAssistantSetupOpenAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  const [problem, setProblem] = useState<'missing' | 'token' | null>(null);
  // A second 401 right after a fresh token is not a stale token; stop retrying.
  const hasReissuedRef = useRef(false);

  const profile = agents.find((agent) => agent.id === WEBUI_ASSISTANT_AGENT_ID);
  const binding = getEndpointBinding(WEBUI_ASSISTANT_AGENT_ID);
  const deploymentId = binding?.endpoint_id;
  const isReady = !!(binding?.endpoint_url && binding.endpoint_token);
  const isProvisioning = !!deploymentId && !isReady;
  const title = profile?.translations?.[lang]?.name || profile?.name;

  // A deployment that just started shows its progress in the panel.
  const [seenDeploymentId, setSeenDeploymentId] = useState(deploymentId);
  if (deploymentId !== seenDeploymentId) {
    setSeenDeploymentId(deploymentId);
    if (deploymentId) setIsOpen(true);
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  const startAgain = () => {
    upsertEndpointBinding(WEBUI_ASSISTANT_AGENT_ID, null);
    setProblem(null);
    setIsSetupOpen(true);
  };

  const renderBody = () => {
    if (!profile) {
      return <Spinner />;
    }
    if (problem === 'missing') {
      return (
        <SetupPrompt
          message={t('webuiAssistant.DeploymentMissing')}
          onStart={startAgain}
        />
      );
    }
    if (problem === 'token') {
      return (
        <SetupPrompt
          message={t('webuiAssistant.TokenRejected')}
          onStart={startAgain}
        />
      );
    }
    if (!deploymentId) {
      return (
        <SetupPrompt
          message={t('webuiAssistant.NotStarted')}
          onStart={() => setIsSetupOpen(true)}
        />
      );
    }
    if (isProvisioning) {
      return (
        <BAIFlex
          direction="column"
          align="center"
          justify="center"
          gap="sm"
          style={{ flex: 1 }}
        >
          <Spinner />
          <Text>{t('webuiAssistant.Starting')}</Text>
          <Text color="secondary" size="sm">
            {t('webuiAssistant.StartingDesc')}
          </Text>
        </BAIFlex>
      );
    }
    return (
      <ErrorBoundaryWithNullFallback>
        <WebUIAssistantChat
          key={conversationKey}
          profile={profile}
          endpointURL={binding?.endpoint_url ?? ''}
          token={binding?.endpoint_token ?? ''}
          onTokenRejected={() => {
            if (hasReissuedRef.current || !deploymentId) {
              setProblem('token');
              return;
            }
            hasReissuedRef.current = true;
            upsertEndpointBinding(WEBUI_ASSISTANT_AGENT_ID, {
              endpoint_id: deploymentId,
            });
          }}
        />
      </ErrorBoundaryWithNullFallback>
    );
  };

  return (
    <>
      {isProvisioning && deploymentId && (
        <ErrorBoundaryWithNullFallback>
          <Suspense fallback={null}>
            <WebUIAssistantProvisioner
              deploymentId={deploymentId}
              onReady={(next) =>
                upsertEndpointBinding(WEBUI_ASSISTANT_AGENT_ID, next)
              }
              onMissing={() => setProblem('missing')}
            />
          </Suspense>
        </ErrorBoundaryWithNullFallback>
      )}
      {/* Kept mounted while hidden so the conversation survives closing the panel. */}
      <BAIFlex
        direction="column"
        align="stretch"
        className="webui-assistant-panel"
        hidden={!isOpen}
        role="dialog"
        aria-label={title}
      >
        <BAICard
          size="small"
          title={
            <BAIFlex gap="xs" align="center">
              <MessageCircle size="1em" />
              {title}
            </BAIFlex>
          }
          extra={
            <BAIFlex gap="xxs" align="center">
              {isReady && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  icon={<RotateCcw size="1em" />}
                  label={t('webuiAssistant.ClearConversation')}
                  tooltip={t('webuiAssistant.ClearConversation')}
                  onClick={() => setConversationKey((key) => key + 1)}
                />
              )}
              <IconButton
                variant="ghost"
                size="sm"
                icon={<X size="1em" />}
                label={t('button.Close')}
                tooltip={t('button.Close')}
                onClick={() => setIsOpen(false)}
              />
            </BAIFlex>
          }
        >
          <BAIFlex
            direction="column"
            align="stretch"
            className="webui-assistant-panel__body"
          >
            {renderBody()}
          </BAIFlex>
        </BAICard>
      </BAIFlex>
      <IconButton
        className="webui-assistant-fab"
        data-testid="webui-assistant-fab"
        variant="primary"
        size="lg"
        elevation="med"
        icon={isOpen ? <X /> : <MessageCircle />}
        label={isOpen ? t('button.Close') : t('webuiAssistant.Open')}
        tooltip={isOpen ? undefined : title}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      />
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <WebUIAssistantSetupModal
            open={isSetupOpen}
            onRequestClose={() => setIsSetupOpen(false)}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </>
  );
};

const SetupPrompt: React.FC<{ message: string; onStart: () => void }> = ({
  message,
  onStart,
}) => {
  'use memo';

  const { t } = useTranslation();
  return (
    <BAIFlex
      direction="column"
      align="center"
      justify="center"
      gap="md"
      style={{ flex: 1 }}
    >
      <Banner status="info" title={message} />
      <Button
        variant="primary"
        label={t('webuiAssistant.StartModel')}
        onClick={onStart}
      />
    </BAIFlex>
  );
};

export default WebUIAssistant;
