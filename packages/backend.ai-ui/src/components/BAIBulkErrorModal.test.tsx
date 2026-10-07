import BAIBulkErrorModal from './BAIBulkErrorModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The strings are ui-common's catalog English (uic.BulkErrorModal.*).

interface FailedRow {
  key: string;
  target: string;
  reason: string;
}

// Rows resolve their identity from `key` when there is no `id`.
const failedRows: FailedRow[] = [
  { key: 'row-1', target: 'project-alpha', reason: 'Permission denied' },
  { key: 'row-2', target: 'project-beta', reason: 'Not found' },
];

const columns = [
  { key: 'target', title: 'Target', dataIndex: 'target' },
  { key: 'reason', title: 'Error Message', dataIndex: 'reason' },
];

describe('BAIBulkErrorModal', () => {
  it('renders one table row per failed request using the caller-provided columns', () => {
    render(
      <BAIBulkErrorModal<FailedRow>
        open
        columns={columns}
        dataSource={failedRows}
        onRequestClose={vi.fn()}
      />,
    );

    // Caller-defined column headers (BAITable renders a hidden measurement
    // header alongside the visible one, so use getAllByText)
    expect(screen.getAllByText('Target').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Error Message').length).toBeGreaterThan(0);
    // One row per failed request
    expect(screen.getByText('project-alpha')).toBeInTheDocument();
    expect(screen.getByText('Permission denied')).toBeInTheDocument();
    expect(screen.getByText('project-beta')).toBeInTheDocument();
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('renders the localized default title when no title prop is given', () => {
    render(
      <BAIBulkErrorModal<FailedRow>
        open
        columns={columns}
        dataSource={failedRows}
        onRequestClose={vi.fn()}
      />,
    );

    expect(screen.getByText('Action execution failed')).toBeInTheDocument();
  });

  it('renders a caller-provided title and description instead of the defaults', () => {
    render(
      <BAIBulkErrorModal<FailedRow>
        open
        title="2 permission change(s) failed"
        alertDescription="Fix the failed items and retry."
        columns={columns}
        dataSource={failedRows}
        onRequestClose={vi.fn()}
      />,
    );

    expect(
      screen.getByText('2 permission change(s) failed'),
    ).toBeInTheDocument();
    // The description renders as the body of an alert titled with the fixed
    // localized "Error Occurred" copy.
    expect(screen.getByText('Error Occurred')).toBeInTheDocument();
    expect(
      screen.getByText('Fix the failed items and retry.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Action execution failed'),
    ).not.toBeInTheDocument();
  });

  it('reports dismissal through onRequestClose', async () => {
    const user = userEvent.setup();
    const onRequestClose = vi.fn();
    render(
      <BAIBulkErrorModal<FailedRow>
        open
        columns={columns}
        dataSource={failedRows}
        onRequestClose={onRequestClose}
      />,
    );

    // No footer — the header X (aria-label "Close") is the only dismissal
    // control.
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onRequestClose).toHaveBeenCalledTimes(1);
  });
});
