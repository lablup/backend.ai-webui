/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 to-astryx ticket 04 — antd-semantics unit tests for the app-shim.
 The toast leg is tested against a fake bridge (registerBridge is the public
 seam); the modal leg is tested at the store/handle level, plus the two host
 renders FR-3578 turned into contracts (alertdialog + Escape, zIndex forward).
 The ok/cancel button flows live in `destructiveConfirmFlow.test.tsx`.
*/
import {
  getDefaultMessageDurationS,
  registerBridge,
  setMessageConfig,
} from './bridge';
import { BAIAppProvider } from './index';
import { message } from './message';
import { AppShimModalHost, modal } from './modal';
import { MODAL_LIVE_ATTRIBUTE } from '@lablup/ui-common/Modal';
import type { ShowToastFn, ToastOptions } from '@lablup/ui-common/Toast';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

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

  // `purpose="required"` would buy the role by disabling Escape, which antd's
  // confirm does not do — so the role is passed explicitly alongside `form`.
  it('gives a plain-text confirm alertdialog semantics AND Escape', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const handle = modal.confirm({ title: 'T', content: 'C', onCancel });
    render(<AppShimModalHost />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
    await expect(handle).resolves.toBe(false);
  });

  it('honours keyboard/maskClosable/closable=false: only onOk closes it', async () => {
    const user = userEvent.setup();
    const onOk = vi.fn();
    const onCancel = vi.fn();
    const handle = modal.info({
      title: 'Re-login required',
      content: <p>Main key changed</p>,
      okText: 'Confirm',
      closable: false,
      maskClosable: false,
      keyboard: false,
      onOk,
      onCancel,
    });
    render(<AppShimModalHost />);

    await user.keyboard('{Escape}');
    await user.click(
      document.querySelector<HTMLElement>('.uic-modal__mask') as HTMLElement,
    );
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByText('Main key changed')).toBeInTheDocument();
    expect(screen.getAllByRole('button').map((b) => b.textContent)).toEqual([
      'Confirm',
    ]);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onOk).toHaveBeenCalledTimes(1);
    await expect(handle).resolves.toBe(true);
  });

  it('closes on the backdrop when maskClosable is true', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const handle = modal.info({ title: 'T', maskClosable: true, onCancel });
    render(<AppShimModalHost />);

    await user.click(
      document.querySelector<HTMLElement>('.uic-modal__mask') as HTMLElement,
    );
    expect(onCancel).toHaveBeenCalledTimes(1);
    await expect(handle).resolves.toBe(false);
  });

  it('keyboard=false blocks Escape on a plain-text confirm too', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const handle = modal.confirm({
      title: 'T',
      content: 'C',
      keyboard: false,
      onCancel,
    });
    render(<AppShimModalHost />);

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(onCancel).not.toHaveBeenCalled();
    handle.destroy();
  });

  it('labels the ok button with the translated Confirm default on both shapes', () => {
    const alert = modal.confirm({ title: 'T', content: 'C' });
    const dialog = modal.info({ title: 'T', content: <p>C</p> });
    render(<AppShimModalHost />);

    expect(screen.getAllByRole('button', { name: 'Confirm' })).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'OK' })).toBeNull();
    alert.destroy();
    dialog.destroy();
  });

  // The escape hatch for a surface the ladder does not cover; values below the
  // band base are floored instead (see ui-common's modalStack tests).
  it('forwards zIndex to the portal root', () => {
    const handle = modal.confirm({ title: 'T', content: 'C', zIndex: 10001 });
    render(<AppShimModalHost />);

    expect(
      screen
        .getByRole('alertdialog')
        .closest<HTMLElement>('.uic-modal')
        ?.style.getPropertyValue('--modal-z'),
    ).toBe('10001');
    handle.destroy();
  });
});

describe('app-shim toast viewport', () => {
  // ui-common's Modal inerts every body child without a modal root or a
  // `data-uic-modal-live` mark; the toast viewport has to carry the mark.
  it('stays out of the inert background while a modal is open', () => {
    const { container } = render(
      <BAIAppProvider>
        <button type="button">page</button>
      </BAIAppProvider>,
    );
    const viewport = container.querySelector('[popover]');
    expect(viewport).toHaveAttribute(MODAL_LIVE_ATTRIBUTE);

    let handle: ReturnType<typeof modal.confirm> | undefined;
    act(() => {
      handle = modal.confirm({ title: 'T', content: 'C' });
    });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    expect(viewport).not.toHaveAttribute('inert');
    expect(screen.getByRole('button', { name: 'page' })).toHaveAttribute(
      'inert',
    );
    act(() => handle?.destroy());
  });
});
