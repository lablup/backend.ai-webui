import { combineFilters } from './combineFilters';

type TestFilter = {
  AND?: ReadonlyArray<TestFilter> | null | undefined;
  OR?: ReadonlyArray<TestFilter> | null | undefined;
  NOT?: ReadonlyArray<TestFilter> | null | undefined;
  name?: string;
  status?: string;
};

describe('combineFilters', () => {
  test('returns null when nothing is left after compacting', () => {
    expect(combineFilters<TestFilter>([])).toBeNull();
    expect(combineFilters<TestFilter>([null, undefined])).toBeNull();
    expect(combineFilters<TestFilter>([null, undefined], 'OR')).toBeNull();
    expect(combineFilters<TestFilter>([null, undefined], 'NOT')).toBeNull();
  });

  test('returns the single part as-is under AND', () => {
    const part: TestFilter = { name: 'a' };
    expect(combineFilters<TestFilter>([null, part], 'AND')).toBe(part);
  });

  test('wraps two or more parts in AND', () => {
    const first: TestFilter = { name: 'a' };
    const second: TestFilter = { status: 'ACTIVE' };
    expect(
      combineFilters<TestFilter>([first, undefined, second], 'AND'),
    ).toEqual({ AND: [first, second] });
  });

  test('wraps two or more parts in OR', () => {
    const first: TestFilter = { name: 'a' };
    const second: TestFilter = { status: 'ACTIVE' };
    expect(
      combineFilters<TestFilter>([first, undefined, second], 'OR'),
    ).toEqual({
      OR: [first, second],
    });
  });

  test('never unwraps a single part under NOT', () => {
    const part: TestFilter = { name: 'a' };
    expect(combineFilters<TestFilter>([null, part], 'NOT')).toEqual({
      NOT: [part],
    });
  });

  test('defaults to AND', () => {
    const first: TestFilter = { name: 'a' };
    const second: TestFilter = { status: 'ACTIVE' };
    expect(combineFilters<TestFilter>([first, second])).toEqual({
      AND: [first, second],
    });
  });
});
