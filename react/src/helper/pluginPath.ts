/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */

/**
 * A plugin entry is a path relative to `/dist/plugins/` without the `.js`
 * extension: `folder/sub/file` or just `file`. Every segment is
 * `[a-zA-Z0-9_-]+`, which rules out `.`/`..`, empty segments and a leading
 * or trailing slash, so the resolved URL never leaves the plugins directory.
 */
const PLUGIN_PATH_PATTERN = /^[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*$/;

export const isValidPluginPath = (path: string): boolean =>
  PLUGIN_PATH_PATTERN.test(path);

/** The last segment: the custom element name and the route of a page plugin. */
export const pluginPathName = (path: string): string =>
  path.slice(path.lastIndexOf('/') + 1);

export const splitPluginPath = (
  path: string,
): { folder: string; file: string } => {
  const at = path.lastIndexOf('/');
  return at < 0
    ? { folder: '', file: path }
    : { folder: path.slice(0, at), file: path.slice(at + 1) };
};

/** Trims stray slashes so `/a/`, `b` becomes `a/b` and `''`, `b` becomes `b`. */
export const joinPluginPath = (folder: string, file: string): string => {
  const cleanFolder = folder.trim().replace(/^\/+|\/+$/g, '');
  const cleanFile = file.trim().replace(/^\/+|\/+$/g, '');
  return cleanFolder ? `${cleanFolder}/${cleanFile}` : cleanFile;
};

/**
 * The script URL for a valid plugin path, or `undefined` when the path is
 * rejected. Electron has no origin of its own, so it loads from the API host.
 */
export const resolvePluginScriptUrl = (
  path: string,
  apiEndpoint?: string | null,
): string | undefined => {
  if (!isValidPluginPath(path)) return undefined;
  const isElectron = !!(globalThis as Record<string, unknown>).isElectron;
  return isElectron && apiEndpoint
    ? `${apiEndpoint}/dist/plugins/${path}.js`
    : `/dist/plugins/${path}.js`;
};
