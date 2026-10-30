import BAIResourceAreaGrid, {
  areaShapeAtLeast,
  areaShapeAtMost,
  clampAreaShape,
  isAreaShapeAvailable,
} from './BAIResourceAreaGrid';
import { fireEvent, render, screen } from '@testing-library/react';

const BOUNDS = { columns: 4, totalCells: 16, availableCells: 12 };

describe('area shape math', () => {
  it('treats a rectangle as available only when its bottom-right cell is', () => {
    expect(isAreaShapeAvailable({ rows: 3, cols: 4 }, BOUNDS)).toBe(true);
    expect(isAreaShapeAvailable({ rows: 4, cols: 1 }, BOUNDS)).toBe(false);
    expect(isAreaShapeAvailable({ rows: 1, cols: 5 }, BOUNDS)).toBe(false);
  });

  it('picks the largest rectangle at most the count, wider on a tie', () => {
    expect(areaShapeAtMost(6, BOUNDS)).toEqual({ rows: 2, cols: 3 });
    expect(areaShapeAtMost(4, BOUNDS)).toEqual({ rows: 1, cols: 4 });
    // 7 has no 4-column rectangle: the closest below is 6.
    expect(areaShapeAtMost(7, BOUNDS)).toEqual({ rows: 2, cols: 3 });
    expect(areaShapeAtMost(Infinity, BOUNDS)).toEqual({ rows: 3, cols: 4 });
    expect(areaShapeAtMost(0, BOUNDS)).toBeUndefined();
  });

  it('picks the smallest rectangle reaching the count, wider on a tie', () => {
    expect(areaShapeAtLeast(3, BOUNDS)).toEqual({ rows: 1, cols: 3 });
    expect(areaShapeAtLeast(5, BOUNDS)).toEqual({ rows: 2, cols: 3 });
    expect(areaShapeAtLeast(13, BOUNDS)).toBeUndefined();
  });

  it('clamps a requested rectangle into the available cells and the minimum', () => {
    expect(clampAreaShape({ rows: 4, cols: 4 }, BOUNDS, 0)).toEqual({
      rows: 3,
      cols: 4,
    });
    expect(clampAreaShape({ rows: 1, cols: 1 }, BOUNDS, 2)).toEqual({
      rows: 1,
      cols: 2,
    });
  });
});

describe('BAIResourceAreaGrid', () => {
  it('draws the selected rectangle and hatches unavailable cells', () => {
    const { container } = render(
      <BAIResourceAreaGrid
        columns={4}
        totalCells={16}
        availableCells={12}
        value={6}
        aria-label="CPU"
      />,
    );
    const slider = screen.getByRole('slider', { name: 'CPU' });
    expect(slider).toHaveAttribute('aria-valuenow', '6');
    expect(slider).toHaveAttribute('aria-valuemax', '12');
    expect(
      container.querySelectorAll('.bai-resource-area-grid__cell--selected'),
    ).toHaveLength(6);
    expect(
      container.querySelectorAll('.bai-resource-area-grid__cell--unavailable'),
    ).toHaveLength(4);
  });

  it('grows and shrinks by one column or row from the keyboard', () => {
    const onChange = vi.fn();
    render(
      <BAIResourceAreaGrid
        columns={4}
        totalCells={16}
        value={2}
        minCells={1}
        onChange={onChange}
        aria-label="CPU"
      />,
    );
    const slider = screen.getByRole('slider', { name: 'CPU' });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith(3);
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenLastCalledWith(16);
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it('ignores input when disabled', () => {
    const onChange = vi.fn();
    render(
      <BAIResourceAreaGrid
        columns={4}
        totalCells={8}
        value={2}
        disabled
        onChange={onChange}
        aria-label="CPU"
      />,
    );
    fireEvent.keyDown(screen.getByRole('slider', { name: 'CPU' }), {
      key: 'ArrowRight',
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
