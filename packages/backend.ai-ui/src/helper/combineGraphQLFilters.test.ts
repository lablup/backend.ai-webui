import { combineFiltersWithAnd } from './combineGraphQLFilters';

type TestFilter = {
  AND?: ReadonlyArray<TestFilter> | null | undefined;
  name?: string;
  status?: string;
};

describe('combineFiltersWithAnd', () => {
  test('returns null when nothing is left after compacting', () => {
    expect(combineFiltersWithAnd<TestFilter>([])).toBeNull();
    expect(combineFiltersWithAnd<TestFilter>([null, undefined])).toBeNull();
  });

  test('returns the single part as-is', () => {
    const part: TestFilter = { name: 'a' };
    expect(combineFiltersWithAnd<TestFilter>([null, part])).toBe(part);
  });

  test('wraps two or more parts in AND', () => {
    const first: TestFilter = { name: 'a' };
    const second: TestFilter = { status: 'ACTIVE' };
    expect(
      combineFiltersWithAnd<TestFilter>([first, undefined, second]),
    ).toEqual({ AND: [first, second] });
  });
});
