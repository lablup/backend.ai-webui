/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 PILOT (cn-oss-removal / ticket 10) — module-level bridge between antd's
 `App.useApp()` call-site contract and Astryx's *hook-only* imperative APIs.

 Astryx exposes `useToast()` / `useImperativeAlertDialog()` as React hooks, so
 their functions only exist while some component is mounted. antd's contract
 lets ANY code call `message.error(...)` synchronously — including mutation
 `onError` callbacks and the static `import { message } from 'antd'` sites.

 Exactly one component (`<BAIAppShimBridge>`, mounted by
 `<BAIAppShimProvider>`) owns the real hooks and registers them here.

 Design source: answers/07-imperative-answer.md §4. This is the MINIMAL subset
 the pilot page needs (message.{success,error,warning,info} + modal.confirm),
 not the full ~450 LOC shim.
*/
import type { ImperativeAlertDialogReturn } from '@astryxdesign/core/AlertDialog';
import type { ShowToastFn } from '@astryxdesign/core/Toast';

export interface BridgeImpl {
  showToast: ShowToastFn;
  alert: ImperativeAlertDialogReturn;
}

let impl: BridgeImpl | null = null;

/** Calls that arrived before `<BAIAppShimProvider>` mounted. */
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
    // behaviour without dropping the user-visible feedback.
    pendingCalls.push(fn);
  }
}
