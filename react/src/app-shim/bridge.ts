/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — module-level bridge between antd's `App.useApp()`
 call-site contract and Astryx's *hook-only* imperative toast API.

 Astryx exposes `useToast()` as a React hook, so its `showToast` function only
 exists while some component is mounted. antd's contract lets ANY code call
 `message.error(...)` synchronously — including mutation `onError` callbacks
 and the static `import { message } from 'antd'` sites — with no hook in
 sight. Exactly one component (`<BAIAppProvider>`'s internal bridge mount)
 owns the real hook and registers it here; every `message.*` call routes
 through `withBridge`.

 Modal calls do NOT go through this bridge: they land in the modal task store
 (`modal.tsx`), which naturally holds tasks until `<AppShimModalHost>` mounts.

 Design source: cn-oss-removal answers/07-imperative-answer.md §4.
*/
import type { ShowToastFn } from '@astryxdesign/core/Toast';

export interface BridgeImpl {
  showToast: ShowToastFn;
}

let impl: BridgeImpl | null = null;

/** Calls that arrived before `<BAIAppProvider>` mounted. */
const pendingCalls: Array<(b: BridgeImpl) => void> = [];

export function registerBridge(next: BridgeImpl | null): void {
  impl = next;
  if (impl) {
    const queued = pendingCalls.splice(0);
    queued.forEach((fn) => fn(impl as BridgeImpl));
  }
}

export function withBridge(fn: (b: BridgeImpl) => void): void {
  if (impl) {
    fn(impl);
  } else {
    // antd is lenient here (console warning, no throw); queueing matches that
    // behaviour without dropping user-visible feedback fired during boot.
    pendingCalls.push(fn);
  }
}

/**
 * antd `AppProps['message']`-shaped global config, set by `<BAIAppProvider>`
 * (mirrors how antd's `<App message={{ duration }}>` seeds its message leg).
 */
export interface AppShimMessageConfig {
  /** Default auto-dismiss duration in SECONDS (antd semantics). */
  duration?: number;
}

/** antd's built-in default message duration (seconds). */
const ANTD_DEFAULT_MESSAGE_DURATION_S = 3;

let messageConfig: AppShimMessageConfig = {};

export function setMessageConfig(next: AppShimMessageConfig | undefined): void {
  messageConfig = next ?? {};
}

export function getDefaultMessageDurationS(): number {
  return messageConfig.duration ?? ANTD_DEFAULT_MESSAGE_DURATION_S;
}
