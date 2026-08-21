/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIDialog` — the contract T5/T6 build on: no native `<dialog>` (so
 nothing is inert), the `.astryx-dialog` surface, the `getByRole('dialog',
 {name})` wiring every e2e spec uses, and purpose-gated dismissal.

 NOTE: `setupTests` polyfills `showModal`/`close`, so an accidental native
 `<dialog>` would NOT fail on its own — the tag is asserted explicitly.
*/
import { BAI_Z_INDEX } from '../styles/zIndexLadder';
import BAIDialog from './BAIDialog';
import { DialogHeader } from '@astryxdesign/core/Dialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { Theme, defineTheme } from '@astryxdesign/core/theme';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

const renderPortal = (
  props: Partial<React.ComponentProps<typeof BAIDialog>> = {},
) => {
  const onOpenChange = vi.fn();
  const result = render(
    <BAIDialog isOpen onOpenChange={onOpenChange} {...props}>
      <Layout
        header={<DialogHeader title="Portal title" />}
        content={
          <LayoutContent>
            <button type="button">Inside</button>
          </LayoutContent>
        }
      />
    </BAIDialog>,
  );
  return { ...result, onOpenChange };
};

// A nested `<Theme>` is the app's admin/reverse region: a wrapper element the
// portal is not a descendant of.
const outerTheme = defineTheme({ name: 'portal-outer', tokens: {} });
const innerTheme = defineTheme({ name: 'portal-inner', tokens: {} });

const getMask = () =>
  document.querySelector('.bai-dialog__mask') as HTMLElement;

const getSurface = () =>
  screen
    .getByRole('dialog')
    .querySelector('.astryx-dialog') as HTMLElement | null;

const dialogRoot = (name?: string) =>
  (name == null
    ? document.querySelector('.bai-dialog')
    : screen
        .getByRole('dialog', { name })
        .closest('.bai-dialog')) as HTMLElement;

const zOf = (root: HTMLElement) =>
  Number(root.style.getPropertyValue('--bai-dialog-z'));

// jsdom treats `inert` as inert markup only. The spec's blur-what-is-inside is
// the half the level stack's focus restore has to survive, so model just that.
const blurOnInert = (root: HTMLElement) => {
  const toggleAttribute = root.toggleAttribute.bind(root);
  vi.spyOn(root, 'toggleAttribute').mockImplementation((name, force) => {
    const result = toggleAttribute(name, force);
    if (name !== 'inert' || !root.hasAttribute('inert')) {
      return result;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement && root.contains(active)) {
      active.blur();
    }
    return result;
  });
};

describe('BAIDialog', () => {
  it('portals to document.body without a native <dialog>', () => {
    renderPortal();

    const root = document.body.querySelector('.bai-dialog');
    expect(root).not.toBeNull();
    expect(root?.parentElement).toBe(document.body);
    expect(document.querySelector('dialog')).toBeNull();
    expect(root?.hasAttribute('data-bai-modal-open')).toBe(true);
  });

  // FR-3578 exists because `showModal()` made the whole document inert. Keeping
  // the page reachable is therefore a DELIBERATE non-feature, and the obvious
  // way to restore the a11y containment the native element gave — `inert` or
  // `aria-hidden` on the app root — would undo the ticket. This fails if anyone
  // adds it. (Whether the notice is actually *clickable* is a hit-test the mask
  // and the ladder decide; jsdom does neither, so it is measured live.)
  it('claims nothing outside the modal is unavailable while open', () => {
    render(
      <div id="app-root">
        <button type="button">Behind</button>
        <BAIDialog isOpen onOpenChange={vi.fn()} aria-label="modal">
          <Layout content={<LayoutContent>body</LayoutContent>} />
        </BAIDialog>
      </div>,
    );

    const appRoot = document.getElementById('app-root') as HTMLElement;
    expect(appRoot.hasAttribute('inert')).toBe(false);
    expect(appRoot.getAttribute('aria-hidden')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Behind' }).closest('[inert]'),
    ).toBeNull();
    // The covered-modal sync is the ONLY thing allowed to set `inert`, and only
    // on a portal root — never on a page container.
    expect(document.querySelectorAll('[inert]')).toHaveLength(0);
    // `aria-modal` would tell assistive tech the opposite of all of the above.
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-modal');
  });

  it('names itself from the DialogHeader title', () => {
    renderPortal();

    expect(screen.getByRole('dialog')).toHaveAccessibleName('Portal title');
  });

  it('keeps the .astryx-dialog surface the brand theme keys off', () => {
    renderPortal();

    expect(getSurface()).not.toBeNull();
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
      document.body.querySelectorAll<HTMLElement>('.bai-dialog'),
    );
    expect(roots).toHaveLength(2);
    expect(
      roots.map((root) =>
        Number(root.style.getPropertyValue('--bai-dialog-level')),
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
        <BAIDialog isOpen onOpenChange={vi.fn()} aria-label="outer">
          <button type="button" onClick={() => setIsInnerOpen(true)}>
            open inner
          </button>
          <button type="button">outer-b</button>
          <BAIDialog
            isOpen={isInnerOpen}
            onOpenChange={vi.fn()}
            aria-label="inner"
          >
            <button type="button">inner-a</button>
            <button type="button">inner-b</button>
          </BAIDialog>
        </BAIDialog>
      );
    };
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'open inner' }));
    expect(
      Number(dialogRoot('inner').style.getPropertyValue('--bai-dialog-level')),
    ).toBe(1);

    screen.getByRole('button', { name: 'inner-a' }).focus();
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'inner-b' }),
    );
  });

  // The prop reaches the stack; `dialogLevelStack.test.ts` owns what it
  // resolves to.
  it('honours an explicit zIndex override', () => {
    renderPortal({ zIndex: 10001 });
    expect(zOf(dialogRoot())).toBe(10001);
  });

  // A stale number below the band would render the modal invisible.
  it('floors an override below the modal band base', () => {
    renderPortal({ zIndex: 1002 });
    expect(zOf(dialogRoot())).toBe(BAI_Z_INDEX.modalBase);
  });

  it('paints a dialog opened later above an earlier zIndex override', async () => {
    const user = userEvent.setup();
    const Pair: React.FC = () => {
      const [isSecondOpen, setIsSecondOpen] = useState(false);
      return (
        <>
          <BAIDialog
            isOpen
            onOpenChange={vi.fn()}
            aria-label="first"
            zIndex={10001}
          >
            <button type="button" onClick={() => setIsSecondOpen(true)}>
              open second
            </button>
          </BAIDialog>
          <BAIDialog
            isOpen={isSecondOpen}
            onOpenChange={vi.fn()}
            aria-label="second"
          />
        </>
      );
    };
    render(<Pair />);
    await user.click(screen.getByRole('button', { name: 'open second' }));

    const first = dialogRoot('first');
    const second = dialogRoot('second');

    expect(zOf(second)).toBeGreaterThan(zOf(first));
    expect(first.hasAttribute('inert')).toBe(true);
    expect(second.hasAttribute('inert')).toBe(false);
  });

  // Astryx's restore snapshots in a passive effect, after the covering root
  // went `inert` — it captures `<body>` and closing lands focus nowhere.
  it('restores focus to the trigger inside the dialog that opened it', async () => {
    const user = userEvent.setup();
    const Nested: React.FC = () => {
      const [isInnerOpen, setIsInnerOpen] = useState(false);
      return (
        <BAIDialog isOpen onOpenChange={vi.fn()} aria-label="outer">
          <button type="button" onClick={() => setIsInnerOpen(true)}>
            open inner
          </button>
          <BAIDialog
            isOpen={isInnerOpen}
            onOpenChange={() => setIsInnerOpen(false)}
            aria-label="inner"
          >
            <button type="button">inner-a</button>
          </BAIDialog>
        </BAIDialog>
      );
    };
    render(<Nested />);
    blurOnInert(dialogRoot('outer'));

    const trigger = screen.getByRole('button', { name: 'open inner' });
    await user.click(trigger);
    expect(document.activeElement).not.toBe(trigger);

    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(trigger);
  });

  it('keeps children mounted but unnamed while closed', () => {
    renderPortal({ isOpen: false });

    const root = document.body.querySelector('.bai-dialog');
    expect(root?.className).toContain('bai-dialog--closed');
    expect(root?.hasAttribute('data-bai-modal-open')).toBe(false);
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('re-emits the nearest theme name so @scope’d theme CSS reaches the portal', () => {
    render(
      <Theme theme={outerTheme} mode="light">
        <Theme theme={innerTheme} mode="light">
          <BAIDialog isOpen onOpenChange={vi.fn()} aria-label="modal">
            <Layout content={<LayoutContent>body</LayoutContent>} />
          </BAIDialog>
        </Theme>
      </Theme>,
    );

    expect(
      document.querySelector('.bai-dialog')?.getAttribute('data-astryx-theme'),
    ).toBe(innerTheme.name);
  });

  it('omits the theme attribute when no Theme is in scope', () => {
    renderPortal();

    expect(
      document.querySelector('.bai-dialog')?.hasAttribute('data-astryx-theme'),
    ).toBe(false);
  });

  it('places a positioned dialog with logical inline offsets', () => {
    renderPortal({ position: { bottom: 0, end: 16 } });

    const wrap = screen.getByRole('dialog');
    expect(wrap.className).toContain('bai-dialog__wrap--positioned');
    expect(wrap.style.insetInlineEnd).toBe('16px');
    expect(wrap.style.insetInlineStart).toBe('auto');
    expect(wrap.style.bottom).toBe('0px');
    expect(wrap.style.top).toBe('auto');
  });

  it('sizes the wrap and lets the dialog surface fill it', () => {
    renderPortal({ width: '90%' });

    expect(screen.getByRole('dialog').style.width).toBe('90%');
    expect(getSurface()?.style.getPropertyValue('--x-width')).toBe('100%');
  });

  it('leaves a fullscreen dialog to size itself from the viewport', () => {
    renderPortal({ variant: 'fullscreen', width: '90%' });

    expect(screen.getByRole('dialog').style.width).toBe('');
  });
});
