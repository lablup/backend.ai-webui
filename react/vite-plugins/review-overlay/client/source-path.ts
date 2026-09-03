/**
 * Make react-grab's source paths repository-relative.
 *
 * react-grab normalises a frame's file URL by dropping the origin and any
 * single-segment mount, so a module inside the Vite root (`react/`) arrives as
 * `/src/components/Foo.tsx` while one outside it — every workspace package —
 * is served through Vite's `/@fs/<absolute path>` mount and arrives as the
 * driver's absolute path. That path is the reviewer's working directory, and
 * the block it lands in is a public PR comment.
 */

/** The repository root, from `/__review/state`; absent means leave paths alone. */
export function relativizeSourcePaths(
  text: string,
  root: string | null | undefined,
): string {
  const prefix = (root ?? '').replace(/\/+$/, '');
  if (!prefix) return text;
  // Split/join, not a regex: the root is a filesystem path, not a pattern.
  return text.split(`${prefix}/`).join('');
}
