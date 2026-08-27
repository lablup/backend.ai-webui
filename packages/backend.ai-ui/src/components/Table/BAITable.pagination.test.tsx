/*
 Client-side slicing, plus the server-sliced case it must not re-slice.
 Mechanism + affected call sites: FR-3563.

 Also the out-of-range page empty state (FR-3703): a page past the last one
 shows a recovery affordance instead of "No data to display".
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
    // Still longer than a page after the filter, so this reaches the slice
    // instead of short-circuiting on `length <= pageSize` (which made it vacuous).
    renderTable({
      dataSource: makeRows(25),
      pagination: { current: 5, pageSize: 10 },
    });

    expect(screen.queryByText('row-20')).not.toBeInTheDocument();
    expect(screen.getByText('row-21')).toBeInTheDocument();
    expect(screen.getByText('row-25')).toBeInTheDocument();
  });
});

describe('BAITable invalid page number (FR-3703)', () => {
  const OUT_OF_RANGE = { current: 20, pageSize: 10, total: 177 };

  it('offers a way back when a server-sliced page is past the last one', async () => {
    const onChange = vi.fn();
    renderTable({
      dataSource: [],
      pagination: { ...OUT_OF_RANGE, onChange },
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to first page' }),
    );
    expect(onChange).toHaveBeenCalledWith(1, 10);
  });

  it('wins over a caller-provided empty state', () => {
    renderTable({
      dataSource: [],
      emptyState: 'Custom empty',
      pagination: OUT_OF_RANGE,
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('Custom empty')).not.toBeInTheDocument();
  });

  it('wins even over an opted-out empty state', () => {
    renderTable({
      dataSource: [],
      emptyState: false,
      pagination: OUT_OF_RANGE,
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
  });

  it('treats an empty result set as no data, not an invalid page', () => {
    // A filter matching nothing while the caller sits on page 3.
    renderTable({
      dataSource: [],
      pagination: { current: 3, pageSize: 10, total: 0 },
    });

    expect(screen.getByText('No data to display')).toBeInTheDocument();
    expect(screen.queryByText('Invalid page number')).not.toBeInTheDocument();
  });

  it('leaves a valid last page alone', () => {
    renderTable({
      dataSource: makeRows(7),
      pagination: { current: 18, pageSize: 10, total: 177 },
    });

    expect(screen.getByText('row-1')).toBeInTheDocument();
    expect(screen.getByText('row-7')).toBeInTheDocument();
    expect(screen.queryByText('Invalid page number')).not.toBeInTheDocument();
  });
});
