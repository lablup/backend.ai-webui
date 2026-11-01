import {
  amountToCells,
  getDefaultUnit,
  getGridCells,
  getInitialUnit,
  getQuickSlotKind,
  getUnitSteps,
  roundAmountToUnit,
} from './quickResourceGrid';

describe('quickResourceGrid', () => {
  it('classifies slots', () => {
    expect(getQuickSlotKind('cpu')).toBe('cpu');
    expect(getQuickSlotKind('mem')).toBe('mem');
    expect(getQuickSlotKind('cuda.shares')).toBe('shares');
    expect(getQuickSlotKind('cuda.device')).toBe('count');
    expect(getQuickSlotKind('atom.mem', true)).toBe('mem');
  });

  it('switches units only for memory', () => {
    expect(getUnitSteps('cpu')).toEqual([1]);
    expect(getUnitSteps('count')).toEqual([1]);
    expect(getUnitSteps('mem')).toEqual([0.25, 1]);
    expect(getUnitSteps('shares', 0.25)).toEqual([0.25]);
    expect(getUnitSteps('shares', null)).toEqual([0.1]);
  });

  it('starts memory in MiB only while 32 cells cover the limit', () => {
    expect(getDefaultUnit('mem', [0.25, 1], 8)).toBe(0.25);
    expect(getDefaultUnit('mem', [0.25, 1], 64)).toBe(1);
    expect(getDefaultUnit('mem', [0.25, 1], undefined)).toBe(1);
    expect(getDefaultUnit('cpu', [1], 16)).toBe(1);
  });

  it('lowers the initial unit so a small amount still fills a cell', () => {
    expect(getInitialUnit('mem', [0.25, 1], 64, 0.5)).toBe(0.25);
    expect(getInitialUnit('mem', [0.25, 1], 64, 8)).toBe(1);
    expect(getInitialUnit('mem', [0.25, 1], 64, 0)).toBe(1);
  });

  it('derives the card cells from limit, remaining and minimum', () => {
    expect(
      getGridCells({ kind: 'cpu', unit: 1, min: 1, max: 16, remaining: 12 }),
    ).toEqual({ columns: 8, totalCells: 16, availableCells: 12, minCells: 1 });
    expect(
      getGridCells({ kind: 'mem', unit: 0.25, min: 0.5, max: 64 }),
    ).toEqual({ columns: 8, totalCells: 32, availableCells: 32, minCells: 2 });
    expect(getGridCells({ kind: 'mem', unit: 1, max: 100 })).toEqual({
      columns: 16,
      totalCells: 100,
      availableCells: 100,
      minCells: 0,
    });
    expect(
      getGridCells({ kind: 'shares', unit: 0.1, max: 1, remaining: 0.3 }),
    ).toEqual({ columns: 8, totalCells: 10, availableCells: 3, minCells: 0 });
  });

  it('converts amounts to cells and rounds on a unit switch', () => {
    expect(amountToCells(6, 4)).toBe(1);
    expect(amountToCells(0.3, 0.1)).toBe(3);
    expect(roundAmountToUnit(1.6, 1)).toBe(1);
    expect(roundAmountToUnit(0.7, 0.25)).toBe(0.5);
    expect(roundAmountToUnit(0.2, 1, 0.5)).toBe(0.5);
  });
});
