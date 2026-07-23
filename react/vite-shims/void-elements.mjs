// ESM shim for `void-elements` (CJS-only package).
//
// Why this exists: the Vite PoC excludes `react-i18next` from dep
// optimization so two physical copies can exist (one per pnpm peer-version
// store path) — that's what keeps BUI's `<I18nextProvider>` context
// isolated from the host tree. The side effect is that
// `html-parse-stringify`'s ESM file does `import e from "void-elements"`,
// and `void-elements@3.1.0` is pure CJS (`module.exports = {...}`, no ESM
// variant). When its parent is excluded, Vite's optimizer never converts
// this leaf to ESM — browsers then error with
// "does not provide an export named 'default'".
//
// This shim replaces the import entirely. `void-elements` is a plain
// lookup object of HTML void-element tag names; reproducing it as ESM
// is trivial and avoids running any CJS interop at all.
//
// Kept in sync with node_modules/.pnpm/void-elements@3.1.0/.../index.js.
export default {
  area: true,
  base: true,
  br: true,
  col: true,
  embed: true,
  hr: true,
  img: true,
  input: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
};
