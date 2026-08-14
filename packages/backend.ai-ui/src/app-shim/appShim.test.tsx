/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — antd-semantics unit tests for the app-shim.
 The toast leg is tested against a fake bridge (registerBridge is the public
 seam); the modal leg is tested at the store/handle level. Full dialog
 interaction (ok/cancel button flows) is covered by the live browser
 verification recorded in the ticket.
*/
import {
  getDefaultMessageDurationS,
  registerBridge,
  setMessageConfig,
} from './bridge';
import { BAIAppProvider } from './index';
import { message } from './message';
import { modal } from './modal';
import type { ShowToastFn, ToastOptions } from '@astryxdesign/core/Toast';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface ShownToast {
  options: ToastOptions;
  dismiss: () => void;
}

function installFakeBridge() {
  const shown: ShownToast[] = [];
  const showToast: ShowToastFn = (options) => {
    const entry: ShownToast = {
      options,
      dismiss: vi.fn(() => options.onHide?.('manual')),
    };
    shown.push(entry);
    return entry.dismiss;
  };
  registerBridge({ showToast });
  return shown;
}

afterEach(() => {
  registerBridge(null);
  setMessageConfig(undefined);
});

describe('app-shim message', () => {
  it('maps the 4 antd kinds onto Astryx 2-way toast types', () => {
    const shown = installFakeBridge();
    message.success('a');
    message.info('b');
    message.warning('c');
    message.error('d');
    expect(shown.map((s) => s.options.type)).toEqual([
      'info',
      'info',
      'info',
      'error',
    ]);
  });

  it('applies antd duration semantics (seconds, default 3, 0 = sticky)', () => {
    const shown = installFakeBridge();
    message.success('default');
    message.success('long', 10);
    message.success('sticky', 0);
    expect(shown[0].options.isAutoHide).toBe(true);
    expect(shown[0].options.autoHideDuration).toBe(3000);
    expect(shown[1].options.autoHideDuration).toBe(10000);
    expect(shown[2].options.isAutoHide).toBe(false);
  });

  it('reads the provider-level default duration (antd <App message>)', () => {
    setMessageConfig({ duration: 4 });
    expect(getDefaultMessageDurationS()).toBe(4);
    const shown = installFakeBridge();
    message.error('x');
    expect(shown[0].options.autoHideDuration).toBe(4000);
  });

  it('supports the ArgsProps object form with onClose', () => {
    const shown = installFakeBridge();
    const onClose = vi.fn();
    message.success({ content: 'obj', duration: 2, onClose });
    expect(shown[0].options.autoHideDuration).toBe(2000);
    shown[0].options.onHide?.('auto');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('returns a close handle that is also thenable (MessageType)', async () => {
    const shown = installFakeBridge();
    const handle = message.info('closable');
    const settled = vi.fn();
    const chained = handle.then((v) => {
      settled(v);
      return 'chained';
    });
    expect(settled).not.toHaveBeenCalled();
    handle(); // manual close -> dismiss -> onHide('manual')
    expect(shown[0].dismiss).toHaveBeenCalledTimes(1);
    await expect(chained).resolves.toBe('chained');
    expect(settled).toHaveBeenCalledWith(true);
  });

  it('queues calls fired before the provider mounts, and drops ones already closed', async () => {
    const early = message.success('early');
    const closedEarly = message.success('closed-before-mount');
    closedEarly(); // close before any bridge exists
    await expect(closedEarly).resolves.toBe(true);

    const shown = installFakeBridge(); // mount -> flush queue
    expect(shown).toHaveLength(1);
    early();
    await expect(early).resolves.toBe(true);
  });

  it('keeps unsupported antd APIs loud instead of silently dropping', () => {
    expect(() => message.loading()).toThrow(/not implemented/);
    expect(() => message.destroy()).toThrow(/not implemented/);
  });
});

describe('app-shim top-layer re-entry (FR-3486)', () => {
  // jsdom lacks the Popover API and the `:modal` / `:popover-open` selectors,
  // so fixtures carry instance-level stand-ins. Never hoist them into a
  // setupTests prototype polyfill: the listener branches on the method's
  // ABSENCE, and a global polyfill would make that branch untestable.
  const fixtures: HTMLElement[] = [];

  function mountNotice({ isPopoverOpen = false, hasPopoverApi = true } = {}) {
    const el = document.createElement('div');
    el.setAttribute('popover', 'manual');
    el.setAttribute('data-bai-top-layer', '');
    el.matches = (selector: string) =>
      selector === ':popover-open' && isPopoverOpen;
    const calls: string[] = [];
    if (hasPopoverApi) {
      Object.assign(el, {
        showPopover: () => calls.push('show'),
        hidePopover: () => calls.push('hide'),
      });
    }
    document.body.appendChild(el);
    fixtures.push(el);
    return calls;
  }

  function dispatchToggle({
    tag = 'dialog',
    isModal = true,
    newState = 'open',
  } = {}) {
    const target = document.createElement(tag);
    target.matches = (selector: string) => selector === ':modal' && isModal;
    document.body.appendChild(target);
    fixtures.push(target);
    const event = new Event('toggle');
    Object.assign(event, { newState });
    target.dispatchEvent(event);
  }

  beforeEach(() => {
    render(<BAIAppProvider />);
  });

  afterEach(() => {
    fixtures.splice(0).forEach((el) => el.remove());
  });

  it('re-enters an open notice surface when a modal dialog opens', () => {
    const calls = mountNotice({ isPopoverOpen: true });
    dispatchToggle();
    expect(calls).toEqual(['hide', 'show']);
  });

  it('shows a not-yet-promoted notice without hiding it first', () => {
    const calls = mountNotice();
    dispatchToggle();
    expect(calls).toEqual(['show']);
  });

  it('skips a notice without the Popover API instead of throwing', () => {
    const bare = mountNotice({ isPopoverOpen: true, hasPopoverApi: false });
    const stubbed = mountNotice({ isPopoverOpen: true });
    dispatchToggle();
    expect(bare).toEqual([]);
    expect(stubbed).toEqual(['hide', 'show']);
  });

  it.each([
    { name: 'dialog close', options: { newState: 'closed' } },
    { name: 'a non-modal dialog', options: { isModal: false } },
    { name: 'a non-dialog toggle', options: { tag: 'div' } },
  ])('ignores $name', ({ options }) => {
    const calls = mountNotice({ isPopoverOpen: true });
    dispatchToggle(options);
    expect(calls).toEqual([]);
  });
});

describe('app-shim modal', () => {
  it('returns an antd-shaped handle: thenable + destroy + throwing update', async () => {
    const handle = modal.confirm({ title: 'T', content: 'C' });
    expect(typeof handle.destroy).toBe('function');
    expect(() => handle.update({})).toThrow(/not implemented/);
    handle.destroy();
    // destroy() resolves false without firing callbacks, so awaiting callers
    // are never left dangling.
    await expect(handle).resolves.toBe(false);
  });

  it('destroy() does not fire onOk/onCancel', () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();
    modal.error({ title: 'boom', onOk, onCancel }).destroy();
    expect(onOk).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('tracks concurrent tasks independently', async () => {
    const first = modal.confirm({ title: 'first' });
    const second = modal.info({ title: 'second' });
    first.destroy();
    await expect(first).resolves.toBe(false);
    // second is still pending — destroying first must not settle it.
    const secondSettled = vi.fn();
    void second.then(secondSettled);
    await Promise.resolve();
    expect(secondSettled).not.toHaveBeenCalled();
    second.destroy();
    await expect(second).resolves.toBe(false);
  });
});
