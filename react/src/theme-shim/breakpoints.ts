/**
 @license
 Copyright (c) 2015-2026 Lablup Inc. All rights reserved.

 GAP COMPONENT 2/5 (cn-oss-removal / ticket 10) — breakpoint tokens +
 `useBAIBreakpoint`.

 MAPPING.md §3.9 / §2: `Grid.useBreakpoint` (18 files) is verdict **NONE**, and
 so is every `xs`/`sm`/`md`/`lg`/`xl`/`xxl` prop on `Row`/`Col` (79 of 86
 sites). **Astryx has no breakpoint system and no `screen*` tokens at all** —
 `useMediaQuery(rawCssQuery)` takes a raw CSS string and knows nothing about
 named steps. So the breakpoints are OURS to own, exactly like the 19 names in
 `selfTokens.ts` (which already carries `screenXS` / `screenSM` with verdict
 `self`).

 The values below are Ant Design's own defaults, which is what the app's
 layout is currently tuned against — day-1 parity, and every later change is a
 deliberate design decision rather than an accident of the migration.

 RETURN SHAPE — deliberately antd's `{xs, sm, md, lg, xl, xxl}` booleans.
 The wrapper policy ("base props on Astryx's, never antd's") is about
 COMPONENTS, whose props are a public API that Astryx also defines. Here
 Astryx defines nothing: the token system is self-defined, so there is no
 Astryx shape to be faithful to. Mirroring antd's shape makes all 18 call
 sites a pure import swap (`Grid.useBreakpoint()` -> `useBAIBreakpoint()`),
 with `const { lg } = ...` / `const screens = ...` untouched.

 SSR / first-render — we deliberately do BETTER than Astryx's `useMediaQuery`.
 That hook returns `false` on first render and corrects in an effect, so a tree
 that BRANCHES on a breakpoint flashes the wrong layout for one frame
 (MAPPING.md §3.9 flags this as a behaviour change, and 18 call sites branch
 exactly that way — `BAISider`, `WebUIHeader`, `FolderExplorerModal` …).
 `useSyncExternalStore` reads `matchMedia` synchronously during render in the
 browser, so the first paint is already correct. The SSR snapshot is a frozen
 all-false object; this app is a client-rendered Vite SPA with no hydration
 pass, so there is no mismatch to pay for. If SSR is ever added, pass a
 server-side hint through `getServerSnapshot` the way Astryx's `serverDefault`
 does.
*/
import { useSyncExternalStore } from 'react';

export type BAIBreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Minimum viewport width (px) at which each step becomes active.
 * `xs` is the floor: it is defined by its MAX, not its min (see the queries).
 *
 * Ant Design's defaults, verbatim — the values the app's 79 responsive
 * `Row`/`Col` props and 18 `Grid.useBreakpoint()` call sites are tuned to.
 */
export const BAI_BREAKPOINTS: Readonly<Record<BAIBreakpointKey, number>> =
  Object.freeze({
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  });

export const BAI_BREAKPOINT_KEYS: ReadonlyArray<BAIBreakpointKey> =
  Object.freeze(['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const);

/**
 * The media query per step, matching antd's `responsiveObserver`:
 * `xs` is `max-width` bounded (true ONLY below `sm`), every other step is
 * `min-width` bounded and therefore cumulative — at 1280px, `sm` `md` `lg`
 * `xl` are all true and `xs` `xxl` are false.
 *
 * The `.98` on the `xs` ceiling is antd's own guard against fractional device
 * pixel ratios leaving a 1px band where neither `xs` nor `sm` matches.
 */
export const BAI_BREAKPOINT_QUERIES: Readonly<
  Record<BAIBreakpointKey, string>
> = Object.freeze({
  xs: `(max-width: ${BAI_BREAKPOINTS.sm - 0.02}px)`,
  sm: `(min-width: ${BAI_BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BAI_BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BAI_BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BAI_BREAKPOINTS.xl}px)`,
  xxl: `(min-width: ${BAI_BREAKPOINTS.xxl}px)`,
});

/** Same shape antd's `Grid.useBreakpoint()` returns. */
export type BAIScreenMap = Record<BAIBreakpointKey, boolean>;

const SERVER_SNAPSHOT: BAIScreenMap = Object.freeze({
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  xxl: false,
});

/**
 * `useSyncExternalStore` requires `getSnapshot` to return a REFERENTIALLY
 * STABLE value while nothing changed — returning a fresh object every call is
 * an infinite render loop. So the store is a module singleton that recomputes
 * the map only when a `MediaQueryList` actually fires.
 */
let cachedSnapshot: BAIScreenMap | null = null;
let mediaQueryLists: Array<MediaQueryList> | null = null;

function getMediaQueryLists(): Array<MediaQueryList> {
  if (!mediaQueryLists) {
    mediaQueryLists = BAI_BREAKPOINT_KEYS.map((key) =>
      window.matchMedia(BAI_BREAKPOINT_QUERIES[key]),
    );
  }
  return mediaQueryLists;
}

function computeSnapshot(): BAIScreenMap {
  const lists = getMediaQueryLists();
  return BAI_BREAKPOINT_KEYS.reduce((acc, key, i) => {
    acc[key] = lists[i].matches;
    return acc;
  }, {} as BAIScreenMap);
}

function getSnapshot(): BAIScreenMap {
  if (!cachedSnapshot) cachedSnapshot = computeSnapshot();
  return cachedSnapshot;
}

function getServerSnapshot(): BAIScreenMap {
  return SERVER_SNAPSHOT;
}

function subscribe(onStoreChange: () => void): () => void {
  const handler = () => {
    const next = computeSnapshot();
    // Only publish a new object identity when a boolean actually flipped, so a
    // resize inside one step does not re-render 18 components for nothing.
    const changed =
      !cachedSnapshot ||
      BAI_BREAKPOINT_KEYS.some((key) => cachedSnapshot?.[key] !== next[key]);
    if (changed) {
      cachedSnapshot = next;
      onStoreChange();
    }
  };
  const lists = getMediaQueryLists();
  lists.forEach((list) => list.addEventListener('change', handler));
  return () => {
    lists.forEach((list) => list.removeEventListener('change', handler));
  };
}

/**
 * Drop-in replacement for antd's `Grid.useBreakpoint()`.
 *
 * Unlike antd's, every key is always present (antd returned a `Partial`), so
 * `screens.md` is a `boolean` rather than `boolean | undefined` — destructuring
 * call sites are unaffected, and the few that did `screens.md ?? true` can drop
 * the fallback.
 *
 * @example
 * const { lg } = useBAIBreakpoint();
 * const screens = useBAIBreakpoint();
 */
export function useBAIBreakpoint(): BAIScreenMap {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * The largest active step — handy where a call site wants one value rather
 * than a map (`Row`/`Col` responsive props will need this when they land).
 */
export function useBAIActiveBreakpoint(): BAIBreakpointKey {
  const screens = useBAIBreakpoint();
  let active: BAIBreakpointKey = 'xs';
  BAI_BREAKPOINT_KEYS.forEach((key) => {
    if (key !== 'xs' && screens[key]) active = key;
  });
  return active;
}
