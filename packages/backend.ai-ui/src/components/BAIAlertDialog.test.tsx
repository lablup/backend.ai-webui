/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The surface is ui-common's `AlertModal`, whose tests cover the role, focus,
 dismissal and the shared level stack; this pins the contract the app-shim's
 `confirm` relies on and the catalog strings arriving under BUI's provider.
*/
import BAIAlertDialog from './BAIAlertDialog';
import { BAIConfigProvider } from './provider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('BAIAlertDialog', () => {
  it('is a named, described alertdialog that cancels on Escape only', async () => {
    const onOpenChange = vi.fn();
    const onAction = vi.fn();
    render(
      <BAIAlertDialog
        isOpen
        onOpenChange={onOpenChange}
        onAction={onAction}
        title="Delete session?"
        description="This action cannot be undone."
        actionLabel="Delete"
      />,
    );

    const alert = screen.getByRole('alertdialog');
    expect(alert).toHaveAccessibleName('Delete session?');
    expect(alert).toHaveAccessibleDescription('This action cannot be undone.');
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Cancel' }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows ui-common’s Korean cancel label under BAIConfigProvider', async () => {
    const { default: ko } = await import('../locale/ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <BAIAlertDialog
          isOpen
          onOpenChange={vi.fn()}
          onAction={vi.fn()}
          title="세션을 삭제할까요?"
          description="되돌릴 수 없습니다."
          actionLabel="삭제"
        />
      </BAIConfigProvider>,
    );

    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});
