import BAIPopconfirm from './BAIPopconfirm';
import { BAIConfigProvider } from './provider';
import { Button } from '@lablup/ui-common/Button';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// The popover is ui-common's `ConfirmPopover`, whose tests cover focus,
// async confirm and the ButtonGroup render-prop form; this pins the antd
// names the adapter maps onto it.
describe('BAIPopconfirm', () => {
  it('maps okText, cancelText, isOkDisabled and onConfirm', async () => {
    const onConfirm = vi.fn();
    const { rerender } = render(
      <BAIPopconfirm
        title="Deactivate?"
        okText="Deactivate"
        cancelText="Keep"
        isOkDisabled
        onConfirm={onConfirm}
      >
        <Button label="Open" />
      </BAIPopconfirm>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeDisabled();

    rerender(
      <BAIPopconfirm
        title="Deactivate?"
        okText="Deactivate"
        isDanger
        onConfirm={onConfirm}
      >
        <Button label="Open" />
      </BAIPopconfirm>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('shows ui-common’s Korean labels under BAIConfigProvider', async () => {
    const { default: ko } = await import('../locale/ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <BAIPopconfirm title="비활성화할까요?">
          <Button label="Open" />
        </BAIPopconfirm>
      </BAIConfigProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });
});
