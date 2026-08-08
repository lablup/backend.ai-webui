/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Path + store primitives for the self-hosted form engine (to-astryx ticket 34).

 Byte-for-byte behavioural port of the pieces of `@rc-component/form`'s
 `utils/valueUtil`, `utils/NameMap` and `@rc-component/util`'s `get`/`set`/
 `merge` that this repository actually exercises. Everything here is pure and
 dependency-free apart from `lodash-es`, so the engine carries no antd/rc
 runtime.

 The one semantic that MUST NOT drift is `set`'s immutable copy-on-write with
 numeric-segment array creation: `setValue({}, ['a', 0, 'b'], 1)` has to
 produce `{ a: [{ b: 1 }] }`, not `{ a: { '0': { b: 1 } } }`. 68 call sites
 use array name paths and 43 of those are dynamic, so a plain object write
 would silently reshape Form.List values.
 */

/** A single addressable segment of a field path. */
export type NamePathSegment = string | number;
/** Normalised, always-array internal path — what `errorFields[].name` carries. */
export type InternalNamePath = NamePathSegment[];

export type BaseNamePath =
  string | number | boolean | (string | number | boolean)[];

/**
 * antd's own deep path type, copied so the public `NamePath` behaves
 * IDENTICALLY at every call site.
 *
 * Worth knowing what it actually does: for a typed store it walks up to three
 * levels and produces the literal tuples that store admits, but for the
 * untyped `FormInstance` (`Store = any` — which is every call site in this
 * repo) the whole conditional collapses to `any`. That collapse is why
 * expressions like `[listName, index, 'variable']`, where `listName` is itself
 * typed `NamePath`, type-check today. A stricter definition here would be more
 * honest and would reject ~30 correct call sites, turning a zero-diff import
 * swap into a typing project. Ticket 35 is the place to tighten it, together
 * with typing the stores.
 */
export type DeepNamePath<
  Store = any,
  ParentNamePath extends any[] = [],
> = ParentNamePath['length'] extends 3
  ? never
  : true extends (Store extends BaseNamePath ? true : false)
    ? ParentNamePath['length'] extends 0
      ? Store | BaseNamePath
      : Store extends any[]
        ? [...ParentNamePath, number]
        : never
    : Store extends any[]
      ? | [...ParentNamePath, number]
        | DeepNamePath<Store[number], [...ParentNamePath, number]>
      : keyof Store extends never
        ? Store
        : {
            [FieldKey in keyof Store]: Store[FieldKey] extends (
              ...args: any[]
            ) => any
              ? never
              : | (ParentNamePath['length'] extends 0 ? FieldKey : never)
                | [...ParentNamePath, FieldKey]
                | DeepNamePath<
                    Required<Store>[FieldKey],
                    [...ParentNamePath, FieldKey]
                  >;
          }[keyof Store];

/** Public name path shape accepted by every engine API. */
export type NamePath<Store = any> = DeepNamePath<Store>;

/** Arbitrary form value store. Values are never coerced (Relay objects live here). */
export type Store = Record<string, any>;

export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

/**
 * `'a'` -> `['a']`, `123` -> `[123]`, `['a', 123]` -> `['a', 123]`.
 * Deliberately NOT dot-splitting: `'a.b'` stays a single segment, matching
 * rc-field-form (its `getNamePath` is `toArray`, nothing more).
 */
export function getNamePath(
  path: NamePath | undefined | null,
): InternalNamePath {
  return toArray(path as NamePathSegment);
}

export function getValue(entity: any, path: InternalNamePath): any {
  let current = entity;
  for (let i = 0; i < path.length; i += 1) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[path[i]];
  }
  return current;
}

function internalSet(
  entity: any,
  paths: InternalNamePath,
  value: any,
  removeIfUndefined: boolean,
): any {
  if (!paths.length) {
    return value;
  }
  const [path, ...restPath] = paths;
  let clone: any;
  if (!entity && typeof path === 'number') {
    clone = [];
  } else if (Array.isArray(entity)) {
    clone = [...entity];
  } else {
    clone = { ...entity };
  }

  // `removeIfUndefined` deletes the key instead of writing `undefined` — this
  // is what makes `preserve={false}` drop the key from `getFieldsValue()`
  // rather than leaving `{ field: undefined }`.
  if (removeIfUndefined && value === undefined && restPath.length === 1) {
    delete clone[path][restPath[0]];
  } else {
    clone[path] = internalSet(clone[path], restPath, value, removeIfUndefined);
  }
  return clone;
}

export function setValue<T = Store>(
  entity: T,
  paths: InternalNamePath,
  value: any,
  removeIfUndefined = false,
): T {
  if (
    paths.length &&
    removeIfUndefined &&
    value === undefined &&
    !getValue(entity, paths.slice(0, -1))
  ) {
    return entity;
  }
  return internalSet(entity, paths, value, removeIfUndefined);
}

function isPlainObject(obj: any): boolean {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Object.getPrototypeOf(obj) === Object.prototype
  );
}

function createEmpty(source: any): any {
  return Array.isArray(source) ? [] : {};
}

