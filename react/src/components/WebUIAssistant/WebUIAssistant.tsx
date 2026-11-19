/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMyAppConfig } from '../../hooks/useAppConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import { useCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import { useCurrentLanguage } from '../DefaultProviders';
import ErrorBoundaryWithNullFallback from '../ErrorBoundaryWithNullFallback';
import './WebUIAssistant.css';
import WebUIAssistantChat from './WebUIAssistantChat';
import WebUIAssistantConnectModal from './WebUIAssistantConnectModal';
import { WEBUI_ASSISTANT_PROFILE } from './webUIAssistantProfile';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import { BAIFlex, BAIPopconfirm, BAIUnmountAfterClose } from 'backend.ai-ui';
import { EraserIcon, MessageCircle, PlugZap, X } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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
  const connection = useMyAppConfig<WebUIAssistantConnection>(
    WEBUI_ASSISTANT_CONFIG_KEY,
  );
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [conversationKey, setConversationKey] = useState(0);
  // A link inside the modal (the token settings shortcut) leaves the page; the modal must not cover the new one.
  const { pathname } = useLocation();
  const [connectPathname, setConnectPathname] = useState(pathname);
  if (pathname !== connectPathname) {
    setConnectPathname(pathname);
    setIsConnectOpen(false);
  }

  const apiKey = useCustomEndpointApiKey(WEBUI_ASSISTANT_KEY_ID);
  const isConnected =
    !!connection?.baseURL && (!connection.hasApiKey || !!apiKey);
  const isPanelShown = isOpen && isConnected;
  const title =
    WEBUI_ASSISTANT_PROFILE.translations[lang] || WEBUI_ASSISTANT_PROFILE.name;
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
            <BAIPopconfirm
              title={t('webuiAssistant.ClearConversationConfirm')}
              okText={t('webuiAssistant.ClearConversation')}
              isDanger
              onConfirm={() => setConversationKey((key) => key + 1)}
            >
              <IconButton
                variant="ghost"
                size="sm"
                icon={<EraserIcon size="1em" />}
                label={t('webuiAssistant.ClearConversation')}
                tooltip={t('webuiAssistant.ClearConversation')}
              />
            </BAIPopconfirm>
          </BAIFlex>
        </BAIFlex>
        {hasBeenShown &&
          (!connection || !isConnected ? (
            <BAIFlex justify="center" align="center" style={{ flex: '1 1 0%' }}>
              <Spinner />
            </BAIFlex>
          ) : (
            <ErrorBoundaryWithNullFallback>
              <WebUIAssistantChat
                key={`${conversationKey}-${connection.baseURL}-${apiKey ?? ''}`}
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
