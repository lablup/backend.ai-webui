/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT (cn-oss-removal / ticket 10) — minimal drop-in for antd's
 `App.useApp()` / `import { message } from 'antd'`, backed by Astryx.

 Call-site contract preserved:

     -import { App, message } from 'antd';
     +import { App, message } from '../app-shim';

     const { message, modal } = App.useApp();
     message.success('...'); message.error('...');
     modal.confirm({ title, content, okText, okButtonProps, onOk, onCancel });

 Scope note: this implements only what the pilot page's component graph uses —
 `message.{success,error,warning,info}` and `modal.confirm`. `modal.error` /
 `modal.info` and `notification` are intentionally out of scope (07 §2 shows
 `notification` is already isolated behind a single jotai file).
*/
import { registerBridge, withBridge } from './bridge';
import { useImperativeAlertDialog } from '@astryxdesign/core/AlertDialog';
import { LayerProvider } from '@astryxdesign/core/Layer';
import { useToast } from '@astryxdesign/core/Toast';
import React, { useEffect, type ReactNode } from 'react';

/* ------------------------------------------------------------------ message */

/**
 * PILOT-DECISION: Astryx `Toast` has exactly two types — `'info'` and
 * `'error'`. antd's message has four (`success`/`info`/`warning`/`error`) with
 * distinct icons and colours. We map success/info/warning -> `'info'` and
 * error -> `'error'`, which loses the green check on success (171 call sites
 * repo-wide) and the amber warning tint (9 call sites). Restoring them needs
 * either a theme extension (`components: { toast: { 'type:success': ... } }`)
 * or a self-built toast. Flagged for human review.
 */
type MessageContent = ReactNode;

function show(type: 'info' | 'error', content: MessageContent): void {
  withBridge((b) => {
    b.showToast({ body: content, type });
  });
}

export const message = {
  success: (content: MessageContent) => show('info', content),
  info: (content: MessageContent) => show('info', content),
  warning: (content: MessageContent) => show('info', content),
  error: (content: MessageContent) => show('error', content),
};

export type MessageApi = typeof message;

/* -------------------------------------------------------------------- modal */

export interface ConfirmOptions {
  title?: ReactNode;
  content?: ReactNode;
  okText?: ReactNode;
  cancelText?: ReactNode;
  okType?: 'primary' | 'danger';
  okButtonProps?: { danger?: boolean };
  onOk?: () => void | Promise<unknown>;
  onCancel?: () => void;
}

/**
 * PILOT-DECISION: `AlertDialog.title` and `.description` are typed `string`,
 * while antd accepts any `ReactNode`. Non-string content is coerced with
 * `String()` here; the 5 repo-wide call sites that pass JSX need the generic
 * `Dialog` instead (07 §1.1). None of them are on this page.
 */
function toText(node: ReactNode): string {
  return typeof node === 'string' ? node : node == null ? '' : String(node);
}

function confirm(options: ConfirmOptions): void {
  withBridge((b) => {
    b.alert.show({
      title: toText(options.title),
      description: toText(options.content),
      actionLabel: toText(options.okText) || 'OK',
      cancelLabel: toText(options.cancelText) || 'Cancel',
      // antd's `danger`/`okType` both mean "destructive"; Astryx's default
      // AlertDialog action variant is already destructive.
      actionVariant:
        options.okButtonProps?.danger || options.okType === 'danger'
          ? 'destructive'
          : 'primary',
      // `onAction` does NOT auto-close (unlike antd's onOk), so the shim owns
      // the close. Async onOk resolves before hiding, matching antd's
      // "keep the dialog open until the promise settles" behaviour.
      onAction: async () => {
        try {
          await options.onOk?.();
        } finally {
          b.alert.hide();
        }
      },
    });
  });
}

export const modal = { confirm };

export type ModalApi = typeof modal;

/* ------------------------------------------------------------------ useApp */

export interface AppShimApi {
  message: MessageApi;
  modal: ModalApi;
}

const APP_API: AppShimApi = { message, modal };

/** Drop-in for antd's `App.useApp()`. */
export function useApp(): AppShimApi {
  return APP_API;
}

/** `import { App } from '../app-shim'` — same call shape as antd's. */
export const App = { useApp };

/* ---------------------------------------------------------------- provider */

const BAIAppShimBridge: React.FC = () => {
  'use memo';
  const showToast = useToast();
  const alert = useImperativeAlertDialog();

  useEffect(() => {
    registerBridge({ showToast, alert });
    return () => registerBridge(null);
  }, [showToast, alert]);

  return <>{alert.element}</>;
};

/**
 * Mount once, at the app root, inside any theme provider. Owns Astryx's
 * `LayerProvider` (toast viewport + layer stacking) and the bridge component.
 */
export const BAIAppShimProvider: React.FC<{ children?: ReactNode }> = ({
  children,
}) => {
  'use memo';
  return (
    <LayerProvider>
      <BAIAppShimBridge />
      {children}
    </LayerProvider>
  );
};
