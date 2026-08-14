/*
 Pins the `scroll.y` contract structurally (jsdom has no layout): the value
 mapping onto the height variable, and the PINNED-header z-order restore that
 keeps a `fixed` column's header above the plain sticky ones.
*/
import {
  SCROLL_PINNED_COLUMNS,
  dimLayerOf,
  renderScrollTable,
} from './BAITableAstryx.scrollTestFixtures';

describe('BAITableAstryx scroll.y', () => {
  it.each([
    [500 as const, '500px'],
    ['60vh' as const, '60vh'],
  ])('maps scroll.y=%s onto the CSS variable as %s', (y, expected) => {
    const { container } = renderScrollTable({ scroll: { y } });
    const layer = dimLayerOf(container);
    expect(layer).toHaveClass('bai-table-astryx-scroll-y');
    expect(layer.style.getPropertyValue('--bai-table-scroll-y')).toBe(expected);
  });

  it('stays off when scroll is absent or carries no y', () => {
    const { container: withoutScroll } = renderScrollTable();
    expect(dimLayerOf(withoutScroll)).not.toHaveClass(
      'bai-table-astryx-scroll-y',
    );

    const { container: xOnly } = renderScrollTable({
      scroll: { x: 'max-content' },
    });
    const layer = dimLayerOf(xOnly);
    expect(layer).not.toHaveClass('bai-table-astryx-scroll-y');
    expect(layer.style.getPropertyValue('--bai-table-scroll-y')).toBe('');
  });

  it('carries both axes at once', () => {
    const { container } = renderScrollTable({
      scroll: { x: 'max-content', y: 500 },
    });
    const layer = dimLayerOf(container);
    expect(layer).toHaveClass('bai-table-astryx-scroll-x');
    expect(layer).toHaveClass('bai-table-astryx-scroll-y');
    expect(layer.style.getPropertyValue('--bai-table-scroll-x')).toBe(
      'max-content',
    );
    expect(layer.style.getPropertyValue('--bai-table-scroll-y')).toBe('500px');
  });

  it('restores the pinned header cell above the plain sticky ones', () => {
    const { container } = renderScrollTable({
      columns: SCROLL_PINNED_COLUMNS,
      scroll: { x: 'max-content', y: 500 },
    });
    const [pinnedHeader, plainHeader] =
      container.querySelectorAll<HTMLTableCellElement>('thead th');

    expect(pinnedHeader.style.zIndex).toBe('3');
    expect(plainHeader.style.zIndex).toBe('');
    // The plugin's own inline sticky offset must survive the merge.
    expect(pinnedHeader.style.insetInlineStart).toBe('0px');
  });

  it('lifts no header when nothing is pinned (selection-only shape)', () => {
    // The VFolderTable-style call site: rowSelection, no `fixed` column. The
    // z plugin must stay unregistered; the sticky header is CSS alone.
    const { container } = renderScrollTable({
      rowSelection: { selectedRowKeys: [], onChange: () => {} },
      scroll: { x: 'max-content', y: 300 },
    });
    for (const th of container.querySelectorAll<HTMLTableCellElement>(
      'thead th',
    )) {
      expect(th.style.zIndex).toBe('');
    }
  });

  it('keeps the capped element reachable at either DOM depth', () => {
    // `div:has(> table)`, not `> div`: resize (default on) inserts a
    // `display: contents` wrapper that would swallow a child cap.
    const withResize = renderScrollTable({ scroll: { y: 500 } }).container;
    const resizeLayer = dimLayerOf(withResize);
    expect(resizeLayer.querySelector('div:has(> table)')).not.toBeNull();
    expect(resizeLayer.querySelector('div:has(> table)')).not.toBe(
      resizeLayer.firstElementChild,
    );

    const withoutResize = renderScrollTable({
      scroll: { y: 500 },
      resizable: false,
    }).container;
    const plainLayer = dimLayerOf(withoutResize);
    expect(plainLayer.querySelector('div:has(> table)')).toBe(
      plainLayer.firstElementChild,
    );
  });

  it('leaves header z-order to the sticky plugin when y mode is off', () => {
    const { container } = renderScrollTable({
      columns: SCROLL_PINNED_COLUMNS,
      scroll: { x: 'max-content' },
    });
    const [pinnedHeader] =
      container.querySelectorAll<HTMLTableCellElement>('thead th');
    expect(pinnedHeader.style.zIndex).toBe('');
  });
});
