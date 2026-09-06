/**
 * Keep the driver's filesystem out of the block.
 *
 * react-grab normalises a frame's file URL by dropping the origin and any
 * single-segment mount, so a module inside the Vite root (`react/`) arrives as
 * `/src/components/Foo.tsx` while one outside it — every workspace package —
 * is served through Vite's `/@fs/<absolute path>` mount and arrives as the
 * driver's absolute path. That path is the reviewer's working directory, and
 * the block it lands in is a public PR comment.
 *
 * The root comes from `/__review/state`. When it is not known — the fetch has
 * not answered yet, or it failed — nothing here can tell a repository path
 * from a home directory, so the location is dropped rather than guessed at.
 */

/** react-grab's frame shape: `  in Foo (at <path>)`. The name is the useful half. */
const FRAME_SOURCE_RE = /\s*\(at [^)]*\)/g;

const rootPrefix = (root: string | null | undefined) =>
  (root ?? '').replace(/\/+$/, '');

/** One `getStackContext()` line, made repository-relative or stripped of its path. */
export function relativizeSourcePaths(
  text: string,
  root: string | null | undefined,
): string {
  const prefix = rootPrefix(root);
  // Split/join, not a regex: the root is a filesystem path, not a pattern.
  if (prefix) return text.split(`${prefix}/`).join('');
  // A frame with no path still names the component, which is what the ⚛️
  // stack is read for; an absolute path is what must never survive.
  return text.replace(FRAME_SOURCE_RE, '');
}

/**
 * `getSource()`'s bare `file:line:col`, which has no component name to fall
 * back on: with no root it is the whole leak, so it is dropped entirely and
 * the anchor carries the component without a source location.
 */
export function relativizeSourceLocation(
  location: string,
  root: string | null | undefined,
): string | undefined {
  const prefix = rootPrefix(root);
  if (!prefix) return undefined;
  return location.split(`${prefix}/`).join('');
}
