/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import {
  liftProjectPredicate,
  splitTopLevelAnd,
} from './adminSessionProjectLift';

describe('splitTopLevelAnd', () => {
  test('splits on top-level & only', () => {
    expect(splitTopLevelAnd('(a)&(b | c)')).toEqual(['(a)', '(b | c)']);
    expect(splitTopLevelAnd('a & b')).toEqual(['a', 'b']);
  });

  test('ignores & inside quotes and parentheses', () => {
    expect(splitTopLevelAnd('name == "a&b" & x')).toEqual([
      'name == "a&b"',
      'x',
    ]);
    expect(splitTopLevelAnd('(a & b) & c')).toEqual(['(a & b)', 'c']);
  });
});

describe('liftProjectPredicate', () => {
  test('lifts a single == predicate and strips it from the remainder', () => {
    expect(liftProjectPredicate('project_id == "uuid-1"')).toEqual({
      projectId: 'uuid-1',
      remainder: undefined,
    });
    expect(
      liftProjectPredicate('(project_id == "uuid-1")&(name ilike "%a%")'),
    ).toEqual({ projectId: 'uuid-1', remainder: '(name ilike "%a%")' });
  });

  test('lifts ilike and the no-space form', () => {
    expect(liftProjectPredicate('project_id ilike "%uuid-2%"').projectId).toBe(
      'uuid-2',
    );
    expect(liftProjectPredicate('project_id=="uuid-3"').projectId).toBe(
      'uuid-3',
    );
  });

  test('does not lift when two project predicates exist', () => {
    const filter = '(project_id == "a")&(project_id == "b")';
    expect(liftProjectPredicate(filter)).toEqual({
      projectId: undefined,
      remainder: filter,
    });
  });

  test('does not lift across a top-level |', () => {
    const filter =
      'project_id == "a" & name ilike "%x%" | scaling_group == "sg"';
    expect(liftProjectPredicate(filter)).toEqual({
      projectId: undefined,
      remainder: filter,
    });
  });

  test('leaves a compound segment mentioning project_id untouched', () => {
    const filter = '(name == "job" & project_id == "a")';
    expect(liftProjectPredicate(filter)).toEqual({
      projectId: undefined,
      remainder: filter,
    });
  });

  test('passes through filters without a project predicate', () => {
    expect(liftProjectPredicate('name ilike "%a%"')).toEqual({
      projectId: undefined,
      remainder: 'name ilike "%a%"',
    });
    expect(liftProjectPredicate('')).toEqual({
      projectId: undefined,
      remainder: undefined,
    });
  });
});
