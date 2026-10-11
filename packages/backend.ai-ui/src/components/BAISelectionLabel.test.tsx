import BAISelectionLabel from './BAISelectionLabel';
import { BAIConfigProvider } from './provider';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// The label is ui-common's `SelectionLabel`; this pins the adapter's
// `onClearSelection` and the end-to-end path of its strings: ui-common's
// catalog -> the BUI locale module -> BAIConfigProvider -> Astryx's provider.
describe('BAISelectionLabel', () => {
  it('clears the selection through onClearSelection', async () => {
    const onClearSelection = vi.fn();
    render(<BAISelectionLabel count={3} onClearSelection={onClearSelection} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Deselect all' }));
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it('shows the Korean strings from ui-common’s catalog under ko_KR', async () => {
    const { default: ko } = await import('../locale/ko_KR');
    render(
      <BAIConfigProvider locale={ko}>
        <BAISelectionLabel count={5} onClearSelection={() => {}} />
      </BAIConfigProvider>,
    );
    expect(screen.getByText('5개 선택됨')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '선택 취소' }),
    ).toBeInTheDocument();
  });
});
