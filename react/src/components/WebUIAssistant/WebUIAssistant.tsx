/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useAIAgent } from '../../hooks/useAIAgent';
import { useMyAppConfig } from '../../hooks/useAppConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import { useCurrentLanguage } from '../DefaultProviders';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import './WebUIAssistant.css';
import WebUIAssistantChat from './WebUIAssistantChat';
import WebUIAssistantConnectModal from './WebUIAssistantConnectModal';
import {
  WEBUI_ASSISTANT_AGENT_ID,
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAIUnmountAfterClose } from 'backend.ai-ui';
import { MessageCircle, PlugZap, RotateCcw, X } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
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
  const { agents } = useAIAgent();
  const connection = useMyAppConfig<WebUIAssistantConnection>(
    WEBUI_ASSISTANT_CONFIG_KEY,
  );
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);

  const profile = agents.find((agent) => agent.id === WEBUI_ASSISTANT_AGENT_ID);
  const apiKey = useCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID);
  const isConnected =
    !!connection?.baseURL && (!connection.hasApiKey || !!apiKey);
  const isPanelShown = isOpen && isConnected;
  const title = profile?.translations?.[lang]?.name || profile?.name;
  // The chat (manual download, /models probe) mounts on first open (ADR 0032) and then stays.
  const [hasBeenShown, setHasBeenShown] = useState(false);
  if (isPanelShown && !hasBeenShown) setHasBeenShown(true);

  useEffect(() => {
    if (!isOpen || isConnectOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Skip an Escape a modal, popover or IME composition already consumed.
      // Native-dialog modals close on `cancel` without preventDefault on keydown.
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !event.isComposing &&
        !document.querySelector('dialog[open]')
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isConnectOpen]);

  return (
    <>
      {/* Kept mounted while hidden so the conversation survives closing the panel. */}
      <BAIFlex
        direction="column"
        align="stretch"
        className="webui-assistant-panel"
        // BAIFlex's inline `position`/`display` would beat the class and `hidden`.
        style={{ position: 'fixed', display: isPanelShown ? 'flex' : 'none' }}
        role="dialog"
        aria-label={title}
      >
        <BAIFlex
          justify="between"
          align="center"
          gap="xs"
          className="webui-assistant-panel__header"
          style={{
            flexShrink: 0,
            padding:
              'var(--spacing-2) var(--spacing-2) var(--spacing-2) var(--spacing-4)',
          }}
        >
          <BAIFlex gap="xs" align="center">
            <MessageCircle size="1em" />
            <Text weight="semibold" color="inherit">
              {title}
            </Text>
          </BAIFlex>
          <BAIFlex gap="xxs" align="center">
            <IconButton
              variant="ghost"
              size="sm"
              icon={<PlugZap size="1em" />}
              label={t('webuiAssistant.ChangeConnection')}
              tooltip={t('webuiAssistant.ChangeConnection')}
              onClick={() => setIsConnectOpen(true)}
            />
            <IconButton
              variant="ghost"
              size="sm"
              icon={<RotateCcw size="1em" />}
              label={t('webuiAssistant.ClearConversation')}
              tooltip={t('webuiAssistant.ClearConversation')}
              onClick={() => setConversationKey((key) => key + 1)}
            />
          </BAIFlex>
        </BAIFlex>
        {hasBeenShown &&
          (!profile || !connection || !isConnected ? (
            <BAIFlex justify="center" align="center" style={{ flex: '1 1 0%' }}>
              <Spinner />
            </BAIFlex>
          ) : (
            <ErrorBoundaryWithNullFallback>
              <WebUIAssistantChat
                key={`${conversationKey}-${connection.baseURL}-${apiKey ?? ''}`}
                profile={profile}
                baseURL={connection.baseURL}
                apiKey={apiKey}
                isVisible={isPanelShown}
                onChangeConnection={() => setIsConnectOpen(true)}
              />
            </ErrorBoundaryWithNullFallback>
          ))}
      </BAIFlex>
      <IconButton
        className="webui-assistant-fab"
        data-testid="webui-assistant-fab"
        variant="primary"
        size="lg"
        elevation="med"
        icon={isPanelShown ? <X /> : <MessageCircle />}
        label={isPanelShown ? t('button.Close') : t('webuiAssistant.Open')}
        tooltip={isPanelShown ? undefined : title}
        aria-expanded={isPanelShown}
        onClick={() => {
          // Without a connection the button asks for one; the chat opens once it is saved.
          if (!isConnected) {
            setIsConnectOpen(true);
            setIsOpen(true);
            return;
          }
          setIsOpen((open) => !open);
        }}
      />
      <Suspense fallback={null}>
        <BAIUnmountAfterClose>
          <WebUIAssistantConnectModal
            open={isConnectOpen}
            onRequestClose={() => setIsConnectOpen(false)}
          />
        </BAIUnmountAfterClose>
      </Suspense>
    </>
  );
};

export default WebUIAssistant;
