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
import { useState } from 'react';

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

  it.each([
    // `?current=0` maps to offset 0, so the server answers with page 1; the
    // caller still holds an invalid page, so the rows stay hidden.
    ['server-sliced', { dataSource: makeRows(10), total: 177 }],
    ['client-side', { dataSource: makeRows(25), total: undefined }],
  ])(
    'hides a %s list while the page is below 1',
    (_label, { dataSource, total }) => {
      renderTable({
        dataSource,
        pagination: { current: 0, pageSize: 10, total },
      });

      expect(screen.getByText('Invalid page number')).toBeInTheDocument();
      expect(screen.queryByText('row-1')).not.toBeInTheDocument();
    },
  );

  it.each([
    ['a string', 'Custom empty'],
    ['false', false],
  ])('wins over a caller-provided empty state of %s', (_label, emptyState) => {
    renderTable({
      dataSource: [],
      emptyState,
      pagination: OUT_OF_RANGE,
    });

    expect(screen.getByText('Invalid page number')).toBeInTheDocument();
    expect(screen.queryByText('Custom empty')).not.toBeInTheDocument();
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

/*
 FR-3994. Astryx's size selector calls onPageSizeChange and then, in the same
 event, onChange(1) — unconditionally. BAITable answered both, and the second
 answer closed over the page size that had just been replaced.

 Callers that only write state through `useBAIPaginationOptionState` never saw
 it: that setter skips a write equal to the values of the render it was read
 from, which is exactly what the trailing call carries. Callers that reload
 from the arguments instead (`onReload` with the last requested variables —
 AdminUserManagement and ~15 siblings) issued a second query with the old
 limit, and the size change never took. Both shapes are pinned here.
*/
describe('BAITable page size change (FR-3994)', () => {
  const pickTwenty = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '20' }));
  };

  it('reports the new page size once, not the one it replaced', async () => {
    const onChange = vi.fn();
    renderTable({
      dataSource: makeRows(10),
      pagination: {
        current: 1,
        pageSize: 10,
        total: 250,
        pageSizeOptions: [10, 20, 50],
        onChange,
      },
    });

    await pickTwenty();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(1, 20);
  });

  it('leaves a caller that reloads from the reported arguments on the new size', async () => {
    // The `onReload` shape: `pageSize` comes from the last REQUESTED variables,
    // so it still reads 10 while the change is being reported.
    const requested: Array<number> = [];
    const Harness = () => {
      const [limit, setLimit] = useState(10);
      return (
        <BAITable<Row>
          rowKey="id"
          columns={COLUMNS}
          dataSource={makeRows(10)}
          pagination={{
            current: 1,
            pageSize: limit,
            total: 250,
            pageSizeOptions: [10, 20, 50],
            onChange: (__, nextPageSize) => {
              requested.push(nextPageSize);
              setLimit(nextPageSize);
            },
          }}
        />
      );
    };
    render(<Harness />);

    await pickTwenty();

    expect(requested).toEqual([20]);
  });
});
