/*
 Pins the injected expand-chevron column's width (FR-3556).

 Astryx insets the FIRST column by the container's inline padding, so the
 chevron only fits when the column is sized for that inset. The three branches
 below are the ones that keep the hover pill from being clipped again;
 structural assertions only, since jsdom has no layout.
*/
import BAITable from './BAITable';
import type { BAITableExpandable } from './BAITable';
import type { BAIColumnsType } from './tableTypes';
import { render } from '@testing-library/react';

interface Row {
  id: string;
  name: string;
}

const ROWS: Array<Row> = [{ id: '1', name: 'alpha' }];

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', dataIndex: 'name', title: 'Name' },
];

const EXPANDABLE: BAITableExpandable<Row> = {
  expandedRowRender: (record) => <span>detail for {record.name}</span>,
};

const renderTable = (
  props: Partial<React.ComponentProps<typeof BAITable<Row>>> = {},
) =>
  render(
    <BAITable<Row>
      rowKey="id"
      dataSource={ROWS}
      columns={COLUMNS}
      expandable={EXPANDABLE}
      {...props}
    />,
  );

/** Inline width of the nth `<th>`, which is where column sizing lands. */
const headerWidth = (container: HTMLElement, index: number) =>
  container.querySelectorAll<HTMLTableCellElement>('thead th')[index].style
    .width;

describe('BAITable expand-column width', () => {
  it('is 56px when the chevron is the first column', () => {
    // 24 (Astryx first-column inset) + 24 (sm IconButton) + 8 (trailing pad).
    const { container } = renderTable();
    expect(headerWidth(container, 0)).toBe('56px');
  });

  it('is 40px when a selection column takes the first-column inset', () => {
    // Behind the checkbox the chevron is no longer `:first-child`, so it only
    // needs the ordinary 8 + 24 + 8 lead-in.
    const { container } = renderTable({
      rowSelection: { selectedRowKeys: [], onChange: () => {} },
    });
    // Column 0 is Astryx's injected checkbox; column 1 is the chevron.
    expect(headerWidth(container, 1)).toBe('40px');
  });

  it('honours an explicit expandable.columnWidth over both defaults', () => {
    const { container } = renderTable({
      expandable: { ...EXPANDABLE, columnWidth: 72 },
    });
    expect(headerWidth(container, 0)).toBe('72px');
  });
});
