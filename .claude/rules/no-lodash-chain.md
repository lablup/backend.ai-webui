# No `_.chain()` Usage

Do not use `_.chain()` from Lodash. It is incompatible with `lodash-es` tree-shaking and bundles the entire Lodash library.

## Why

`_.chain()` requires the full Lodash build to work because it wraps the value in a Lodash wrapper object that needs access to all methods. This defeats the purpose of importing from `lodash-es`, which enables per-function tree-shaking. An ESLint rule (`no-restricted-syntax`) already enforces this.

## Instead

Use native JavaScript array methods (`.map()`, `.filter()`, `.reduce()`, etc.) or standalone Lodash function imports:

```tsx
// ❌ Breaks tree-shaking
_.chain(items)
  .map(transform)
  .filter(predicate)
  .value();

// ✅ Native array methods
items
  .map(transform)
  .filter(predicate);

// ✅ Standalone Lodash functions for complex operations
_.sortBy(_.map(items, transform), iteratee);
```