/**
 * Deep merge with ARRAY REPLACEMENT (not concatenation / index merge).
 * This is the semantic behind acceptance test 12: `setFieldsValue({resource:
 * {...}})` partially merges the `resource` object but wholesale replaces any
 * array it contains. Non-plain objects (class instances, Relay records) are
 * assigned by reference — `environments.image` holds a whole Relay object.
 */
export function merge<T = Store>(...sources: any[]): T {
  let clone: any = createEmpty(sources[0]);

  sources.forEach((src) => {
    const walk = (path: InternalNamePath, loop: Set<any>) => {
      const loopSet = new Set(loop);
      const value = getValue(src, path);
      const isArr = Array.isArray(value);
      if (isArr || isPlainObject(value)) {
        if (loopSet.has(value)) {
          return;
        }
        loopSet.add(value);
        const originValue = getValue(clone, path);
        if (isArr) {
          clone = setValue(clone, path, []);
        } else if (!originValue || typeof originValue !== 'object') {
          clone = setValue(clone, path, createEmpty(value));
        }
        Reflect.ownKeys(value as object).forEach((key) => {
          if (Object.getOwnPropertyDescriptor(value, key)?.enumerable) {
            walk([...path, key as NamePathSegment], loopSet);
          }
        });
      } else {
        clone = setValue(clone, path, value);
      }
    };
    walk([], new Set());
  });

  return clone as T;
}

/** Build a store containing only the given paths (used by `validateFields`' resolve value). */
export function cloneByNamePathList(
  store: Store,
  namePathList: InternalNamePath[],
): Store {
  let newStore: Store = {};
  namePathList.forEach((namePath) => {
    const value = getValue(store, namePath);
    newStore = setValue(newStore, namePath, value);
  });
  return newStore;
}

/**
 * Is `namePath` equal to (or, with `partialMatch`, prefixed by) `subNamePath`?
 * `partialMatch` is what makes `validateFields(['resource'], {recursive:true})`
 * reach `['resource','cpu']` (acceptance test 23).
 */
export function matchNamePath(
  namePath: InternalNamePath | undefined | null,
  subNamePath: InternalNamePath | undefined | null,
  partialMatch = false,
): boolean {
  if (!namePath || !subNamePath) {
    return false;
  }
  if (!partialMatch && namePath.length !== subNamePath.length) {
    return false;
  }
  return subNamePath.every((nameUnit, i) => namePath[i] === nameUnit);
}

export function containsNamePath(
  namePathList: InternalNamePath[] | undefined | null,
  namePath: InternalNamePath,
  partialMatch = false,
): boolean {
  return (
    !!namePathList &&
    namePathList.some((path) => matchNamePath(namePath, path, partialMatch))
  );
}

/**
 * Pull the next value out of a control's change payload. Mirrors
 * rc-field-form: DOM-ish events expose the value under `event.target[
 * valuePropName]` (so `valuePropName="checked"` reads `target.checked`),
 * everything else is passed through as-is.
 */
export function defaultGetValueFromEvent(
  valuePropName: string,
  ...args: any[]
): any {
  const event = args[0];
  if (
    event &&
    event.target &&
    typeof event.target === 'object' &&
    valuePropName in event.target
  ) {
    return (event.target as any)[valuePropName];
  }
  return event;
}

const SPLIT = '__@field_split__';

function normalizeKey(namePath: InternalNamePath): string {
  // The `typeof` prefix keeps `['a', 0]` and `['a', '0']` distinct keys —
  // Form.List indices are numbers and object keys are strings.
  return namePath.map((cell) => `${typeof cell}:${cell}`).join(SPLIT);
}

/** `Map` keyed by name path. */
export default class NameMap<T> {
  private kvs = new Map<string, T>();

  set(key: InternalNamePath, value: T) {
    this.kvs.set(normalizeKey(key), value);
  }

  get(key: InternalNamePath): T | undefined {
    return this.kvs.get(normalizeKey(key));
  }

  /** The entry at `key` plus every entry nested underneath it. */
  getAsPrefix(key: InternalNamePath): T[] {
    const normalizedKey = normalizeKey(key);
    const normalizedPrefix = normalizedKey + SPLIT;
    const results: T[] = [];
    const current = this.kvs.get(normalizedKey);
    if (current !== undefined) {
      results.push(current);
    }
    this.kvs.forEach((value, itemNormalizedKey) => {
      if (itemNormalizedKey.startsWith(normalizedPrefix)) {
        results.push(value);
      }
    });
    return results;
  }

  update(key: InternalNamePath, updater: (origin: T | undefined) => T | null) {
    const origin = this.get(key);
    const next = updater(origin);
    if (!next) {
      this.delete(key);
    } else {
      this.set(key, next);
    }
  }

  delete(key: InternalNamePath) {
    this.kvs.delete(normalizeKey(key));
  }

  map<U>(callback: (entry: { key: InternalNamePath; value: T }) => U): U[] {
    return [...this.kvs.entries()].map(([key, value]) => {
      const cells = key.split(SPLIT);
      return callback({
        key: cells.map((cell) => {
          const [, type, unit] = /^([^:]*):(.*)$/.exec(cell) as RegExpExecArray;
          return type === 'number' ? Number(unit) : unit;
        }),
        value,
      });
    });
  }
}
