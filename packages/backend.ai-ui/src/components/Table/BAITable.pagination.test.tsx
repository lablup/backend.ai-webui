/*
 Client-side slicing, plus the server-sliced case it must not re-slice.
 Mechanism + affected call sites: FR-3563.

 Also the out-of-range page state (FR-3703): a page outside [1, last] hides
 whatever rows were handed over — on both bounds, server- or client-sliced —
 behind a recovery affordance instead of "No data to display" or a silently
 clamped page.
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

  it('shows the recovery state, not a clamped page, when a shrinking list strands the page', () => {
    // 25 rows on page 5 of 10: the page no longer exists, so the rows are
    // hidden behind the invalid-page state instead of silently showing page 3.
    renderTable({
      dataSource: makeRows(25),
      pagination: { current: 5, pageSize: 10 },
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('row-21')).not.toBeInTheDocument();
    expect(screen.queryByText('row-1')).not.toBeInTheDocument();
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

  it('hides a first page the server returned for a page below 1', () => {
    // `?current=0` maps to offset 0, so the server answers with page 1; the
    // caller still holds an invalid page, so the rows stay hidden.
    const onChange = vi.fn();
    renderTable({
      dataSource: makeRows(10),
      pagination: { current: 0, pageSize: 10, total: 177, onChange },
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('row-1')).not.toBeInTheDocument();
  });

  it('hides a client-side list too while the page is out of range', () => {
    renderTable({
      dataSource: makeRows(25),
      pagination: { current: 0, pageSize: 10 },
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('row-1')).not.toBeInTheDocument();
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
