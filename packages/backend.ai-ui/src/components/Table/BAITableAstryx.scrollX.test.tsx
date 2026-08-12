/*
 Pins the `scroll.x` contract structurally (jsdom has no layout): the rc-table
 value mapping, and the PER-COLUMN max-width release — a table-wide release
 would let auto layout push a resized column back to its content width.
*/
import BAITableAstryx from './BAITableAstryx';
import type { BAIColumnsType } from './tableTypes';
import { render } from '@testing-library/react';

interface Row {
  id: string;
  name: string;
  note: string;
}

const COLUMNS: BAIColumnsType<Row> = [
  { key: 'name', title: 'Name', dataIndex: 'name', width: 120 },
  { key: 'note', title: 'Note', dataIndex: 'note' },
];

const ROWS: Array<Row> = [{ id: '1', name: 'alpha', note: 'a long note' }];

const renderTable = (
  props: Partial<React.ComponentProps<typeof BAITableAstryx<Row>>> = {},
) =>
  render(
    <BAITableAstryx<Row>
      rowKey="id"
      dataSource={ROWS}
      columns={COLUMNS}
      {...props}
    />,
  );

const dimLayerOf = (container: HTMLElement) =>
  container.querySelector<HTMLElement>('.bai-table-astryx-dim-layer')!;

describe('BAITableAstryx scroll.x', () => {
  it.each([
    ['max-content' as const, 'max-content'],
    [800 as const, '800px'],
    [true as const, 'auto'],
  ])('maps scroll.x=%s onto the CSS variable as %s', (x, expected) => {
    const { container } = renderTable({ scroll: { x } });
    const layer = dimLayerOf(container);
    expect(layer).toHaveClass('bai-table-astryx-scroll-x');
    expect(layer.style.getPropertyValue('--bai-table-scroll-x')).toBe(expected);
  });

  it('stays off when scroll is absent or carries no x', () => {
    const { container: withoutScroll } = renderTable();
    expect(dimLayerOf(withoutScroll)).not.toHaveClass(
      'bai-table-astryx-scroll-x',
    );

    const { container: yOnly } = renderTable({ scroll: { y: 500 } });
    const layer = dimLayerOf(yOnly);
    expect(layer).not.toHaveClass('bai-table-astryx-scroll-x');
    expect(layer.style.getPropertyValue('--bai-table-scroll-x')).toBe('');
  });

  it('releases max-width on auto columns only', () => {
    const { container } = renderTable({ scroll: { x: 'max-content' } });
    const [nameCell, noteCell] =
      container.querySelectorAll<HTMLTableCellElement>('tbody td');

    // `name` declares width: 120 — it must keep Astryx's clip so it truncates.
    expect(nameCell.style.maxWidth).toBe('');
    expect(noteCell.style.maxWidth).toBe('none');

    const [nameHeader, noteHeader] =
      container.querySelectorAll<HTMLTableCellElement>('thead th');
    expect(nameHeader.style.maxWidth).toBe('');
    expect(noteHeader.style.maxWidth).toBe('none');
    // Cancels the percentage width `resolveColumnWidths` still emits.
    expect(noteHeader.style.width).toBe('auto');
  });

  it('leaves every cell clipped when x mode is off', () => {
    const { container } = renderTable();
    const cells = container.querySelectorAll<HTMLTableCellElement>('tbody td');
    expect([...cells].every((cell) => cell.style.maxWidth === '')).toBe(true);
  });
});
