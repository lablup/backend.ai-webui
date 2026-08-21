/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
// jest-dom adds custom matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '../__test__/matchMedia.mock.cjs';
import '@testing-library/jest-dom';
// Expose `vi` under the global name `jest` so `@testing-library/dom`'s
// `waitFor` detects "Jest fake timers are active" and switches to its
// timer-aware polling path. Without this, tests that combine
// `vi.useFakeTimers()` with `await waitFor(...)` hang — waitFor's default
// polling uses `setTimeout`, which never fires under faked timers.
// (None of our test code references `jest.*` directly anymore; this is
// purely a `@testing-library/dom` integration hook.)
import { configure } from '@testing-library/react';
import { vi } from 'vitest';

(globalThis as any).jest = vi;

// `waitFor`'s 1000ms default leaves almost no headroom: the ADR-0001
// project-prop-contract tests (`DeploymentSettingModal`, `FolderCreateModalV2`)
// measure 621–787ms on an idle 8-core dev box and 1502ms on a CI runner, where
// they intermittently failed with `expected [] to have a length of 1` — the
// Relay mutation had simply not been dispatched inside the window. Raising the
// budget cannot mask a real defect: a mutation that never fires still fails,
// just 5s later. `testTimeout` in vitest.config.ts is raised past this so the
// assertion's own diff surfaces instead of a bare test timeout. FR-3617.
configure({ asyncUtilTimeout: 5000 });

// jsdom implements `<dialog>` as an element but not its modal API; Astryx
// `Dialog` and the lab `Drawer` call showModal/show/close the moment they mount.
// Mirrors `packages/backend.ai-ui/setupTests.ts` — keep the two in step.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & {
    showModal?: () => void;
    show?: () => void;
    close?: (returnValue?: string) => void;
  };
  if (typeof proto.showModal !== 'function') {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (typeof proto.show !== 'function') {
    proto.show = function show(this: HTMLDialogElement) {
      this.open = true;
    };
  }
  if (typeof proto.close !== 'function') {
    proto.close = function close(
      this: HTMLDialogElement,
      returnValue?: string,
    ) {
      this.open = false;
      if (returnValue !== undefined) {
        this.returnValue = returnValue;
      }
      this.dispatchEvent(new Event('close'));
    };
  }
}

// Polyfill fetch for jsdom environment
if (typeof global.fetch === 'undefined') {
  global.fetch = () =>
    Promise.resolve({
      json: () => Promise.resolve({}),
      text: () => Promise.resolve(''),
      ok: true,
      status: 200,
    } as Response);
}
