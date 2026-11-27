/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { useMyAppConfig } from '../../hooks/useAppConfig';
import { useBAISettingUserState } from '../../hooks/useBAISetting';
import BAIErrorBoundary from '../BAIErrorBoundary';
import { useCustomEndpointApiKey } from '../Chat/customEndpointKeyStore';
import { useCurrentLanguage } from '../DefaultProviders';
import './WebUIAssistant.css';
import WebUIAssistantKeyRestorer from './WebUIAssistantKeyRestorer';
import { useCustomConnectionThisLoad } from './customConnectionThisLoad';
import { WEBUI_ASSISTANT_PROFILE } from './webUIAssistantProfile';
import {
  WEBUI_ASSISTANT_CONFIG_KEY,
  WEBUI_ASSISTANT_KEY_ID,
  type WebUIAssistantConnection,
} from './webUIAssistantPrompt';
import { IconButton } from '@lablup/ui-common/IconButton';
import { Spinner } from '@lablup/ui-common/Spinner';
import { Text } from '@lablup/ui-common/Text';
import {
  BAIFlex,
  BAIPopconfirm,
  BAIUnmountAfterClose,
  useBAILogger,
} from 'backend.ai-ui';
import { EraserIcon, MessageCircle, PlugZap, X } from 'lucide-react';
import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

const loadChat = () => import('./WebUIAssistantChat');
const loadConnectModal = () => import('./WebUIAssistantConnectModal');
const WebUIAssistantChat = lazy(loadChat);
const WebUIAssistantConnectModal = lazy(loadConnectModal);

/** The floating WebUI Assistant; renders nothing until the user turns it on. */
const WebUIAssistant: React.FC = () => {
  'use memo';

  const [enabled] = useBAISettingUserState('experimental_webui_assistant');
  return enabled ? <WebUIAssistantFloating /> : null;
};

