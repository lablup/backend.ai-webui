/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 Path + store primitives for the self-hosted form engine (to-astryx ticket 34).

 Byte-for-byte behavioural port of the pieces of rc-component's `form`
 `utils/valueUtil`, `utils/NameMap` and rc-component's `util` `get`/`set`/
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
export type BaseNamePath = string | number | boolean | (string | number | boolean)[];
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
export type DeepNamePath<Store = any, ParentNamePath extends any[] = []> = ParentNamePath['length'] extends 3 ? never : true extends (Store extends BaseNamePath ? true : false) ? ParentNamePath['length'] extends 0 ? Store | BaseNamePath : Store extends any[] ? [...ParentNamePath, number] : never : Store extends any[] ? [...ParentNamePath, number] | DeepNamePath<Store[number], [...ParentNamePath, number]> : keyof Store extends never ? Store : {
    [FieldKey in keyof Store]: Store[FieldKey] extends (...args: any[]) => any ? never : (ParentNamePath['length'] extends 0 ? FieldKey : never) | [...ParentNamePath, FieldKey] | DeepNamePath<Required<Store>[FieldKey], [
        ...ParentNamePath,
        FieldKey
    ]>;
}[keyof Store];
/** Public name path shape accepted by every engine API. */
export type NamePath<Store = any> = DeepNamePath<Store>;
/** Arbitrary form value store. Values are never coerced (Relay objects live here). */
export type Store = Record<string, any>;
export declare function toArray<T>(value: T | T[] | undefined | null): T[];
/**
 * `'a'` -> `['a']`, `123` -> `[123]`, `['a', 123]` -> `['a', 123]`.
 * Deliberately NOT dot-splitting: `'a.b'` stays a single segment, matching
 * rc-field-form (its `getNamePath` is `toArray`, nothing more).
 */
export declare function getNamePath(path: NamePath | undefined | null): InternalNamePath;
/**
 * The `data-bai-field-id` handle `FormItem` stamps on a control and
 * `FormStore.getFieldDOMNode` looks up. Not the DOM `id` (`getFieldId`),
 * which adds the form's `name` and a `parentNode` guard the store cannot
 * reproduce.
 */
export declare function getFieldHandle(namePath: InternalNamePath): string;
export declare function getValue(entity: any, path: InternalNamePath): any;
export declare function setValue<T = Store>(entity: T, paths: InternalNamePath, value: any, removeIfUndefined?: boolean): T;
/**
 * Deep merge with ARRAY REPLACEMENT (not concatenation / index merge).
 * This is the semantic behind acceptance test 12: `setFieldsValue({resource:
 * {...}})` partially merges the `resource` object but wholesale replaces any
 * array it contains. Non-plain objects (class instances, Relay records) are
 * assigned by reference — `environments.image` holds a whole Relay object.
 */
export declare function merge<T = Store>(...sources: any[]): T;
/** Build a store containing only the given paths (used by `validateFields`' resolve value). */
export declare function cloneByNamePathList(store: Store, namePathList: InternalNamePath[]): Store;
/**
 * Is `namePath` equal to (or, with `partialMatch`, prefixed by) `subNamePath`?
 * `partialMatch` is what makes `validateFields(['resource'], {recursive:true})`
 * reach `['resource','cpu']` (acceptance test 23).
 */
export declare function matchNamePath(namePath: InternalNamePath | undefined | null, subNamePath: InternalNamePath | undefined | null, partialMatch?: boolean): boolean;
export declare function containsNamePath(namePathList: InternalNamePath[] | undefined | null, namePath: InternalNamePath, partialMatch?: boolean): boolean;
/**
 * Pull the next value out of a control's change payload. Mirrors
 * rc-field-form: DOM-ish events expose the value under `event.target[
 * valuePropName]` (so `valuePropName="checked"` reads `target.checked`),
 * everything else is passed through as-is.
 */
export declare function defaultGetValueFromEvent(valuePropName: string, ...args: any[]): any;
/** `Map` keyed by name path. */
export default class NameMap<T> {
    private kvs;
    set(key: InternalNamePath, value: T): void;
    get(key: InternalNamePath): T | undefined;
    /** The entry at `key` plus every entry nested underneath it. */
    getAsPrefix(key: InternalNamePath): T[];
    update(key: InternalNamePath, updater: (origin: T | undefined) => T | null): void;
    delete(key: InternalNamePath): void;
    map<U>(callback: (entry: {
        key: InternalNamePath;
        value: T;
    }) => U): U[];
}
