/*
 Client-side slicing, plus the server-sliced case it must not re-slice.
 Mechanism + affected call sites: FR-3563.
*/
import BAITable from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render, screen } from '@testing-library/react';

interface Row {
  id: string;
  name: string;
}

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', title: 'Name', dataIndex: 'name' },
];

const makeRows = (count: number): Array<Row> =>
  Array.from({ length: count }, (_unused, index) => ({
    id: String(index + 1),
    name: `row-${index + 1}`,
  }));

const renderTable = (
  props: Partial<React.ComponentProps<typeof BAITable<Row>>> = {},
) => render(<BAITable<Row> rowKey="id" columns={COLUMNS} {...props} />);

describe('BAITable pagination (FR-3563)', () => {
  it('slices a client-side list to the default page size', () => {
    renderTable({ dataSource: makeRows(25), pagination: {} });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-10')).toBeInTheDocument();
    expect(screen.queryByText('row-11')).not.toBeInTheDocument();
    expect(screen.queryByText('row-25')).not.toBeInTheDocument();
  });

  it('renders the requested page, not always the first', () => {
    renderTable({
      dataSource: makeRows(25),
      pagination: { current: 3, pageSize: 10 },
    });

    expect(screen.queryByText('row-20')).not.toBeInTheDocument();
    expect(screen.getByText('row-21')).toBeInTheDocument();
    expect(screen.getByText('row-25')).toBeInTheDocument();
  });

  it('does not re-slice rows the caller already sliced server-side', () => {
    // One page of a 250-row result set: 10 rows in hand, `total` says 250.
    renderTable({
      dataSource: makeRows(10),
      pagination: { current: 5, pageSize: 10, total: 250 },
    });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-10')).toBeInTheDocument();
  });

  it('leaves a server-sliced page alone even when it exceeds the page size', () => {
    // The branch the `total` guard exists for: 20 rows in hand from a 250-row
    // result set on page 5. Without the guard this indexes past the end and
    // renders nothing.
    renderTable({
      dataSource: makeRows(20),
      pagination: { current: 5, pageSize: 10, total: 250 },
    });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-20')).toBeInTheDocument();
  });

  it('renders every row when pagination is disabled', () => {
    renderTable({ dataSource: makeRows(25), pagination: false });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-25')).toBeInTheDocument();
  });

  it('clamps a page that a shrinking list left stranded', () => {
    // The user paged to 3, then a filter cut the list down to 4 rows.
    renderTable({
      dataSource: makeRows(4),
      pagination: { current: 3, pageSize: 10 },
    });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-4')).toBeInTheDocument();
  });
});
