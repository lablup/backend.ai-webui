/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 FR-3722: `disabled` defaults to `!!disabledReason`, so a row action cannot end
 up disabled-but-silent because a call site let the two fields drift apart.
*/
import BAINameActionCell from './BAINameActionCell';
import type { BAINameActionCellAction } from './BAINameActionCell';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// jsdom reports every element as 0px wide, which would collapse each action
// into the overflow menu. Give the container room so the visible-button path
// is the one under test; the menu path gets its own case below.
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: 800,
  });
});

const renderAction = (action: Partial<BAINameActionCellAction>) =>
  render(
    <BAINameActionCell
      title="row-name"
      showActions="always"
      actions={[{ key: 'act', title: 'Act', ...action }]}
    />,
  );

const actionButton = () => screen.getByRole('button', { name: /Act/ });

describe('BAINameActionCell — disabled derives from disabledReason (FR-3722)', () => {
  it('a reason alone disables the action and becomes its tooltip', async () => {
    const onClick = vi.fn();
    renderAction({ disabledReason: 'Deployment is stopped', onClick });

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

  it('an explicit disabled flag still wins over the absent reason', async () => {
    const onClick = vi.fn();
    renderAction({ disabled: true, onClick });

    await userEvent.click(actionButton(), { pointerEventsCheck: 0 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('explicit disabled={false} overrides a stray reason', async () => {
    const onClick = vi.fn();
    renderAction({ disabled: false, disabledReason: 'stale reason', onClick });

    const button = actionButton();
    expect(button).not.toBeDisabled();
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a disabled action skips its popConfirm', async () => {
    const onConfirm = vi.fn();
    renderAction({
      disabledReason: 'Not allowed',
      popConfirm: { title: 'Sure?', onConfirm },
    });

    await userEvent.click(actionButton(), { pointerEventsCheck: 0 });
    expect(screen.queryByText('Sure?')).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('the overflow-menu row folds the reason into its label and disables it', () => {
    renderAction({ showInMenu: 'always', disabledReason: 'Not allowed' });

    const item = screen.getByText('Act — Not allowed');
    expect(item).toBeInTheDocument();
    expect(item.closest('[aria-disabled="true"],[disabled]')).not.toBeNull();
  });
});
