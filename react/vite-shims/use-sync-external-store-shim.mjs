// ESM shim for `use-sync-external-store/shim` (CJS-only export path).
//
// Why this exists: the Vite PoC excludes `react-i18next` from dep
// optimization (to preserve two physical copies for BUI i18n context
// isolation). `react-i18next`'s ESM bundle imports
// `useSyncExternalStore` from `use-sync-external-store/shim`, which is a
// CJS file with `process.env.NODE_ENV` branching and `require(...)`
// dispatch. When its parent is excluded, Vite's optimizer doesn't
// transform it, and the browser fails to import it as ESM.
//
// This shim re-exports React's native `useSyncExternalStore` (stable
// since 18.0). The WebUI targets React 19.x, so the shim package's
// React-17-compat polyfill is not needed — the native hook is identical
// in behaviour for our use cases.
export { useSyncExternalStore } from 'react';
