import {
  amountToCells,
  getDefaultUnit,
  getGridCells,
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

  it('lists unit steps per kind, with the group quantum for shares', () => {
    expect(getUnitSteps('cpu')).toEqual([1, 4, 16]);
    expect(getUnitSteps('mem')).toEqual([0.25, 1, 4, 16, 64]);
    expect(getUnitSteps('shares', 0.25)).toEqual([0.25, 1, 4]);
    expect(getUnitSteps('shares', null)).toEqual([0.1, 1, 4]);
    expect(getUnitSteps('shares', 1)).toEqual([1, 4]);
  });

  it('picks the smallest unit whose cap covers the limit', () => {
    expect(getDefaultUnit('cpu', [1, 4, 16], 16)).toBe(1);
    expect(getDefaultUnit('cpu', [1, 4, 16], 128)).toBe(4);
    expect(getDefaultUnit('mem', [0.25, 1, 4, 16, 64], 8)).toBe(1);
    expect(getDefaultUnit('mem', [0.25, 1, 4, 16, 64], 64)).toBe(4);
    expect(getDefaultUnit('mem', [0.25, 1, 4, 16, 64], 10000)).toBe(64);
    expect(getDefaultUnit('shares', [0.1, 1, 4], 3)).toBe(0.1);
    expect(getDefaultUnit('shares', [0.1, 1, 4], undefined)).toBe(1);
  });

  it('derives the card cells from limit, remaining and minimum', () => {
    expect(
      getGridCells({ kind: 'cpu', unit: 1, min: 1, max: 16, remaining: 12 }),
    ).toEqual({ columns: 8, totalCells: 16, availableCells: 12, minCells: 1 });
    expect(
      getGridCells({ kind: 'mem', unit: 1, min: 0.5, max: undefined }),
    ).toEqual({ columns: 8, totalCells: 32, availableCells: 32, minCells: 1 });
    expect(getGridCells({ kind: 'count', unit: 1, max: 2 })).toEqual({
      columns: 2,
      totalCells: 2,
      availableCells: 2,
      minCells: 0,
    });
    expect(
      getGridCells({ kind: 'shares', unit: 0.1, max: 1, remaining: 0.3 }),
    ).toEqual({ columns: 8, totalCells: 10, availableCells: 3, minCells: 0 });
  });

  it('converts amounts to cells and rounds on a unit switch', () => {
    expect(amountToCells(6, 4)).toBe(1);
    expect(amountToCells(0.3, 0.1)).toBe(3);
    expect(roundAmountToUnit(6, 4)).toBe(4);
    expect(roundAmountToUnit(3, 4, 1)).toBe(1);
    expect(roundAmountToUnit(0.7, 0.25)).toBe(0.5);
  });
});
