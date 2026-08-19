/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The FR-3585 contract: a scrimmed drawer promotes nothing to the top layer, so
 a modal opened from inside it is reachable — and inerts the drawer instead of
 being inerted by it.

 NOTE: `setupTests` polyfills showModal/show/close, so a `showModal()` would NOT
 fail on its own — the two calls are spied on explicitly.
*/
import BAIDrawerAstryx from './BAIDrawerAstryx';
import BAIDrawerPortal from './BAIDrawerPortal';
import { Theme, defineTheme } from '@astryxdesign/core/theme';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BAIDialogPortal, BAI_MODAL_OPEN_ATTRIBUTE } from 'backend.ai-ui';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

const renderDrawer = (
  props: Partial<React.ComponentProps<typeof BAIDrawerPortal>> = {},
) => {
  const onClose = vi.fn();
  const result = render(
    <BAIDrawerPortal isOpen onClose={onClose} label="Details" {...props}>
      <button type="button">Inside</button>
    </BAIDrawerPortal>,
  );
  return { ...result, onClose };
};

const getRoot = () =>
  document.body.querySelector<HTMLElement>('.bai-drawer-portal');
const getMask = () =>
  document.querySelector<HTMLElement>(
    '.bai-drawer-portal__mask',
  ) as HTMLElement;

// A nested `<Theme>` is the app's admin/reverse region: a wrapper element the
// portal is not a descendant of.
const outerTheme = defineTheme({ name: 'drawer-outer', tokens: {} });
const innerTheme = defineTheme({ name: 'drawer-inner', tokens: {} });

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BAIDrawerPortal', () => {
  it('portals to document.body and opens the inner dialog with show()', () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const show = vi.spyOn(HTMLDialogElement.prototype, 'show');

    renderDrawer();

    const root = getRoot();
    expect(root?.parentElement).toBe(document.body);
    expect(root?.hasAttribute(BAI_MODAL_OPEN_ATTRIBUTE)).toBe(true);
    // `show()` is the whole fix: no top layer, so nothing outside is inerted.
    expect(show).toHaveBeenCalledTimes(1);
    expect(showModal).not.toHaveBeenCalled();
  });

  it('restores the modality lab drops with the scrim', () => {
    renderDrawer();

    expect(screen.getByRole('dialog', { name: 'Details' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(getMask()).not.toBeNull();
  });

  it('moves focus into the panel, which `show()` does not do', () => {
    renderDrawer();

    expect(getRoot()?.contains(document.activeElement)).toBe(true);
  });

  it('bypasses the portal entirely for a non-scrim drawer', () => {
    render(
      <BAIDrawerAstryx open hasScrim={false} title="Notifications">
        <span>notices</span>
      </BAIDrawerAstryx>,
    );

    expect(getRoot()).toBeNull();
    expect(document.querySelector(`[${BAI_MODAL_OPEN_ATTRIBUTE}]`)).toBeNull();
    expect(document.querySelector('dialog')?.open).toBe(true);
  });

  // The regression FR-3585 exists for: a `showModal()` drawer inerted the
  // portalled modal instead, leaving it unclickable and untabbable.
  it('lets a modal opened inside it take the level above and inert it', async () => {
    const user = userEvent.setup();
    const Nested: React.FC = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      return (
        <BAIDrawerPortal isOpen onClose={vi.fn()} label="Details">
          <button type="button" onClick={() => setIsModalOpen(true)}>
            Deploy
          </button>
          <BAIDialogPortal
            isOpen={isModalOpen}
            onOpenChange={vi.fn()}
            aria-label="deploy"
          >
            <button type="button">Confirm</button>
          </BAIDialogPortal>
        </BAIDrawerPortal>
      );
    };
    render(<Nested />);

    await user.click(screen.getByRole('button', { name: 'Deploy' }));

    const drawerRoot = getRoot() as HTMLElement;
    const modalRoot = document.querySelector<HTMLElement>(
      '.bai-dialog-portal',
    ) as HTMLElement;
    expect(drawerRoot.style.getPropertyValue('--bai-drawer-portal-level')).toBe(
      '0',
    );
    expect(modalRoot.style.getPropertyValue('--bai-dialog-portal-level')).toBe(
      '1',
    );
    expect(drawerRoot.hasAttribute('inert')).toBe(true);
    expect(modalRoot.hasAttribute('inert')).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Confirm' }).closest('[inert]'),
    ).toBeNull();
  });

  it('closes on a mask click, but not on a drag that started inside', () => {
    const { onClose } = renderDrawer();

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Inside' }));
    fireEvent.click(getMask());
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(getMask());
    fireEvent.click(getMask());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Hiding the root the moment `isOpen` flips would cut lab's slide-out off;
  // the root waits for the inner dialog's `close`, which lab delays by 250ms.
  it('keeps the root rendered until lab closes the inner dialog', () => {
    vi.useFakeTimers();
    const drawer = (isOpen: boolean) => (
      <BAIDrawerPortal isOpen={isOpen} onClose={vi.fn()} label="Details">
        <button type="button">Inside</button>
      </BAIDrawerPortal>
    );
    const { rerender } = render(drawer(true));

    rerender(drawer(false));
    expect(getRoot()?.className).toContain('bai-drawer-portal--closed');
    expect(getRoot()?.hasAttribute('data-bai-drawer-hidden')).toBe(false);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(getRoot()?.hasAttribute('data-bai-drawer-hidden')).toBe(true);
    vi.useRealTimers();
  });

  it('keeps children mounted but unmarked while closed', () => {
    renderDrawer({ isOpen: false });

    expect(getRoot()?.hasAttribute(BAI_MODAL_OPEN_ATTRIBUTE)).toBe(false);
    expect(getRoot()?.hasAttribute('data-bai-drawer-hidden')).toBe(true);
    expect(screen.getByText('Inside')).toBeInTheDocument();
  });

  it('re-emits the nearest theme name so @scope’d theme CSS reaches the portal', () => {
    render(
      <Theme theme={outerTheme} mode="light">
        <Theme theme={innerTheme} mode="light">
          <BAIDrawerPortal isOpen onClose={vi.fn()} label="Details">
            <span>body</span>
          </BAIDrawerPortal>
        </Theme>
      </Theme>,
    );

    expect(getRoot()?.getAttribute('data-astryx-theme')).toBe(innerTheme.name);
  });
});
