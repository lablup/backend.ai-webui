/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import type { InternalNamePath } from '../../../form-engine';
import type { LauncherValues, NamePath } from './types';
import * as _ from 'lodash-es';

/** Like the form engine: `'a.b'` stays one segment, arrays pass through. */
export const toPath = (path: NamePath): InternalNamePath =>
  (_.castArray(path) as unknown[]).map((segment) =>
    _.isNumber(segment) ? segment : String(segment),
  );

export const pathKey = (path: NamePath) => toPath(path).join('.');

export const isSamePath = (a: NamePath, b: NamePath) =>
  pathKey(a) === pathKey(b);

export const includesPath = (list: ReadonlyArray<NamePath>, path: NamePath) =>
  list.some((candidate) => isSamePath(candidate, path));

export const getIn = (values: LauncherValues, path: NamePath): unknown =>
  _.get(values, toPath(path));

type Container = Record<PropertyKey, unknown>;

const setSegments = (
  target: unknown,
  [head, ...rest]: InternalNamePath,
  value: unknown,
): Container => {
  const copy: Container = _.isArray(target)
    ? ([...target] as unknown as Container)
    : _.isPlainObject(target)
      ? { ...(target as Container) }
      : _.isNumber(head)
        ? ([] as unknown as Container)
        : {};
  copy[head] = rest.length > 0 ? setSegments(copy[head], rest, value) : value;
  return copy;
};

/** Copy-on-write set; numeric segments create arrays, as the form store does. */
export const setIn = (
  values: LauncherValues,
  path: NamePath,
  value: unknown,
): LauncherValues => setSegments(values, toPath(path), value);
