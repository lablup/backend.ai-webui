/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — drop-in for antd's `App.useApp()` /
 `import { message } from 'antd'`, backed by Astryx.

 Call-site contract preserved (the ticket-11 mass migration is a pure import
 swap for ~95% of the 134 `App.useApp()` call sites — answers/07 §5):

     -import { App } from 'antd';
     +import { App } from '../app-shim';

     const { message, modal } = App.useApp();
     message.success('...');                          // toast, close handle, thenable
     modal.confirm({ title, content, onOk });         // AlertDialog/Dialog, thenable

 `notification` is deliberately NOT part of this contract: it is already
 fully isolated behind the jotai store in `useBAINotification.tsx` and
 migrates independently (answers/07 §2).

 Mount `<BAIAppProvider>` once at the app root (DefaultProviders). It owns
 Astryx's `LayerProvider` (toast viewport + layer stacking), the toast bridge
 registration, and the imperative-modal host.
*/
import {
  registerBridge,
  setMessageConfig,
  type AppShimMessageConfig,
} from './bridge';
import { message, type MessageApi } from './message';
import { AppShimModalHost, modal, type ModalApi } from './modal';
import { LayerProvider, type LayerToastConfig } from '@lablup/ui-common/Layer';
import {
  MODAL_LIVE_ATTRIBUTE,
  refreshModalBackground,
} from '@lablup/ui-common/Modal';
import { useToast } from '@lablup/ui-common/Toast';
import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from 'react';

export { message, modal };
export type { MessageApi, ModalApi, AppShimMessageConfig };
export type {
  JointContent,
  MessageArgsProps,
  MessageKind,
  MessageType,
} from './message';
export type { ModalKind, ModalShimFuncProps, ModalShimReturn } from './modal';

/* ------------------------------------------------------------------ useApp */

export interface AppShimApi {
  message: MessageApi;
  modal: ModalApi;
}

const APP_API: AppShimApi = { message, modal };

/** Drop-in for antd's `App.useApp()`. */
export function useApp(): AppShimApi {
  'use memo';
  return APP_API;
}

/** `import { App } from '../app-shim'` — same call shape as antd's. */
export const App = { useApp };

// Dev-only handle so imperative flows can be driven and asserted from the
// browser console / Playwright without a backend (e.g. the login screen's
// `modal.confirm` branch requires a 409 from a live server to trigger).
// Tree-shaken out of production builds.
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as { __baiAppShim?: AppShimApi }).__baiAppShim = APP_API;
}

/* ---------------------------------------------------------------- provider */

const BAIAppBridgeMount: React.FC<{
  messageConfig?: AppShimMessageConfig;
}> = ({ messageConfig }) => {
  'use memo';
  const showToast = useToast();

  useEffect(() => {
    setMessageConfig(messageConfig);
  }, [messageConfig]);

  useEffect(() => {
    registerBridge({ showToast });
    return () => registerBridge(null);
  }, [showToast]);

  return null;
};

/**
 * Keeps the toast viewport usable over an open ui-common `Modal`, which inerts
 * everything outside `[data-uic-modal-live]`. `LayerProvider` renders the
 * viewport right after its children and takes no props for it, so this
 * `<template>` (never inerted, never painted) is rendered last to reach it.
 */
const ToastViewportLiveMark: React.FC = () => {
  'use memo';
  const anchorRef = useRef<HTMLTemplateElement>(null);

  useLayoutEffect(() => {
    const viewport = anchorRef.current?.nextElementSibling;
    // Only the outermost LayerProvider owns a viewport; a nested one renders
    // its children bare, and then there is nothing here to mark.
    if (!viewport?.hasAttribute('popover')) return;
    viewport.setAttribute(MODAL_LIVE_ATTRIBUTE, '');
    refreshModalBackground();
    return () => {
      viewport.removeAttribute(MODAL_LIVE_ATTRIBUTE);
      refreshModalBackground();
    };
  }, []);

  return <template ref={anchorRef} data-bai-toast-viewport-anchor="" />;
};

export interface BAIAppProviderProps {
  children?: ReactNode;
  /** antd `AppProps['message']`-shaped global message config. */
  message?: AppShimMessageConfig;
  /** Astryx toast viewport config (position, maxVisible, inset). */
  toast?: LayerToastConfig;
}

/**
 * Mount once, at the app root, inside any theme provider. Owns Astryx's
 * `LayerProvider`, the toast bridge, and the imperative-modal host.
 */
export const BAIAppProvider: React.FC<BAIAppProviderProps> = ({
  children,
  message: messageConfig,
  toast,
}) => {
  'use memo';
  return (
    <LayerProvider toast={toast}>
      <BAIAppBridgeMount messageConfig={messageConfig} />
      <AppShimModalHost />
      {children}
      <ToastViewportLiveMark />
    </LayerProvider>
  );
};
