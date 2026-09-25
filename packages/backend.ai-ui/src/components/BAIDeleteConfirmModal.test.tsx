/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 The modal is ui-common's `DeleteConfirmModal`, whose tests cover the gate,
 the item list and the strings; this pins the BAIModal names the adapter
 maps onto it.
*/
import BAIDeleteConfirmModal from './BAIDeleteConfirmModal';
import { BAIConfigProvider } from './provider';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const items = [{ key: 'a', label: 'my-folder' }];

describe('BAIDeleteConfirmModal', () => {
  it('maps open, onOk, okText and cancelText', async () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();
    render(
      <BAIDeleteConfirmModal
        open
        items={items}
        okText="Purge"
        cancelText="Keep"
        onOk={onOk}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Purge' }));
    expect(onOk).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Keep' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('keeps the gate closed for requireConfirmInput until the name is typed', async () => {
    render(
      <BAIDeleteConfirmModal
        open
        items={items}
        requireConfirmInput
        inputProps={{ placeholder: 'folder name' }}
        onOk={vi.fn()}
      />,
    );

    const ok = screen.getByRole('button', { name: 'Delete' });
    expect(ok).toBeDisabled();
    await userEvent.type(
      screen.getByPlaceholderText('folder name'),
      'my-folder',
    );
    expect(ok).toBeEnabled();
  });

  it('cannot open the gate through okButtonProps.disabled', () => {
    render(
      <BAIDeleteConfirmModal
        open
        items={items}
        requireConfirmInput
        okButtonProps={{ disabled: false }}
        onOk={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('keeps the backdrop from closing with maskClosable={false}', async () => {
    const onCancel = vi.fn();
    render(
      <BAIDeleteConfirmModal
        open
        items={items}
        maskClosable={false}
        onOk={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(
      document.querySelector('.uic-modal__mask') as HTMLElement,
    );
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('shows ui-common’s Korean strings under BAIConfigProvider', async () => {
    const { default: ko } = await import('../locale/ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <BAIDeleteConfirmModal
          open
          items={[
            { key: 'a', label: 'a' },
            { key: 'b', label: 'b' },
          ]}
          onOk={vi.fn()}
        />
      </BAIConfigProvider>,
    );

    expect(screen.getByRole('dialog')).toHaveAccessibleName('2개 항목 삭제');
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});
