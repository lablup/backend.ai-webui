/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDialogPortal` — the contract T5/T6 build on: no native `<dialog>` (so
 nothing is inert), the `.astryx-dialog` surface, the `getByRole('dialog',
 {name})` wiring every e2e spec uses, and purpose-gated dismissal.

 NOTE: `setupTests` polyfills `showModal`/`close`, so an accidental native
 `<dialog>` would NOT fail on its own — the tag is asserted explicitly.
*/
import { BAI_Z_INDEX } from '../styles/zIndexLadder';
import BAIDialogPortal from './BAIDialogPortal';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Theme, defineTheme } from '@astryxdesign/core/theme';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const renderPortal = (
  props: Partial<React.ComponentProps<typeof BAIDialogPortal>> = {},
) => {
  const onOpenChange = vi.fn();
  const result = render(
    <BAIDialogPortal isOpen onOpenChange={onOpenChange} {...props}>
      <Layout
        header={<DialogHeader title="Portal title" />}
        content={
          <LayoutContent>
            <button type="button">Inside</button>
          </LayoutContent>
        }
      />
    </BAIDialogPortal>,
  );
  return { ...result, onOpenChange };
};

// A nested `<Theme>` is the app's admin/reverse region: a wrapper element the
// portal is not a descendant of.
const outerTheme = defineTheme({ name: 'portal-outer', tokens: {} });
const innerTheme = defineTheme({ name: 'portal-inner', tokens: {} });

const getMask = () =>
  document.querySelector('.bai-dialog-portal__mask') as HTMLElement;

describe('BAIDialogPortal', () => {
  it('portals to document.body without a native <dialog>', () => {
    renderPortal();

    const root = document.body.querySelector('.bai-dialog-portal');
    expect(root).not.toBeNull();
    expect(root?.parentElement).toBe(document.body);
    expect(document.querySelector('dialog')).toBeNull();
    expect(root?.hasAttribute('data-bai-modal-open')).toBe(true);
  });

  // The point of FR-3578: an open modal marks nothing outside itself inert, so a
  // surface stacked ABOVE the mask stays operable. jsdom does no hit-testing, so
  // this can only assert the inertness half — the mask half is a z-index question
  // the ladder owns, and the click itself is measured live (see the PR).
  it('leaves a surface above the mask operable while open', async () => {
    const user = userEvent.setup();
    const onNotice = vi.fn();
    render(
      <>
        <div className="bai-notification-stack">
          <button type="button" onClick={onNotice}>
            Dismiss
          </button>
        </div>
        <BAIDialogPortal isOpen onOpenChange={vi.fn()} aria-label="modal">
          <Layout content={<LayoutContent>body</LayoutContent>} />
        </BAIDialogPortal>
      </>,
    );

    const notice = screen.getByRole('button', { name: 'Dismiss' });
    expect(notice.closest('[inert]')).toBeNull();
    await user.click(notice);
    expect(onNotice).toHaveBeenCalledTimes(1);
  });

  it('names itself from the DialogHeader title', () => {
    renderPortal();

    const dialog = screen.getByRole('dialog', { name: 'Portal title' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('keeps the .astryx-dialog surface the brand theme keys off', () => {
    renderPortal();

    const surface = screen
      .getByRole('dialog')
      .querySelector('.astryx-dialog') as HTMLElement | null;
    expect(surface).not.toBeNull();
  });

  it('uses role="alertdialog" for a required dialog', () => {
    renderPortal({ purpose: 'required' });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  // The app-shim's confirm needs alertdialog + Escape, which no `purpose` gives.
  it('lets a consumer-passed role beat the purpose-derived one', () => {
    renderPortal({ purpose: 'form', role: 'alertdialog' });
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it.each([
    { purpose: 'info', dismisses: true },
    { purpose: 'form', dismisses: false },
  ] as const)(
    'mask click dismisses a $purpose dialog: $dismisses',
    async ({ purpose, dismisses }) => {
      const user = userEvent.setup();
      const { onOpenChange } = renderPortal({ purpose });

      await user.click(getMask());

      expect(onOpenChange).toHaveBeenCalledTimes(dismisses ? 1 : 0);
    },
  );

  it.each([
    { purpose: 'form', closes: true },
    { purpose: 'required', closes: false },
  ] as const)(
    'Escape closes a $purpose dialog: $closes',
    async ({ purpose, closes }) => {
      const user = userEvent.setup();
      const { onOpenChange } = renderPortal({ purpose });

      await user.keyboard('{Escape}');

      expect(onOpenChange).toHaveBeenCalledTimes(closes ? 1 : 0);
    },
  );

  it('keeps a drag that started inside the dialog from dismissing it', () => {
    const { onOpenChange } = renderPortal();

    fireEvent.mouseDown(screen.getByRole('dialog'));
    fireEvent.click(getMask());

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('restores focus to the trigger when it closes', () => {
    const trigger = document.createElement('button');
    document.body.appendChild(trigger);
    trigger.focus();

    const view = renderPortal();
    expect(document.activeElement).not.toBe(trigger);

    view.unmount();
    expect(document.activeElement).toBe(trigger);
    trigger.remove();
  });

  it('stacks dialogs from level 0 upward', () => {
    const first = renderPortal();
    const second = renderPortal();

    const roots = Array.from(
      document.body.querySelectorAll<HTMLElement>('.bai-dialog-portal'),
    );
    expect(roots).toHaveLength(2);
    expect(
      roots.map((root) =>
        Number(root.style.getPropertyValue('--bai-dialog-portal-level')),
      ),
    ).toEqual([0, 1]);

    second.unmount();
    first.unmount();
  });

  // Without the covered-dialog inert sync this Tab landed on `outer-b`: the
  // parent trap redirects focus leaving its container, and the child is outside.
  it('keeps Tab inside a dialog opened on top of another', async () => {
    const user = userEvent.setup();
    const Nested: React.FC = () => {
      const [isInnerOpen, setIsInnerOpen] = useState(false);
      return (
        <BAIDialogPortal isOpen onOpenChange={vi.fn()} aria-label="outer">
          <button type="button" onClick={() => setIsInnerOpen(true)}>
            open inner
          </button>
          <button type="button">outer-b</button>
          <BAIDialogPortal
            isOpen={isInnerOpen}
            onOpenChange={vi.fn()}
            aria-label="inner"
          >
            <button type="button">inner-a</button>
            <button type="button">inner-b</button>
          </BAIDialogPortal>
        </BAIDialogPortal>
      );
    };
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'open inner' }));
    const inner = screen.getByRole('dialog', { name: 'inner' });
    expect(
      Number(
        inner
          .closest<HTMLElement>('.bai-dialog-portal')
          ?.style.getPropertyValue('--bai-dialog-portal-level'),
      ),
    ).toBe(1);

    screen.getByRole('button', { name: 'inner-a' }).focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'inner-b' }),
    );
  });

  // Overrides the same custom property the level feeds, so there is one channel
  // deciding the root's z-index rather than two.
  it('honours an explicit zIndex override', () => {
    renderPortal({ zIndex: 10001 });
    expect(
      document
        .querySelector<HTMLElement>('.bai-dialog-portal')
        ?.style.getPropertyValue('--bai-dialog-portal-z'),
    ).toBe('10001');
  });

  // A stale number below the band would render the modal invisible.
  it('floors an override below the modal band base', () => {
    renderPortal({ zIndex: 1002 });
    expect(
      document
        .querySelector<HTMLElement>('.bai-dialog-portal')
        ?.style.getPropertyValue('--bai-dialog-portal-z'),
    ).toBe(String(BAI_Z_INDEX.modalBase));
  });

  it('keeps children mounted but unnamed while closed', () => {
    renderPortal({ isOpen: false });

    const root = document.body.querySelector('.bai-dialog-portal');
    expect(root?.className).toContain('bai-dialog-portal--closed');
    expect(root?.hasAttribute('data-bai-modal-open')).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('re-emits the nearest theme name so @scope’d theme CSS reaches the portal', () => {
    render(
      <Theme theme={outerTheme} mode="light">
        <Theme theme={innerTheme} mode="light">
          <BAIDialogPortal isOpen onOpenChange={vi.fn()} aria-label="modal">
            <Layout content={<LayoutContent>body</LayoutContent>} />
          </BAIDialogPortal>
        </Theme>
      </Theme>,
    );

    expect(
      document
        .querySelector('.bai-dialog-portal')
        ?.getAttribute('data-astryx-theme'),
    ).toBe(innerTheme.name);
  });

  it('omits the theme attribute when no Theme is in scope', () => {
    renderPortal();

    expect(
      document
        .querySelector('.bai-dialog-portal')
        ?.hasAttribute('data-astryx-theme'),
    ).toBe(false);
  });

  it('places a positioned dialog with logical inline offsets', () => {
    renderPortal({ position: { bottom: 0, end: 16 } });

    const wrap = screen.getByRole('dialog');
    expect(wrap.className).toContain('bai-dialog-portal__wrap--positioned');
    expect(wrap.style.insetInlineEnd).toBe('16px');
    expect(wrap.style.insetInlineStart).toBe('auto');
    expect(wrap.style.bottom).toBe('0px');
    expect(wrap.style.top).toBe('auto');
  });
});
