/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 `BAIAlertDialog` — the contract the app-shim's plain-text `confirm` rides on:
 portalled like `BAIDialog`, `role="alertdialog"` carrying BOTH its name and
 its description, Escape-only dismissal, and one shared level stack.

 NOTE: `setupTests` polyfills `showModal`/`close`, so an accidental native
 `<dialog>` would NOT fail on its own — the tag is asserted explicitly.
*/
import BAIAlertDialog from './BAIAlertDialog';
import BAIDialog from './BAIDialog';
import { Layout, LayoutContent } from '@astryxdesign/core/Layout';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const renderAlert = (
  props: Partial<React.ComponentProps<typeof BAIAlertDialog>> = {},
) => {
  const onOpenChange = vi.fn();
  const onAction = vi.fn();
  const result = render(
    <BAIAlertDialog
      isOpen
      onOpenChange={onOpenChange}
      onAction={onAction}
      title="Delete session?"
      description="This action cannot be undone."
      actionLabel="Delete"
      {...props}
    />,
  );
  return { ...result, onOpenChange, onAction };
};

const getMask = () =>
  document.querySelector('.bai-dialog__mask') as HTMLElement;

const levelOf = (root: Element | null | undefined) =>
  Number((root as HTMLElement).style.getPropertyValue('--bai-dialog-level'));

describe('BAIAlertDialog', () => {
  it('portals to document.body without a native <dialog>', () => {
    renderAlert();

    const root = document.body.querySelector('.bai-dialog');
    expect(root?.parentElement).toBe(document.body);
    expect(document.querySelector('dialog')).toBeNull();
    expect(root?.hasAttribute('data-bai-modal-open')).toBe(true);
  });

  // Astryx `AlertDialog`'s only off-top-layer path renders `role="group"`, so
  // the role is the first thing a wrapper loses by accident.
  it('exposes role="alertdialog" with an accessible name and description', () => {
    renderAlert();

    const alert = screen.getByRole('alertdialog');
    expect(alert).toHaveAccessibleName('Delete session?');
    expect(alert).toHaveAccessibleDescription('This action cannot be undone.');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('preselects the least destructive choice', () => {
    renderAlert();

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Cancel' }),
    );
  });

  it.each([
    { label: 'Escape', cancels: true },
    { label: 'a backdrop click', cancels: false },
  ])('$label cancels: $cancels', async ({ label, cancels }) => {
    const user = userEvent.setup();
    const { onOpenChange } = renderAlert();

    if (label === 'Escape') {
      await user.keyboard('{Escape}');
    } else {
      await user.click(getMask());
    }

    expect(onOpenChange).toHaveBeenCalledTimes(cancels ? 1 : 0);
    if (cancels) {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    }
  });

  it('cancels from the cancel button', async () => {
    const user = userEvent.setup();
    const { onOpenChange, onAction } = renderAlert();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onAction).not.toHaveBeenCalled();
  });

  // Astryx's contract: the action does NOT auto-close, the caller decides.
  it('runs the action without closing itself', async () => {
    const user = userEvent.setup();
    const { onOpenChange, onAction } = renderAlert();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('honours a caller-supplied cancel label', () => {
    renderAlert({ cancelLabel: 'Keep it' });

    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
  });

  // Both surfaces have to claim from the SAME registry, or a confirm raised
  // from inside a dialog neither paints above it nor inerts it.
  it('stacks above an open BAIDialog and inerts it', () => {
    render(
      <>
        <BAIDialog isOpen onOpenChange={vi.fn()} aria-label="base">
          <Layout content={<LayoutContent>base body</LayoutContent>} />
        </BAIDialog>
        <BAIAlertDialog
          isOpen
          onOpenChange={vi.fn()}
          onAction={vi.fn()}
          title="Delete session?"
          description="This action cannot be undone."
          actionLabel="Delete"
        />
      </>,
    );

    const baseRoot = screen
      .getByRole('dialog', { name: 'base' })
      .closest('.bai-dialog');
    const alertRoot = screen.getByRole('alertdialog').closest('.bai-dialog');

    expect(levelOf(baseRoot)).toBe(0);
    expect(levelOf(alertRoot)).toBe(1);
    expect(baseRoot?.hasAttribute('inert')).toBe(true);
    expect(alertRoot?.hasAttribute('inert')).toBe(false);
  });

  it('forwards a zIndex override to the portal root', () => {
    renderAlert({ zIndex: 10001 });

    expect(
      screen
        .getByRole('alertdialog')
        .closest<HTMLElement>('.bai-dialog')
        ?.style.getPropertyValue('--bai-dialog-z'),
    ).toBe('10001');
  });
});