const WebUIAssistantFloating: React.FC = () => {
  'use memo';

  const { t } = useTranslation();
  const { logger } = useBAILogger();
  const [lang] = useCurrentLanguage();
  const [connection] = useMyAppConfig<WebUIAssistantConnection>(
    'userConfig',
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
  const customBaseURLThisLoad = useCustomConnectionThisLoad();
  // A deployment reconnects after a reload; a custom endpoint is connected again each time.
  const isConnected =
    !!connection?.baseURL &&
    (connection.deploymentId
      ? !connection.hasApiKey || !!apiKey
      : customBaseURLThisLoad === connection.baseURL);
  const isPanelShown = isOpen && isConnected;
  const title =
    WEBUI_ASSISTANT_PROFILE.translations[lang] || WEBUI_ASSISTANT_PROFILE.name;
  // The chat (manual download, /models probe) mounts on first open (ADR 0032) and then stays.
  const [hasBeenShown, setHasBeenShown] = useState(false);
  if (isPanelShown && !hasBeenShown) setHasBeenShown(true);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    origin: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const wasDraggedRef = useRef(false);
  // How far the user dragged the button from its corner; the panel follows it.
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // The panel opens below the button when there is no room for it above.
  const [isPanelBelow, setIsPanelBelow] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const updatePanelSide = () => {
    const rect = fabRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rootStyle = getComputedStyle(document.body);
    const top =
      (Number.parseFloat(rootStyle.getPropertyValue('--webui-header-height')) ||
        60) +
      (Number.parseFloat(
        rootStyle.getPropertyValue('--webui-titlebar-height'),
      ) || 0);
    const gap = 12;
    // A hidden panel has no height; the fallback mirrors the CSS formula.
    const panelHeight =
      panelRef.current?.offsetHeight ||
      Math.min(600, Math.max(320, window.innerHeight - top - 120));
    const roomAbove = rect.top - top - gap;
    const roomBelow = window.innerHeight - rect.bottom - gap;
    setIsPanelBelow(roomAbove < panelHeight && roomBelow > roomAbove);
  };
  const offsetStyle = {
    '--webui-assistant-dx': `${offset.x}px`,
    '--webui-assistant-dy': `${offset.y}px`,
  } as React.CSSProperties;

  const onFabPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    // Start from where the CSS clamp drew the button, which differs from `offset` after a resize.
    const [drawnX = 0, drawnY = 0] = getComputedStyle(button)
      .translate.split(' ')
      .map((part) => Number.parseFloat(part) || 0);
    const origin = { x: drawnX, y: drawnY };
    button.setPointerCapture(event.pointerId);
    wasDraggedRef.current = false;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      minX: origin.x - rect.left,
      maxX: origin.x + window.innerWidth - rect.right,
      minY: origin.y - rect.top,
      maxY: origin.y + window.innerHeight - rect.bottom,
      origin,
      moved: false,
    };
  };
  const onFabPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    // A few pixels of jitter is still a click.
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
    setOffset({
      x: clamp(drag.origin.x + dx, drag.minX, drag.maxX),
      y: clamp(drag.origin.y + dy, drag.minY, drag.maxY),
    });
  };
  const onFabPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    wasDraggedRef.current = dragRef.current.moved;
    dragRef.current = null;
    updatePanelSide();
  };
  // No click follows a cancelled pointer, so nothing must be swallowed later.
  const onFabPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    wasDraggedRef.current = false;
    dragRef.current = null;
  };

  const onResize = useEffectEvent(() => updatePanelSide());
  useEffect(() => {
    if (!isPanelShown) return;
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isPanelShown]);

  const loadChunk = async (load: () => Promise<unknown>) => {
    try {
      await load();
      return true;
    } catch (error) {
      logger.error('Failed to load the WebUI Assistant chunk:', error);
      return false;
    }
  };

  const openConnectModal = async () => {
    const clickedPathname = window.location.pathname;
    if (!(await loadChunk(loadConnectModal))) return false;
    if (window.location.pathname !== clickedPathname) return false;
    startTransition(() => setIsConnectOpen(true));
    return true;
  };

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
        ref={panelRef}
        className="webui-assistant-panel"
        data-below={isPanelBelow || undefined}
        // BAIFlex's inline `position`/`display` would beat the class and `hidden`.
        style={{
          position: 'fixed',
          display: isPanelShown ? 'flex' : 'none',
          ...offsetStyle,
        }}
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
              clickAction={async () => {
                await openConnectModal();
              }}
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
        <Suspense
          fallback={
            <BAIFlex justify="center" align="center" style={{ flex: '1 1 0%' }}>
              <Spinner />
            </BAIFlex>
          }
        >
          {hasBeenShown &&
            (!connection || !isConnected ? (
              <BAIFlex
                justify="center"
                align="center"
                style={{ flex: '1 1 0%' }}
              >
                <Spinner />
              </BAIFlex>
            ) : (
              <BAIErrorBoundary
                key={`${conversationKey}-${connection.baseURL}-${apiKey ?? ''}`}
                style={{ flex: '1 1 0%' }}
              >
                <WebUIAssistantChat
                  baseURL={connection.baseURL}
                  apiKey={apiKey}
                  isVisible={isPanelShown}
                  onChangeConnection={openConnectModal}
                />
              </BAIErrorBoundary>
            ))}
        </Suspense>
      </BAIFlex>
      <IconButton
        ref={fabRef}
        className="webui-assistant-fab"
        data-testid="webui-assistant-fab"
        variant="primary"
        size="lg"
        elevation="med"
        icon={isPanelShown ? <X /> : <MessageCircle />}
        label={isPanelShown ? t('button.Close') : t('webuiAssistant.Open')}
        tooltip={isPanelShown ? undefined : title}
        aria-expanded={isPanelShown}
        style={offsetStyle}
        onPointerDown={onFabPointerDown}
        onPointerMove={onFabPointerMove}
        onPointerUp={onFabPointerUp}
        onPointerCancel={onFabPointerCancel}
        clickAction={async (event) => {
          // The click that ends a drag does not toggle the panel; a keyboard click (detail 0) always does.
          const wasDragged = wasDraggedRef.current && event.detail !== 0;
          wasDraggedRef.current = false;
          if (wasDragged) return;
          updatePanelSide();
          // Without a connection the button asks for one; the chat opens once it is saved.
          if (!isConnected) {
            if (await openConnectModal()) {
              startTransition(() => setIsOpen(true));
            }
            return;
          }
          if (!isOpen && !(await loadChunk(loadChat))) return;
          startTransition(() => setIsOpen((open) => !open));
        }}
      />
      {connection?.deploymentId && connection.hasApiKey && !apiKey && (
        <WebUIAssistantKeyRestorer connection={connection} />
      )}
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
