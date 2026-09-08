/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3722: `disabled` is `boolean | { reason }`, so a row action carries its
 reason inside the flag that disables it — the two cannot drift apart, and a
 silent disable is only reachable by writing `true` on purpose.
*/
import { buildBaiCustomTokens } from '../../theme/baiCustomTokens';
import BAINameActionCell from './BAINameActionCell';
import type { BAINameActionCellAction } from './BAINameActionCell';
import { Theme, defineTheme, useTheme } from '@astryxdesign/core/theme';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';

// jsdom reports every element as 0px wide, which would collapse each action
// into the overflow menu. Give the container room so the visible-button path
// is the one under test; the menu path gets its own case below.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: 800,
  });
});

// Astryx's base token values live in its CSS, which jsdom never loads, so
// `useTheme().token()` is empty unless a runtime theme defines the token.
// `--color-info` is a BUI custom token, declared the way the app theme does.
const testTheme = defineTheme({
  name: 'bai-nac-test',
  tokens: {
    ...buildBaiCustomTokens({ info: { light: '#028DF2', dark: '#028DF2' } }),
  },
});

const renderWithTheme = (ui: ReactElement) =>
  render(
    <Theme theme={testTheme} mode="light">
      {ui}
    </Theme>,
  );

const renderAction = (action: Partial<BAINameActionCellAction>) =>
  renderWithTheme(
    <BAINameActionCell
      title="row-name"
      showActions="always"
      actions={[{ key: 'act', title: 'Act', ...action }]}
    />,
  );

const actionButton = () => screen.getByRole('button', { name: /Act/ });

describe('BAINameActionCell — disabled carries its reason (FR-3722)', () => {
  it('a reason disables the action and becomes its tooltip', async () => {
    const onClick = vi.fn();
    renderAction({ disabled: { reason: 'Deployment is stopped' }, onClick });

    const button = actionButton();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('Deployment is stopped')).toBeInTheDocument();

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('no reason and no flag leaves the action enabled and clickable', async () => {
    const onClick = vi.fn();
    renderAction({ onClick });

    const button = actionButton();
    expect(button).not.toHaveAttribute('aria-disabled');
    expect(button).not.toBeDisabled();

    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a bare true disables without a reason and keeps the title as tooltip', async () => {
    const onClick = vi.fn();
    renderAction({ disabled: true, onClick });

    const button = actionButton();
    // The action title is still the tooltip, and Astryx keeps a
    // tooltip-carrying disabled button focusable via `aria-disabled`.
    expect(button).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled={false} leaves the action enabled', async () => {
    const onClick = vi.fn();
    renderAction({ disabled: false, onClick });

    const button = actionButton();
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a disabled action skips its popConfirm', async () => {
    const onConfirm = vi.fn();
    renderAction({
      disabled: { reason: 'Not allowed' },
      popConfirm: { title: 'Sure?', onConfirm },
    });

    await userEvent.click(actionButton(), { pointerEventsCheck: 0 });
    expect(screen.queryByText('Sure?')).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('the overflow-menu row folds the reason into its label and disables it', () => {
    renderAction({
      showInMenu: 'always',
      disabled: { reason: 'Not allowed' },
    });

    const item = screen.getByText('Act — Not allowed');
    expect(item).toBeInTheDocument();
    expect(item.closest('[aria-disabled="true"],[disabled]')).not.toBeNull();
  });
});

describe('BAINameActionCell — the overflow row keeps its action colour (FR-3721)', () => {
  const menuRow = () => screen.getByText('Act').closest('[role="menuitem"]');
  // `.bai-nac-menu-icon` is this component's own wrapper, so the tint is read
  // off our markup; `data-variant` is Astryx's documented theming attribute.
  // Returning the element (not `?.style.color`) keeps a missing wrapper a
  // failure instead of an `undefined` that satisfies a negated assertion.
  const menuIcon = () =>
    screen.getByTestId('act-icon').closest<HTMLElement>('.bai-nac-menu-icon');

  // The expected tint, read the same way the component reads it and put
  // through the same `style.color` normalisation the assertion compares.
  const expectedMenuIconTint = () => {
    let value = '';
    const Probe = () => {
      value = useTheme().token('--color-info');
      return null;
    };
    renderWithTheme(<Probe />);
    const probe = document.createElement('span');
    probe.style.color = value;
    return probe.style.color;
  };

  it('a danger action stays destructive once it overflows into the menu', () => {
    renderAction({
      showInMenu: 'always',
      type: 'danger',
      icon: <span data-testid="act-icon" />,
    });

    expect(menuRow()).toHaveAttribute('data-variant', 'destructive');
    // Astryx tints the whole destructive row, so the icon must not be
    // re-coloured on top of it.
    expect(menuIcon()).not.toBeNull();
    expect(menuIcon()?.style.color).toBe('');
  });

  it('a default action carries the info tint on its menu icon', () => {
    const expectedTint = expectedMenuIconTint();
    expect(expectedTint).not.toBe('');

    renderAction({
      showInMenu: 'always',
      icon: <span data-testid="act-icon" />,
    });

    expect(menuRow()).not.toHaveAttribute('data-variant', 'destructive');
    expect(menuIcon()).not.toBeNull();
    // A present wrapper carrying exactly the info token — dropping either the
    // wrapper or the colour fails here.
    expect(menuIcon()?.style.color).toBe(expectedTint);
  });
});
