/**
 * lucide-react ships no `.d.ts` beside its per-icon ESM entries, and
 * `icons.test.ts` reads exactly those to prove the overlay's inlined copies
 * still match. Only the shape the test uses is declared.
 */
declare module 'lucide-react/dist/esm/icons/*.mjs' {
  export const __iconNode: Array<[string, Record<string, string>]>;
}
