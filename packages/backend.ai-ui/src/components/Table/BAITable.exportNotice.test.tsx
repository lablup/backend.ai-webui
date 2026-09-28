/*
 FR-4010 — `exportSettings.notice` is the export modal's own warning, shown
 above the column list before the user commits, so a cap on the rows the
 export will hold is read where the decision is made, not on the notification
 that follows the download.
*/
import BAITable from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

interface Row {
  id: string;
  name: string;
}

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];
const ROWS: Row[] = [{ id: '1', name: 'default' }];

const openExportModal = async (notice?: React.ReactNode) => {
  render(
    <BAITable<Row>
      rowKey="id"
      dataSource={ROWS}
      columns={COLUMNS}
      exportSettings={{
        supportedFields: ['name'],
        onExport: async () => {},
        notice,
      }}
    />,
  );
  await userEvent.click(screen.getByRole('button', { name: 'Export CSV' }));
  await screen.findByRole('dialog');
};

describe('BAITable export modal notice (FR-4010)', () => {
  it('shows the notice above the column list when one is given', async () => {
    await openExportModal('Only the first 1000 of 1234 rows will be exported.');
    expect(screen.getByTestId('bai-table-export-notice')).toHaveTextContent(
      'Only the first 1000 of 1234 rows will be exported.',
    );
  });

  it('renders no banner when there is nothing to warn about', async () => {
    await openExportModal(undefined);
    expect(
      screen.queryByTestId('bai-table-export-notice'),
    ).not.toBeInTheDocument();
  });
});
