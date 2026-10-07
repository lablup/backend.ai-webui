import BAIUncontrolledInput from './BAIUncontrolledInput';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// The field is ui-common's `UncontrolledInput`; this pins the antd names the
// adapter maps onto it.
describe('BAIUncontrolledInput', () => {
  it('maps disabled', () => {
    render(<BAIUncontrolledInput label="Font" disabled />);
    expect(screen.getByRole('textbox', { name: 'Font' })).toBeDisabled();
  });

  it('maps an antd status string onto an invalid field', () => {
    render(<BAIUncontrolledInput label="Font" status="error" />);
    expect(screen.getByRole('textbox', { name: 'Font' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('commits on Enter only', async () => {
    const onCommit = vi.fn();
    render(
      <BAIUncontrolledInput
        label="Font"
        defaultValue=""
        onCommit={onCommit}
        data-testid="font"
      />,
    );
    await userEvent.type(screen.getByTestId('font'), 'Inter');
    expect(onCommit).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onCommit).toHaveBeenCalledWith('Inter');
  });
});
