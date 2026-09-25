/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.
 */
import { buildPath, MENU_KEY_TO_SCOPE_FEATURE } from './pathBuilder';

export type NavigationTarget =
  { ok: true; to: string } | { ok: false; code: string; message: string };

/** Menu keys that are routes. `pipeline` opens an external window instead. */
export const isNavigableMenuKey = (key: string): boolean =>
  key !== 'pipeline' &&
  Object.prototype.hasOwnProperty.call(MENU_KEY_TO_SCOPE_FEATURE, key);

const notAllowed = (message: string): NavigationTarget => ({
  ok: false,
  code: 'path_not_allowed',
  message,
});

/**
 * Resolves `bai_navigate`'s `path` to an in-app location. Only the
 * `/project/<name>/…` and `/admin/…` subtrees are reachable, which keeps out
 * routes that act on arrival (`/applauncher`, `/interactive-login`, …). A
 * flat menu path such as `/session?x=1` is rebased onto the active project,
 * as the in-app links do.
 */
export const resolveAppPath = (
  rawPath: string,
  activeProjectName: string | undefined,
  origin: string,
): NavigationTarget => {
  if (
    !rawPath.startsWith('/') ||
    rawPath.startsWith('//') ||
    rawPath.includes('\\')
  ) {
    return notAllowed(
      '"path" must be an app path that starts with a single "/".',
    );
  }
  let url: URL;
  try {
    url = new URL(rawPath, origin);
  } catch {
    return notAllowed('"path" is not a valid URL path.');
  }
  if (url.origin !== origin) {
    return notAllowed('"path" must stay on this origin.');
  }

  const segments = url.pathname.split('/').filter(Boolean);
  const [first] = segments;
  let pathname = url.pathname;
  if (first === 'admin' || (first === 'project' && segments.length >= 2)) {
    // already scope-aware
  } else if (first && isNavigableMenuKey(first)) {
    const { scope, featureKey } = MENU_KEY_TO_SCOPE_FEATURE[first];
    if (scope !== 'admin' && !activeProjectName) {
      return {
        ok: false,
        code: 'no_project',
        message: 'No project is selected, so a project page cannot be opened.',
      };
    }
    pathname = [
      buildPath(scope, featureKey, activeProjectName),
      ...segments.slice(1),
    ].join('/');
  } else {
    return notAllowed(
      '"path" must be under /project/<name>/ or /admin/, or start with a menu key such as /session.',
    );
  }
  return { ok: true, to: `${pathname}${url.search}${url.hash}` };
};

/** Collects the searchParams of a location; repeated keys become arrays. */
export const searchParamsToRecord = (
  search: string,
): Record<string, string | Array<string>> => {
  const record: Record<string, string | Array<string>> = {};
  new URLSearchParams(search).forEach((value, key) => {
    const existing = record[key];
    record[key] =
      existing === undefined
        ? value
        : Array.isArray(existing)
          ? [...existing, value]
          : [existing, value];
  });
  return record;
};

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
const CHROME_SELECTOR =
  'nav, header, aside, [role="navigation"], [role="banner"]';

/** Text of the highest-level visible heading outside the app chrome. */
export const readMainHeading = (root: ParentNode = document): string | null => {
  let bestLevel = Number.POSITIVE_INFINITY;
  let bestText: string | null = null;
  for (const element of Array.from(
    root.querySelectorAll<HTMLElement>(HEADING_SELECTOR),
  )) {
    if (element.closest(CHROME_SELECTOR)) continue;
    if (element.checkVisibility && !element.checkVisibility()) continue;
    const text = element.textContent?.trim();
    if (!text) continue;
    const level =
      Number(element.getAttribute('aria-level')) ||
      Number(element.tagName.slice(1));
    if (level < bestLevel) {
      bestLevel = level;
      bestText = text;
    }
  }
  return bestText ? bestText.slice(0, 200) : null;
};
