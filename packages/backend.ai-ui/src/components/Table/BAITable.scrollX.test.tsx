/*
 Pins the `scroll.x` contract structurally (jsdom has no layout): the rc-table
 value mapping, and the PER-COLUMN max-width release — a table-wide release
 would let auto layout push a resized column back to its content width.
*/
import {
  dimLayerOf,
  renderScrollTable,
  rootOf,
} from './BAITable.scrollTestFixtures';

describe('BAITable scroll.x', () => {
  it.each([
    ['max-content' as const, 'max-content'],
    [800 as const, '800px'],
    [true as const, 'auto'],
  ])('maps scroll.x=%s onto the CSS variable as %s', (x, expected) => {
    const { container } = renderScrollTable({ scroll: { x } });
    const layer = dimLayerOf(container);
    expect(layer).toHaveClass('bai-table-astryx-scroll-x');
    expect(layer.style.getPropertyValue('--bai-table-scroll-x')).toBe(expected);
  });

  it('stays off when scroll is absent or carries no x', () => {
    const { container: withoutScroll } = renderScrollTable();
    expect(dimLayerOf(withoutScroll)).not.toHaveClass(
      'bai-table-astryx-scroll-x',
    );

    const { container: yOnly } = renderScrollTable({ scroll: { y: 500 } });
    const layer = dimLayerOf(yOnly);
    expect(layer).not.toHaveClass('bai-table-astryx-scroll-x');
    expect(layer.style.getPropertyValue('--bai-table-scroll-x')).toBe('');
  });

  it('releases max-width on auto columns only', () => {
    const { container } = renderScrollTable({ scroll: { x: 'max-content' } });
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

  // FR-4007: the root is the flex item a caller lays out, and its size reset
  // lives on this class. jsdom has no layout, so pin the hook, not the effect.
  it('names the outer wrapper so the flex size reset can reach it', () => {
    const { container } = renderScrollTable({ scroll: { x: 'max-content' } });
    const root = rootOf(container);
    expect(root).toBeInTheDocument();
    expect(root).toContainElement(dimLayerOf(container));
    expect(rootOf(renderScrollTable().container)).toBeInTheDocument();
  });

  it('keeps a caller className alongside the root class', () => {
    const { container } = renderScrollTable({ className: 'my-table' });
    expect(rootOf(container)).toHaveClass('my-table');
  });

  it('leaves every cell clipped when x mode is off', () => {
    const { container } = renderScrollTable();
    const cells = container.querySelectorAll<HTMLTableCellElement>('tbody td');
    expect([...cells].every((cell) => cell.style.maxWidth === '')).toBe(true);
  });
});
