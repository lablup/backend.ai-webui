/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { includesPath, pathKey } from './path';
import {
  LauncherModelError,
  type NamePath,
  type SliceDefinition,
} from './types';
import * as _ from 'lodash-es';

/** Paths in `paths` that `owned` does not contain, as display keys. */
export const pathsOutside = (
  paths: ReadonlyArray<NamePath>,
  owned: ReadonlyArray<NamePath>,
) => paths.filter((path) => !includesPath(owned, path)).map(pathKey);

/** Checks what one slice can check alone; `compose` checks the rest. */
export const defineSlice = <S extends SliceDefinition>(slice: S): S => {
  const fail = (message: string) => {
    throw new LauncherModelError(`slice '${slice.name}': ${message}`);
  };
  const keys = slice.fields.map(pathKey);
  const duplicateFields = _.uniq(keys.filter((k, i) => keys.indexOf(k) !== i));
  if (duplicateFields.length > 0) {
    fail(`duplicate fields ${duplicateFields.join(', ')}`);
  }
  // A rule touching another slice's field belongs in `crossRules`.
  for (const rule of slice.rules) {
    const foreign = pathsOutside([...rule.reads, ...rule.writes], slice.fields);
    if (foreign.length > 0) {
      fail(`rule ${rule.id} touches fields it does not own: ${foreign}`);
    }
  }
  return slice;
};
