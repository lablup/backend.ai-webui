/*
 FR-3563 — client-side slicing, and the server-sliced case it must not break.

 The migration dropped antd's `pageData` step: every row in `dataSource` was
 rendered while the bottom bar displayed a page range, so the five call sites
 that hand over a whole client-side list (the error log, the artifact modals)
 showed everything on page 1 and page numbers did nothing.

 The rule restored here is antd's: a `total` LARGER than the rows we were given
 means the caller already sliced server-side, so slicing again would empty
 every page past the first. That is the branch most of the ~100 call sites take,
 which is why it is asserted alongside the fix.

 Structural, not visual — jsdom's lack of layout does not matter.
*/
import BAITableAstryx from './BAITableAstryx';
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
  props: Partial<React.ComponentProps<typeof BAITableAstryx<Row>>> = {},
) => render(<BAITableAstryx<Row> rowKey="id" columns={COLUMNS} {...props} />);

describe('BAITableAstryx pagination (FR-3563)', () => {
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

  it('honours a caller-supplied page size', () => {
    renderTable({ dataSource: makeRows(25), pagination: { pageSize: 5 } });

    expect(screen.getByText('row-5')).toBeInTheDocument();
    expect(screen.queryByText('row-6')).not.toBeInTheDocument();
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
